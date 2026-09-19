
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

export default function UpdateListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { currentUser } = useSelector(
    (state) => state.user
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: "",
    discountPrice: "",
    offer: false,
    parking: false,
    furnished: false,
    latitude: "",
    longitude: "",
    imageUrls: [],
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
  =========================================================
  LOAD LISTING
  =========================================================
  */

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `/api/listing/get/${id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || "Failed to load listing."
          );
        }

        setFormData({
          name: data.name || "",
          description: data.description || "",
          address: data.address || "",
          type: data.type || "rent",

          bedrooms:
            data.bedrooms ??
            data.bedRooms ??
            1,

          bathrooms:
            data.bathrooms ??
            data.bathRooms ??
            1,

          regularPrice: data.regularPrice || "",
          discountPrice: data.discountPrice || "",

          offer:
            data.offer ??
            data.offers ??
            false,

          parking: data.parking || false,
          furnished: data.furnished || false,

          latitude: data.latitude || "",
          longitude: data.longitude || "",

          imageUrls: Array.isArray(data.imageUrls)
            ? data.imageUrls
            : [],
        });
      } catch (error) {
        console.error(
          "FETCH LISTING ERROR:",
          error
        );

        setError(
          error.message ||
            "Something went wrong while loading the listing."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  /*
  =========================================================
  HANDLE INPUT
  =========================================================
  */

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setError("");
    setSuccess("");
  };

  /*
  =========================================================
  REMOVE EXISTING IMAGE
  =========================================================
  */

  const removeExistingImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter(
        (_, imageIndex) =>
          imageIndex !== index
      ),
    }));
  };

  /*
  =========================================================
  HANDLE NEW IMAGES
  =========================================================
  */

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(
      e.target.files || []
    );

    setImages((prev) => [
      ...prev,
      ...selectedFiles,
    ]);

    setError("");
  };

  /*
  =========================================================
  REMOVE NEW IMAGE
  =========================================================
  */

  const removeNewImage = (index) => {
    setImages((prev) =>
      prev.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    );
  };

  /*
  =========================================================
  UPLOAD TO CLOUDINARY
  =========================================================
  */

  const uploadImages = async () => {
    if (images.length === 0) {
      return [];
    }

    const cloudName =
      import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

    const uploadPreset =
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error(
        "Cloudinary configuration is missing."
      );
    }

    const uploadedUrls = [];

    for (const image of images) {
      const uploadData = new FormData();

      uploadData.append("file", image);
      uploadData.append(
        "upload_preset",
        uploadPreset
      );

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: uploadData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message ||
            "Failed to upload image."
        );
      }

      uploadedUrls.push(data.secure_url);
    }

    return uploadedUrls;
  };

  /*
  =========================================================
  UPDATE LISTING
  =========================================================
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser?._id) {
      setError(
        "You must be signed in to update a listing."
      );
      return;
    }

    if (!id) {
      setError("Listing ID is missing.");
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const newImageUrls =
        await uploadImages();

      const allImageUrls = [
        ...formData.imageUrls,
        ...newImageUrls,
      ];

      if (allImageUrls.length === 0) {
        throw new Error(
          "Please keep at least one property image."
        );
      }

      const regularPrice = Number(
        formData.regularPrice
      );

      const discountPrice = Number(
        formData.discountPrice
      );

      if (
        !Number.isFinite(regularPrice) ||
        regularPrice <= 0
      ) {
        throw new Error(
          "Please enter a valid regular price."
        );
      }

      if (
        formData.offer &&
        (!Number.isFinite(discountPrice) ||
          discountPrice <= 0 ||
          discountPrice >= regularPrice)
      ) {
        throw new Error(
          "Discount price must be lower than the regular price."
        );
      }

      const updateData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        type: formData.type,

        bedrooms: Number(
          formData.bedrooms
        ),

        bathrooms: Number(
          formData.bathrooms
        ),

        regularPrice,

        discountPrice: formData.offer
          ? discountPrice
          : 0,

        offer: Boolean(
          formData.offer
        ),

        parking: Boolean(
          formData.parking
        ),

        furnished: Boolean(
          formData.furnished
        ),

        latitude: Number(
          formData.latitude
        ),

        longitude: Number(
          formData.longitude
        ),

        imageUrls: allImageUrls,
      };

      const res = await fetch(
        `/api/listing/update/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify(
            updateData
          ),
        }
      );

      const data = await res.json();

      console.log(
        "UPDATE LISTING RESPONSE:",
        data
      );

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to update listing."
        );
      }

      setSuccess(
        "Property updated successfully."
      );

      setFormData((prev) => ({
        ...prev,
        imageUrls: allImageUrls,
      }));

      setImages([]);

      setTimeout(() => {
        navigate(
          `/listing/${id}`
        );
      }, 1000);
    } catch (error) {
      console.error(
        "UPDATE LISTING ERROR:",
        error
      );

      setError(
        error.message ||
          "Something went wrong while updating the listing."
      );
    } finally {
      setUpdating(false);
    }
  };

  /*
  =========================================================
  LOADING
  =========================================================
  */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />

          <p className="mt-4 text-slate-600">
            Loading property...
          </p>
        </div>
      </main>
    );
  }

  /*
  =========================================================
  PAGE
  =========================================================
  */

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              Property Management
            </p>

            <h1 className="text-3xl font-bold text-slate-900 mt-1">
              Edit Property
            </h1>

            <p className="text-slate-500 mt-2">
              Update the information displayed on your property listing.
            </p>
          </div>

          <Link
            to={`/listing/${id}`}
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition"
          >
            View Property
          </Link>
        </div>

        {/* FORM CARD */}

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
        >
          {/* BASIC INFORMATION */}

          <div className="p-6 sm:p-8 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">
              Property Information
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Update the basic information about your property.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
              <div className="md:col-span-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Property Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Modern Family Home"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Describe the property..."
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none resize-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="address"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Address
                </label>

                <input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Property address"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Listing Type
                </label>

                <select
                  id="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white outline-none focus:border-slate-900"
                >
                  <option value="rent">
                    For Rent
                  </option>

                  <option value="sale">
                    For Sale
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="regularPrice"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Price
                </label>

                <input
                  id="regularPrice"
                  type="number"
                  min="0"
                  value={formData.regularPrice}
                  onChange={handleChange}
                  placeholder="Price in Rands"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="bedrooms"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Bedrooms
                </label>

                <input
                  id="bedrooms"
                  type="number"
                  min="0"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div>
                <label
                  htmlFor="bathrooms"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Bathrooms
                </label>

                <input
                  id="bathrooms"
                  type="number"
                  min="0"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </div>
          </div>

          {/* OPTIONS */}

          <div className="p-6 sm:p-8 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">
              Property Features
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
              <label className="flex items-center gap-3 border border-slate-200 rounded-xl p-4 cursor-pointer hover:bg-slate-50">
                <input
                  id="parking"
                  type="checkbox"
                  checked={formData.parking}
                  onChange={handleChange}
                  className="w-5 h-5"
                />

                <span className="text-sm font-semibold text-slate-700">
                  Parking Available
                </span>
              </label>

              <label className="flex items-center gap-3 border border-slate-200 rounded-xl p-4 cursor-pointer hover:bg-slate-50">
                <input
                  id="furnished"
                  type="checkbox"
                  checked={formData.furnished}
                  onChange={handleChange}
                  className="w-5 h-5"
                />

                <span className="text-sm font-semibold text-slate-700">
                  Furnished
                </span>
              </label>

              <label className="flex items-center gap-3 border border-slate-200 rounded-xl p-4 cursor-pointer hover:bg-slate-50">
                <input
                  id="offer"
                  type="checkbox"
                  checked={formData.offer}
                  onChange={handleChange}
                  className="w-5 h-5"
                />

                <span className="text-sm font-semibold text-slate-700">
                  Special Offer
                </span>
              </label>
            </div>

            {formData.offer && (
              <div className="mt-5 max-w-md">
                <label
                  htmlFor="discountPrice"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Discount Price
                </label>

                <input
                  id="discountPrice"
                  type="number"
                  min="0"
                  value={formData.discountPrice}
                  onChange={handleChange}
                  placeholder="Discounted price"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            )}
          </div>

          {/* IMAGES */}

          <div className="p-6 sm:p-8 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">
              Property Images
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Keep your existing images or add new ones.
            </p>

            {/* EXISTING */}

            {formData.imageUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                {formData.imageUrls.map(
                  (image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="relative group"
                    >
                      <img
                        src={image}
                        alt={`Property ${index + 1}`}
                        className="w-full h-36 object-cover rounded-xl border border-slate-200"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeExistingImage(index)
                        }
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full text-sm font-bold"
                      >
                        ×
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            {/* NEW */}

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
                {images.map(
                  (image, index) => (
                    <div
                      key={`${image.name}-${index}`}
                      className="relative"
                    >
                      <img
                        src={URL.createObjectURL(
                          image
                        )}
                        alt={image.name}
                        className="w-full h-36 object-cover rounded-xl border border-slate-200"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeNewImage(index)
                        }
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full text-sm font-bold"
                      >
                        ×
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            <label className="mt-6 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-8 cursor-pointer hover:border-slate-500 hover:bg-slate-50 transition">
              <span className="text-3xl mb-2">
                📷
              </span>

              <span className="font-semibold text-slate-700">
                Add More Images
              </span>

              <span className="text-xs text-slate-400 mt-1">
                Select one or more property images
              </span>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* LOCATION */}

          <div className="p-6 sm:p-8 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">
              Location Coordinates
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              These coordinates are used to display the property on the map.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
              <div>
                <label
                  htmlFor="latitude"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Latitude
                </label>

                <input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor="longitude"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Longitude
                </label>

                <input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-slate-900"
                />
              </div>
            </div>
          </div>

          {/* MESSAGES */}

          {(error || success) && (
            <div className="px-6 sm:px-8 pt-6">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </div>
              )}
            </div>
          )}

          {/* ACTIONS */}

          <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Link
              to={`/listing/${id}`}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={updating}
              className="inline-flex items-center justify-center px-7 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {updating
                ? "Saving Changes..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

