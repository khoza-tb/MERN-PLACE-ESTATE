
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function CreateListing() {
  const { currentUser } = useSelector(
    (state) => state.user
  );

  const navigate = useNavigate();

  const [files, setFiles] = useState([]);

  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    description: "",
    address: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,

    // =========================
    // LOCATION
    // =========================
    latitude: 0,
    longitude: 0,
  });

  const [uploading, setUploading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [locationFound, setLocationFound] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const CLOUD_NAME =
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim();

  const UPLOAD_PRESET =
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim();

  // =========================================================
  // GEOCODE ADDRESS
  // =========================================================

  const handleGeocodeAddress = async () => {
    const address = formData.address.trim();

    if (!address) {
      setError(
        "Please enter a property address first."
      );
      return;
    }

    try {
      setGeocoding(true);
      setError("");
      setLocationFound(false);

      const url =
        `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          format: "json",
          limit: "1",
          q: address,
        }).toString();

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          "Unable to find the property location."
        );
      }

      const results = await response.json();

      if (!results || results.length === 0) {
        setError(
          "Location not found. Please enter a more complete address, for example: 123 Church Street, Pretoria, South Africa."
        );
        return;
      }

      const location = results[0];

      const latitude = Number(location.lat);
      const longitude = Number(location.lon);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        throw new Error(
          "Invalid coordinates returned for this address."
        );
      }

      setFormData((previous) => ({
        ...previous,
        latitude,
        longitude,
      }));

      setLocationFound(true);

      console.log(
        "GEOCODED LOCATION:",
        location.display_name
      );

      console.log("LATITUDE:", latitude);
      console.log("LONGITUDE:", longitude);
    } catch (err) {
      console.error(
        "GEOCODING ERROR:",
        err
      );

      setError(
        err?.message ||
          "Failed to find this address."
      );
    } finally {
      setGeocoding(false);
    }
  };

  // =========================================================
  // IMAGE UPLOAD
  // =========================================================

  const handleImageSubmit = async () => {
    if (!files || files.length === 0) {
      setError(
        "Please select at least one image before clicking upload."
      );
      return;
    }

    if (
      files.length +
        formData.imageUrls.length >
      6
    ) {
      setError(
        "You can only upload a maximum of 6 images per listing."
      );
      return;
    }

    setUploading(true);
    setError("");

    try {
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(
          storeImage(files[i])
        );
      }

      const urls =
        await Promise.all(promises);

      setFormData((previous) => ({
        ...previous,
        imageUrls: [
          ...previous.imageUrls,
          ...urls,
        ],
      }));

      setFiles([]);
    } catch (err) {
      console.error(
        "IMAGE UPLOAD ERROR:",
        err
      );

      setError(
        err?.message ||
          "Image upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  // =========================================================
  // CLOUDINARY
  // =========================================================

  const storeImage = async (file) => {
    if (!CLOUD_NAME) {
      throw new Error(
        "Cloudinary cloud name is missing. Check VITE_CLOUDINARY_CLOUD_NAME in your frontend .env file."
      );
    }

    if (!UPLOAD_PRESET) {
      throw new Error(
        "Cloudinary upload preset is missing. Check VITE_CLOUDINARY_UPLOAD_PRESET in your frontend .env file."
      );
    }

    if (!file) {
      throw new Error(
        "No image file was selected."
      );
    }

    const data = new FormData();

    data.append("file", file);
    data.append(
      "upload_preset",
      UPLOAD_PRESET
    );

    const uploadUrl =
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    console.log(
      "Uploading image to Cloudinary:",
      uploadUrl
    );

    const response = await fetch(
      uploadUrl,
      {
        method: "POST",
        body: data,
      }
    );

    const result =
      await response.json();

    console.log(
      "CLOUDINARY RESPONSE:",
      result
    );

    if (!response.ok) {
      const cloudinaryMessage =
        result?.error?.message ||
        "Cloudinary upload failed.";

      if (
        cloudinaryMessage
          .toLowerCase()
          .includes("cloud_name is disabled")
      ) {
        throw new Error(
          "Cloudinary has disabled this cloud name. Check VITE_CLOUDINARY_CLOUD_NAME in your .env file and make sure it is your active Cloudinary cloud name."
        );
      }

      throw new Error(
        cloudinaryMessage
      );
    }

    if (result?.secure_url) {
      return result.secure_url;
    }

    throw new Error(
      result?.error?.message ||
        "Cloudinary did not return an image URL."
    );
  };

  // =========================================================
  // REMOVE IMAGE
  // =========================================================

  const handleRemoveImage = (index) => {
    setFormData((previous) => ({
      ...previous,
      imageUrls:
        previous.imageUrls.filter(
          (_, i) => i !== index
        ),
    }));
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { id, type, value, checked } =
      e.target;

    // Sale / Rent
    if (
      id === "sale" ||
      id === "rent"
    ) {
      setFormData((previous) => ({
        ...previous,
        type: id,
      }));

      return;
    }

    // Checkboxes
    if (
      id === "parking" ||
      id === "furnished" ||
      id === "offer"
    ) {
      setFormData((previous) => ({
        ...previous,
        [id]: checked,
      }));

      return;
    }

    // Numbers
    if (type === "number") {
      setFormData((previous) => ({
        ...previous,
        [id]:
          value === ""
            ? ""
            : Number(value),
      }));

      return;
    }

    // Text / textarea
    setFormData((previous) => ({
      ...previous,
      [id]: value,
    }));

    // If address changes, previous coordinates
    // may no longer be correct.
    if (id === "address") {
      setLocationFound(false);

      setFormData((previous) => ({
        ...previous,
        address: value,
        latitude: 0,
        longitude: 0,
      }));
    }
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Authentication
    if (!currentUser?._id) {
      setError(
        "You must be signed in to create a listing."
      );
      return;
    }

    // Images
    if (
      formData.imageUrls.length < 1
    ) {
      setError(
        "You must upload at least one image."
      );
      return;
    }

    // Location
    if (
      !Number.isFinite(
        Number(formData.latitude)
      ) ||
      !Number.isFinite(
        Number(formData.longitude)
      ) ||
      Number(formData.latitude) === 0 ||
      Number(formData.longitude) === 0
    ) {
      setError(
        "Please find the property location before creating the listing."
      );
      return;
    }

    // Offer validation
    if (
      formData.offer &&
      Number(formData.discountPrice) >=
        Number(formData.regularPrice)
    ) {
      setError(
        "Discount price must be lower than regular price."
      );
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "/api/listing/create",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            ...formData,

            latitude: Number(
              formData.latitude
            ),

            longitude: Number(
              formData.longitude
            ),
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message ||
            "Failed to create listing."
        );
      }

      if (
        data.success === false
      ) {
        throw new Error(
          data.message ||
            "Failed to create listing."
        );
      }

      navigate(
        `/listing/${data._id}`
      );
    } catch (err) {
      console.error(
        "CREATE LISTING ERROR:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while creating the listing."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-3 max-w-5xl mx-auto">

      {/* =====================================================
          TITLE
      ===================================================== */}

      <h1 className="text-3xl font-semibold text-center my-7">
        Create a Listing
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-6"
      >

        {/* ===================================================
            LEFT SIDE
        =================================================== */}

        <div className="flex flex-col gap-4 flex-1">

          {/* NAME */}

          <input
            type="text"
            placeholder="Property Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength={62}
            minLength={10}
            required
            onChange={handleChange}
            value={formData.name}
          />

          {/* DESCRIPTION */}

          <textarea
            placeholder="Property Description"
            className="border p-3 rounded-lg min-h-32 resize-none"
            id="description"
            minLength={10}
            required
            onChange={handleChange}
            value={formData.description}
          />

          {/* =================================================
              ADDRESS
          ================================================= */}

          <div className="border rounded-xl p-4 bg-slate-50">

            <label className="block font-semibold text-slate-800 mb-2">
              Property Address
            </label>

            <div className="flex flex-col sm:flex-row gap-2">

              <input
                type="text"
                placeholder="e.g. 123 Church Street, Pretoria, South Africa"
                className="border bg-white p-3 rounded-lg flex-1"
                id="address"
                required
                onChange={handleChange}
                value={formData.address}
              />

              <button
                type="button"
                onClick={
                  handleGeocodeAddress
                }
                disabled={geocoding}
                className="px-5 py-3 bg-green-700 hover:bg-green-800 text-white rounded-lg font-semibold disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {geocoding
                  ? "Finding..."
                  : "Find Location"}
              </button>

            </div>

            {/* LOCATION STATUS */}

            {locationFound && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">

                <p className="text-green-700 font-semibold text-sm">
                  ✓ Location found successfully
                </p>

                <div className="grid grid-cols-2 gap-3 mt-2 text-xs text-slate-600">

                  <div>
                    <span className="font-semibold">
                      Latitude:
                    </span>{" "}
                    {Number(
                      formData.latitude
                    ).toFixed(6)}
                  </div>

                  <div>
                    <span className="font-semibold">
                      Longitude:
                    </span>{" "}
                    {Number(
                      formData.longitude
                    ).toFixed(6)}
                  </div>

                </div>

              </div>
            )}

            {!locationFound &&
              formData.address && (
                <p className="text-xs text-slate-500 mt-2">
                  Enter the complete address and click
                  <strong> Find Location</strong>.
                </p>
              )}

          </div>

          {/* =================================================
              PROPERTY TYPE
          ================================================= */}

          <div className="flex gap-6 flex-wrap">

            <label className="flex gap-2 items-center cursor-pointer">

              <input
                type="checkbox"
                id="sale"
                className="w-5 h-5"
                onChange={handleChange}
                checked={
                  formData.type ===
                  "sale"
                }
              />

              <span>Sell</span>

            </label>

            <label className="flex gap-2 items-center cursor-pointer">

              <input
                type="checkbox"
                id="rent"
                className="w-5 h-5"
                onChange={handleChange}
                checked={
                  formData.type ===
                  "rent"
                }
              />

              <span>Rent</span>

            </label>

            <label className="flex gap-2 items-center cursor-pointer">

              <input
                type="checkbox"
                id="parking"
                className="w-5 h-5"
                onChange={handleChange}
                checked={
                  formData.parking
                }
              />

              <span>Parking Spot</span>

            </label>

            <label className="flex gap-2 items-center cursor-pointer">

              <input
                type="checkbox"
                id="furnished"
                className="w-5 h-5"
                onChange={handleChange}
                checked={
                  formData.furnished
                }
              />

              <span>Furnished</span>

            </label>

            <label className="flex gap-2 items-center cursor-pointer">

              <input
                type="checkbox"
                id="offer"
                className="w-5 h-5"
                onChange={handleChange}
                checked={
                  formData.offer
                }
              />

              <span>Offer</span>

            </label>

          </div>

          {/* =================================================
              PROPERTY DETAILS
          ================================================= */}

          <div className="grid grid-cols-2 gap-4">

            {/* BEDROOMS */}

            <div>

              <label className="block text-sm font-semibold mb-2">
                Bedrooms
              </label>

              <input
                type="number"
                id="bedrooms"
                min={1}
                max={10}
                required
                className="p-3 border border-gray-300 rounded-lg w-full"
                onChange={handleChange}
                value={
                  formData.bedrooms
                }
              />

            </div>

            {/* BATHROOMS */}

            <div>

              <label className="block text-sm font-semibold mb-2">
                Bathrooms
              </label>

              <input
                type="number"
                id="bathrooms"
                min={1}
                max={10}
                required
                className="p-3 border border-gray-300 rounded-lg w-full"
                onChange={handleChange}
                value={
                  formData.bathrooms
                }
              />

            </div>

            {/* REGULAR PRICE */}

            <div>

              <label className="block text-sm font-semibold mb-2">
                Regular Price
              </label>

              <input
                type="number"
                id="regularPrice"
                min="50"
                max="1000000"
                required
                className="p-3 border border-gray-300 rounded-lg w-full"
                onChange={handleChange}
                value={
                  formData.regularPrice
                }
              />

              <p className="text-xs text-slate-500 mt-1">
                {formData.type ===
                "rent"
                  ? "R / Month"
                  : "R"}
              </p>

            </div>

            {/* DISCOUNT PRICE */}

            {formData.offer && (
              <div>

                <label className="block text-sm font-semibold mb-2">
                  Discounted Price
                </label>

                <input
                  type="number"
                  id="discountPrice"
                  min="1"
                  max="1000000"
                  required
                  className="p-3 border border-gray-300 rounded-lg w-full"
                  onChange={
                    handleChange
                  }
                  value={
                    formData.discountPrice
                  }
                />

                <p className="text-xs text-slate-500 mt-1">
                  {formData.type ===
                  "rent"
                    ? "R / Month"
                    : "R"}
                </p>

              </div>
            )}

          </div>

        </div>

        {/* ===================================================
            RIGHT SIDE
        =================================================== */}

        <div className="flex flex-col flex-1 gap-4">

          {/* =================================================
              IMAGES
          ================================================= */}

          <div>

            <p className="font-semibold">
              Images
            </p>

            <p className="text-sm text-gray-600 mb-3">
              The first image will be the cover
              (maximum 6 images)
            </p>

            <div className="flex flex-col sm:flex-row gap-3">

              <input
                onChange={(e) =>
                  setFiles(
                    e.target.files
                  )
                }
                className="p-3 border border-gray-300 rounded-lg w-full"
                type="file"
                id="images"
                accept="image/*"
                multiple
              />

              <button
                type="button"
                disabled={uploading}
                onClick={
                  handleImageSubmit
                }
                className="p-3 text-green-700 border border-green-700 rounded-lg uppercase hover:bg-green-50 disabled:opacity-60 whitespace-nowrap"
              >
                {uploading
                  ? "Uploading..."
                  : "Upload"}
              </button>

            </div>

          </div>

          {/* =================================================
              CREATE BUTTON
          ================================================= */}

          <button
            disabled={
              loading ||
              uploading ||
              geocoding
            }
            type="submit"
            className="p-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg uppercase font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? "Creating..."
              : "Create Listing"}
          </button>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">

              <p className="text-red-700 text-sm font-medium">
                {error}
              </p>

            </div>
          )}

          {/* =================================================
              UPLOADED IMAGES
          ================================================= */}

          <div className="flex flex-col gap-3">

            {formData.imageUrls.map(
              (url, index) => (
                <div
                  key={url}
                  className="flex justify-between p-3 border items-center rounded-lg bg-white"
                >

                  <div className="flex items-center gap-3">

                    <img
                      src={url}
                      alt={`Listing ${
                        index + 1
                      }`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />

                    <div>

                      <p className="font-medium text-sm">
                        Image{" "}
                        {index + 1}
                      </p>

                      {index === 0 && (
                        <p className="text-xs text-green-700 font-semibold">
                          Cover Image
                        </p>
                      )}

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveImage(
                        index
                      )
                    }
                    className="px-3 py-2 text-red-700 border border-red-200 rounded-lg text-sm hover:bg-red-50"
                  >
                    Delete
                  </button>

                </div>
              )
            )}

          </div>

        </div>

      </form>

      {/* =====================================================
          LOCATION INFORMATION
      ===================================================== */}

      <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-2xl">

        <h3 className="font-bold text-blue-900">
          📍 Property Location
        </h3>

        <p className="text-sm text-blue-800 mt-2">
          Enter the property's full address and click
          <strong> Find Location</strong>. PrimePlaceEstate
          will automatically find the property's coordinates
          so it can appear on the Search map.
        </p>

      </div>

    </main>
  );
}