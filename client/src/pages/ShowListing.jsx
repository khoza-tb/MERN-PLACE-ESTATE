import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  FaArrowLeft,
  FaBed,
  FaBath,
  FaCar,
  FaCouch,
  FaMapMarkerAlt,
  FaTag,
  FaPhone,
  FaEnvelope,
  FaHome,
  FaHeart,
  FaTimes,
  FaPaperPlane,
  FaCheckCircle,
  FaUser,
} from "react-icons/fa";

// ========================================
// SWIPER
// ========================================
import {
  Swiper,
  SwiperSlide,
} from "swiper/react";

import {
  Navigation,
  Pagination,
  Thumbs,
  FreeMode,
} from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/free-mode";

// ========================================
// LEAFLET
// ========================================
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ========================================
// FIX LEAFLET MARKER
// ========================================
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function ShowListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ========================================
  // CURRENT USER
  // ========================================
  const { currentUser } = useSelector(
    (state) => state.user
  );

  // ========================================
  // STATE
  // ========================================
  const [listing, setListing] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [thumbsSwiper, setThumbsSwiper] =
    useState(null);

  // ========================================
  // FAVORITE STATE
  // ========================================
  const [isFavorite, setIsFavorite] =
    useState(false);

  const [favoriteLoading, setFavoriteLoading] =
    useState(false);

  // ========================================
  // INQUIRY STATE
  // ========================================
  const [showInquiryForm, setShowInquiryForm] =
    useState(false);

  const [inquiryForm, setInquiryForm] =
    useState({
      name: "",
      email: "",
      phone: "",
      message: "",
    });

  const [inquiryLoading, setInquiryLoading] =
    useState(false);

  const [inquirySuccess, setInquirySuccess] =
    useState("");

  const [inquiryError, setInquiryError] =
    useState("");

  const [emailWarning, setEmailWarning] =
    useState("");

  // ========================================
  // FALLBACK IMAGE
  // ========================================
  const fallbackImage =
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80";

  // ========================================
  // SAFE JSON RESPONSE
  // ========================================
  const getResponseData = async (response) => {
    const contentType =
      response.headers.get("content-type");

    if (
      contentType &&
      contentType.includes("application/json")
    ) {
      return await response.json();
    }

    const text = await response.text();

    return {
      message:
        text ||
        `Request failed with status ${response.status}.`,
    };
  };

  // ========================================
  // CLEAN IMAGE URL
  // ========================================
  const getImageUrl = (image) => {
    if (
      !image ||
      typeof image !== "string"
    ) {
      return fallbackImage;
    }

    // Handles Markdown-like image URLs
    const markdownMatch =
      image.match(
        /\((https?:\/\/[^)\s]+)/
      );

    if (markdownMatch?.[1]) {
      return markdownMatch[1];
    }

    // Handles normal URLs
    const normalMatch =
      image.match(
        /https?:\/\/[^\s\])"]+/
      );

    if (normalMatch?.[0]) {
      return normalMatch[0];
    }

    return fallbackImage;
  };

  // ========================================
  // FORMAT PRICE
  // ========================================
  const formatPrice = (price) => {
    if (
      price === undefined ||
      price === null ||
      price === ""
    ) {
      return "R0";
    }

    return new Intl.NumberFormat(
      "en-ZA",
      {
        style: "currency",
        currency: "ZAR",
        maximumFractionDigits: 0,
      }
    ).format(Number(price));
  };

  // ========================================
  // GET LISTING
  // ========================================
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          throw new Error(
            "No listing ID was provided."
          );
        }

        console.log(
          "FETCHING LISTING:",
          id
        );

        const response =
          await fetch(
            `/api/listing/get/${id}`,
            {
              credentials: "include",
            }
          );

        console.log(
          "LISTING STATUS:",
          response.status
        );

        const data =
          await getResponseData(response);

        console.log(
          "LISTING DATA:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to fetch listing."
          );
        }

        if (data?.listing) {
          setListing(data.listing);
        } else {
          setListing(data);
        }
      } catch (err) {
        console.error(
          "SHOW LISTING ERROR:",
          err
        );

        setError(
          err?.message ||
            "Something went wrong while loading this property."
        );

        setListing(null);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  // ========================================
  // CHECK FAVORITE
  // ========================================
  useEffect(() => {
    const checkFavoriteStatus =
      async () => {
        try {
          if (!id || !currentUser) {
            setIsFavorite(false);
            return;
          }

          const response =
            await fetch(
              `/api/favorite/check/${id}`,
              {
                credentials: "include",
              }
            );

          const data =
            await getResponseData(response);

          if (response.ok) {
            setIsFavorite(
              data?.isFavorite === true
            );
          }
        } catch (error) {
          console.error(
            "CHECK FAVORITE ERROR:",
            error
          );
        }
      };

    checkFavoriteStatus();
  }, [id, currentUser]);

  // ========================================
  // UPDATE INQUIRY FORM WHEN USER LOADS
  // ========================================
  useEffect(() => {
    if (currentUser) {
      setInquiryForm((previous) => ({
        ...previous,

        name:
          previous.name ||
          currentUser.username ||
          "",

        email:
          previous.email ||
          currentUser.email ||
          "",
      }));
    }
  }, [currentUser]);

  // ========================================
  // FAVORITE
  // ========================================
  const handleFavorite = async () => {
    try {
      if (!currentUser) {
        navigate("/signin");
        return;
      }

      if (!id) {
        return;
      }

      setFavoriteLoading(true);

      const url = isFavorite
        ? `/api/favorite/remove/${id}`
        : `/api/favorite/add/${id}`;

      const response =
        await fetch(url, {
          method: isFavorite
            ? "DELETE"
            : "POST",

          credentials: "include",
        });

      const data =
        await getResponseData(response);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to update saved property."
        );
      }

      setIsFavorite(
        (current) => !current
      );
    } catch (error) {
      console.error(
        "FAVORITE ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to update saved property."
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  // ========================================
  // OPEN INQUIRY FORM
  // ========================================
  const handleOpenInquiry = () => {
    if (!currentUser) {
      navigate(
        `/signin?redirect=/listing/${id}`
      );

      return;
    }

    setInquiryError("");
    setInquirySuccess("");
    setEmailWarning("");
    setShowInquiryForm(true);
  };

  // ========================================
  // CLOSE INQUIRY FORM
  // ========================================
  const handleCloseInquiry = () => {
    if (inquiryLoading) {
      return;
    }

    setShowInquiryForm(false);
    setInquiryError("");
    setInquirySuccess("");
    setEmailWarning("");
  };

  // ========================================
  // INQUIRY FORM CHANGE
  // ========================================
  const handleInquiryChange = (event) => {
    const { name, value } =
      event.target;

    setInquiryForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (inquiryError) {
      setInquiryError("");
    }

    if (inquirySuccess) {
      setInquirySuccess("");
    }

    if (emailWarning) {
      setEmailWarning("");
    }
  };

  // ========================================
  // SEND INQUIRY
  // ========================================
  const handleInquirySubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!currentUser) {
      setInquiryError(
        "Please sign in before contacting the agent."
      );

      return;
    }

    if (!id) {
      setInquiryError(
        "The property ID is missing."
      );

      return;
    }

    const name =
      inquiryForm.name.trim();

    const email =
      inquiryForm.email.trim();

    const phone =
      inquiryForm.phone.trim();

    const message =
      inquiryForm.message.trim();

    if (!name) {
      setInquiryError(
        "Please enter your name."
      );

      return;
    }

    if (!email) {
      setInquiryError(
        "Please enter your email address."
      );

      return;
    }

    if (!message) {
      setInquiryError(
        "Please enter a message."
      );

      return;
    }

    if (message.length < 10) {
      setInquiryError(
        "Please provide a little more detail in your message."
      );

      return;
    }

    try {
      setInquiryLoading(true);
      setInquiryError("");
      setInquirySuccess("");
      setEmailWarning("");

      const response =
        await fetch(
          `/api/inquiry/create/${id}`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials: "include",

            body: JSON.stringify({
              name,
              email,
              phone,
              message,
            }),
          }
        );

      const data =
        await getResponseData(response);

      console.log(
        "INQUIRY RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to send inquiry."
        );
      }

      setInquirySuccess(
        data?.message ||
          "Your inquiry has been sent successfully!"
      );

      // ========================================
      // EMAIL WARNING
      // ========================================
      if (data?.emailSent === false) {
        setEmailWarning(
          "Your inquiry was saved successfully, but the agent notification email could not be delivered."
        );
      }

      // ========================================
      // RESET FORM
      // ========================================
      setInquiryForm({
        name:
          currentUser.username || "",
        email:
          currentUser.email || "",
        phone: "",
        message: "",
      });

      // ========================================
      // CLOSE AFTER SUCCESS
      // ========================================
      setTimeout(() => {
        setShowInquiryForm(false);
        setInquirySuccess("");
        setEmailWarning("");
      }, 3500);
    } catch (error) {
      console.error(
        "SEND INQUIRY ERROR:",
        error
      );

      setInquiryError(
        error?.message ||
          "Something went wrong while sending your inquiry."
      );
    } finally {
      setInquiryLoading(false);
    }
  };

  // ========================================
  // LOADING
  // ========================================
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="animate-pulse">

            <div className="h-6 w-32 bg-slate-200 rounded mb-8" />

            <div className="h-[500px] bg-slate-200 rounded-2xl" />

            <div className="grid lg:grid-cols-3 gap-8 mt-10">

              <div className="lg:col-span-2 space-y-5">

                <div className="h-10 bg-slate-200 rounded w-2/3" />

                <div className="h-5 bg-slate-200 rounded w-1/2" />

                <div className="h-32 bg-slate-200 rounded" />

              </div>

              <div className="h-56 bg-slate-200 rounded-2xl" />

            </div>
          </div>
        </div>
      </main>
    );
  }

  // ========================================
  // ERROR
  // ========================================
  if (error || !listing) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6">

        <div className="bg-white rounded-2xl shadow-sm p-10 max-w-lg w-full text-center">

          <div className="text-6xl mb-5">
            🏠
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Property Not Found
          </h1>

          <p className="text-slate-500 mt-3">
            {error ||
              "This property could not be found."}
          </p>

          <Link
            to="/search"
            className="inline-flex items-center gap-2 mt-7 bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            <FaArrowLeft />
            Back to Properties
          </Link>

        </div>

      </main>
    );
  }

  // ========================================
  // IMAGES
  // ========================================
  const images =
    Array.isArray(
      listing.imageUrls
    ) &&
    listing.imageUrls.length > 0
      ? listing.imageUrls
      : [fallbackImage];

  // ========================================
  // OFFER
  // ========================================
  const hasOffer =
    listing.offer === true &&
    Number(
      listing.discountPrice
    ) > 0;

  const displayPrice =
    hasOffer
      ? listing.discountPrice
      : listing.regularPrice;

  // ========================================
  // LOCATION
  // ========================================
  const latitude = Number(
    listing.latitude || 0
  );

  const longitude = Number(
    listing.longitude || 0
  );

  const hasCoordinates =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude !== 0 &&
    longitude !== 0;

  return (
    <main className="min-h-screen bg-slate-50">

      {/* ========================================
          BACK BUTTON
      ======================================== */}
      <div className="max-w-7xl mx-auto px-6 pt-8">

        <Link
          to="/search"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-green-700 font-medium transition"
        >
          <FaArrowLeft />
          Back to Properties
        </Link>

      </div>

      {/* ========================================
          IMAGE GALLERY
      ======================================== */}
      <section className="max-w-7xl mx-auto px-6 mt-6">

        <div className="bg-white rounded-2xl shadow-sm p-3">

          {/* ========================================
              MAIN SWIPER
          ======================================== */}
          <Swiper
            modules={[
              Navigation,
              Pagination,
              Thumbs,
            ]}
            navigation
            pagination={{
              clickable: true,
            }}
            thumbs={{
              swiper:
                thumbsSwiper &&
                !thumbsSwiper.destroyed
                  ? thumbsSwiper
                  : null,
            }}
            spaceBetween={10}
            className="main-property-swiper"
          >
            {images.map(
              (image, index) => (
                <SwiperSlide
                  key={`${image}-${index}`}
                >

                  <div className="relative h-[350px] sm:h-[500px] lg:h-[600px] rounded-xl overflow-hidden bg-slate-200">

                    <img
                      src={getImageUrl(
                        image
                      )}
                      alt={`${listing.name} ${
                        index + 1
                      }`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          fallbackImage;
                      }}
                    />

                    {/* PROPERTY TYPE */}
                    <div className="absolute top-5 left-5 bg-green-700 text-white px-4 py-2 rounded-full font-semibold capitalize shadow-lg">
                      {listing.type ||
                        "Property"}
                    </div>

                    {/* OFFER */}
                    {hasOffer && (
                      <div className="absolute top-5 right-5 bg-white text-green-700 px-4 py-2 rounded-full font-semibold shadow-lg">
                        Special Offer
                      </div>
                    )}

                  </div>

                </SwiperSlide>
              )
            )}
          </Swiper>

          {/* ========================================
              THUMBNAIL SWIPER
          ======================================== */}
          {images.length > 1 && (
            <Swiper
              onSwiper={
                setThumbsSwiper
              }
              modules={[
                FreeMode,
                Thumbs,
              ]}
              spaceBetween={10}
              slidesPerView={2}
              freeMode={true}
              watchSlidesProgress={true}
              breakpoints={{
                640: {
                  slidesPerView: 4,
                },
                768: {
                  slidesPerView: 5,
                },
                1024: {
                  slidesPerView: 6,
                },
              }}
              className="mt-3 property-thumbs-swiper"
            >
              {images.map(
                (image, index) => (
                  <SwiperSlide
                    key={`thumb-${image}-${index}`}
                    className="cursor-pointer"
                  >

                    <div className="h-20 sm:h-24 rounded-lg overflow-hidden border-2 border-transparent hover:border-green-600 transition">

                      <img
                        src={getImageUrl(
                          image
                        )}
                        alt={`Thumbnail ${
                          index + 1
                        }`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            fallbackImage;
                        }}
                      />

                    </div>

                  </SwiperSlide>
                )
              )}
            </Swiper>
          )}

        </div>

      </section>

      {/* ========================================
          PROPERTY INFORMATION
      ======================================== */}
      <section className="max-w-7xl mx-auto px-6 py-10">

        <div className="grid lg:grid-cols-3 gap-10">

          {/* ========================================
              MAIN INFORMATION
          ======================================== */}
          <div className="lg:col-span-2">

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
              {listing.name}
            </h1>

            {/* ADDRESS */}
            <div className="flex items-start gap-2 text-slate-500 mt-4">

              <FaMapMarkerAlt className="text-green-700 mt-1 shrink-0" />

              <span>
                {listing.address}
              </span>

            </div>

            {/* PRICE */}
            <div className="mt-7">

              <div className="flex items-center gap-4 flex-wrap">

                <span className="text-3xl sm:text-4xl font-bold text-green-700">
                  {formatPrice(
                    displayPrice
                  )}
                </span>

                {hasOffer && (
                  <span className="text-lg text-slate-400 line-through">
                    {formatPrice(
                      listing.regularPrice
                    )}
                  </span>
                )}

              </div>

              {listing.type ===
                "rent" && (
                <p className="text-slate-500 mt-1">
                  per month
                </p>
              )}

            </div>

            {/* ========================================
                FEATURES
            ======================================== */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">

              <div className="bg-white rounded-xl p-5 shadow-sm">

                <FaBed className="text-green-700 text-xl mb-3" />

                <p className="text-2xl font-bold text-slate-900">
                  {listing.bedrooms ??
                    0}
                </p>

                <p className="text-sm text-slate-500">
                  Bedrooms
                </p>

              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm">

                <FaBath className="text-green-700 text-xl mb-3" />

                <p className="text-2xl font-bold text-slate-900">
                  {listing.bathrooms ??
                    0}
                </p>

                <p className="text-sm text-slate-500">
                  Bathrooms
                </p>

              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm">

                <FaCar className="text-green-700 text-xl mb-3" />

                <p className="text-lg font-bold text-slate-900">
                  {listing.parking
                    ? "Available"
                    : "None"}
                </p>

                <p className="text-sm text-slate-500">
                  Parking
                </p>

              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm">

                <FaCouch className="text-green-700 text-xl mb-3" />

                <p className="text-lg font-bold text-slate-900">
                  {listing.furnished
                    ? "Furnished"
                    : "Unfurnished"}
                </p>

                <p className="text-sm text-slate-500">
                  Furniture
                </p>

              </div>

            </div>

            {/* ========================================
                DESCRIPTION
            ======================================== */}
            <div className="bg-white rounded-2xl shadow-sm p-7 mt-8">

              <h2 className="text-2xl font-bold text-slate-900">
                About this property
              </h2>

              <p className="text-slate-600 leading-8 mt-5 whitespace-pre-line">
                {listing.description}
              </p>

            </div>

            {/* ========================================
                PROPERTY DETAILS
            ======================================== */}
            <div className="bg-white rounded-2xl shadow-sm p-7 mt-6">

              <h2 className="text-2xl font-bold text-slate-900 mb-5">
                Property Details
              </h2>

              <div className="grid sm:grid-cols-2 gap-5">

                <div className="flex items-center gap-3">

                  <FaHome className="text-green-700" />

                  <span className="text-slate-500">
                    Type:
                  </span>

                  <span className="font-semibold capitalize">
                    {listing.type}
                  </span>

                </div>

                <div className="flex items-center gap-3">

                  <FaTag className="text-green-700" />

                  <span className="text-slate-500">
                    Offer:
                  </span>

                  <span className="font-semibold">
                    {listing.offer
                      ? "Yes"
                      : "No"}
                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* ========================================
              CONTACT CARD
          ======================================== */}
          <aside>

            <div className="bg-white rounded-2xl shadow-sm p-7 sticky top-24">

              <h2 className="text-2xl font-bold text-slate-900">
                Interested in this property?
              </h2>

              <p className="text-slate-500 mt-3">
                Contact the property owner or agent for more information.
              </p>

              <div className="space-y-3 mt-7">

                {/* ========================================
                    FAVORITE
                ======================================== */}
                <button
                  type="button"
                  onClick={
                    handleFavorite
                  }
                  disabled={
                    favoriteLoading
                  }
                  className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold transition border ${
                    isFavorite
                      ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                      : "border-slate-300 text-slate-700 hover:border-red-300 hover:text-red-600 hover:bg-red-50"
                  }`}
                >

                  <FaHeart
                    className={
                      isFavorite
                        ? "text-red-500"
                        : ""
                    }
                  />

                  {favoriteLoading
                    ? "Updating..."
                    : isFavorite
                    ? "Saved Property"
                    : "Save Property"}

                </button>

                {/* ========================================
                    CONTACT AGENT
                ======================================== */}
                <button
                  type="button"
                  onClick={
                    handleOpenInquiry
                  }
                  className="w-full flex items-center justify-center gap-3 bg-green-700 hover:bg-green-800 text-white py-3.5 rounded-xl font-semibold transition"
                >

                  <FaPhone />

                  Contact Agent

                </button>

                {/* ========================================
                    SEND MESSAGE
                ======================================== */}
                <button
                  type="button"
                  onClick={
                    handleOpenInquiry
                  }
                  className="w-full flex items-center justify-center gap-3 border border-green-700 text-green-700 hover:bg-green-50 py-3.5 rounded-xl font-semibold transition"
                >

                  <FaEnvelope />

                  Send Message

                </button>

              </div>

              {/* ========================================
                  INQUIRY FORM
              ======================================== */}
              {showInquiryForm && (
                <div className="mt-7 pt-7 border-t border-slate-200">

                  {/* FORM HEADER */}
                  <div className="flex items-start justify-between gap-4 mb-5">

                    <div>

                      <h3 className="text-xl font-bold text-slate-900">
                        Contact Agent
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        Send a message about this property.
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={
                        handleCloseInquiry
                      }
                      disabled={
                        inquiryLoading
                      }
                      className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition disabled:opacity-50"
                    >
                      <FaTimes />
                    </button>

                  </div>

                  {/* SUCCESS MESSAGE */}
                  {inquirySuccess && (
                    <div className="mb-5 bg-green-50 border border-green-200 rounded-xl p-4">

                      <div className="flex items-start gap-3">

                        <FaCheckCircle className="text-green-600 mt-1 shrink-0" />

                        <div>

                          <p className="font-semibold text-green-700">
                            Inquiry Sent
                          </p>

                          <p className="text-sm text-green-600 mt-1">
                            {inquirySuccess}
                          </p>

                        </div>

                      </div>

                    </div>
                  )}

                  {/* EMAIL WARNING */}
                  {emailWarning && (
                    <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-4">

                      <p className="text-sm font-medium text-amber-700">
                        {emailWarning}
                      </p>

                    </div>
                  )}

                  {/* ERROR MESSAGE */}
                  {inquiryError && (
                    <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4">

                      <p className="text-sm font-medium text-red-600">
                        {inquiryError}
                      </p>

                    </div>
                  )}

                  <form
                    onSubmit={
                      handleInquirySubmit
                    }
                    className="space-y-4"
                  >

                    {/* NAME */}
                    <div>

                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Name
                      </label>

                      <div className="relative">

                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                        <input
                          type="text"
                          name="name"
                          value={
                            inquiryForm.name
                          }
                          onChange={
                            handleInquiryChange
                          }
                          required
                          disabled={
                            inquiryLoading
                          }
                          className="w-full border border-slate-300 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                          placeholder="Your name"
                        />

                      </div>

                    </div>

                    {/* EMAIL */}
                    <div>

                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email
                      </label>

                      <div className="relative">

                        <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                        <input
                          type="email"
                          name="email"
                          value={
                            inquiryForm.email
                          }
                          onChange={
                            handleInquiryChange
                          }
                          required
                          disabled={
                            inquiryLoading
                          }
                          className="w-full border border-slate-300 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                          placeholder="you@example.com"
                        />

                      </div>

                    </div>

                    {/* PHONE */}
                    <div>

                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Phone
                      </label>

                      <div className="relative">

                        <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                        <input
                          type="tel"
                          name="phone"
                          value={
                            inquiryForm.phone
                          }
                          onChange={
                            handleInquiryChange
                          }
                          disabled={
                            inquiryLoading
                          }
                          className="w-full border border-slate-300 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                          placeholder="Your phone number"
                        />

                      </div>

                    </div>

                    {/* MESSAGE */}
                    <div>

                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Message
                      </label>

                      <textarea
                        name="message"
                        value={
                          inquiryForm.message
                        }
                        onChange={
                          handleInquiryChange
                        }
                        required
                        disabled={
                          inquiryLoading
                        }
                        rows="5"
                        maxLength={1000}
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                        placeholder="I'm interested in this property. I would like to know more..."
                      />

                      <p className="text-xs text-slate-400 text-right mt-1">
                        {inquiryForm.message.length}/1000
                      </p>

                    </div>

                    {/* SEND BUTTON */}
                    <button
                      type="submit"
                      disabled={
                        inquiryLoading
                      }
                      className="w-full flex items-center justify-center gap-3 bg-green-700 hover:bg-green-800 text-white py-3.5 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >

                      {inquiryLoading ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />

                          Sending...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane />

                          Send Inquiry
                        </>
                      )}

                    </button>

                  </form>

                </div>
              )}

            </div>

          </aside>

        </div>

      </section>

      {/* ========================================
          MAP
      ======================================== */}
      <section className="max-w-7xl mx-auto px-6 pb-16">

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

          <div className="p-7">

            <h2 className="text-2xl font-bold text-slate-900">
              Property Location
            </h2>

            <div className="flex items-center gap-2 text-slate-500 mt-2">

              <FaMapMarkerAlt className="text-green-700" />

              <span>
                {listing.address}
              </span>

            </div>

          </div>

          {hasCoordinates ? (
            <div className="h-[400px] w-full">

              <MapContainer
                center={[
                  latitude,
                  longitude,
                ]}
                zoom={15}
                scrollWheelZoom={true}
                className="h-full w-full"
              >

                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker
                  position={[
                    latitude,
                    longitude,
                  ]}
                >

                  <Popup>

                    <div className="text-center">

                      <p className="font-bold text-gray-900">
                        {listing.name}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        {listing.address}
                      </p>

                    </div>

                  </Popup>

                </Marker>

              </MapContainer>

            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center bg-slate-50 text-center px-6">

              <div>

                <FaMapMarkerAlt className="text-4xl text-slate-300 mx-auto mb-4" />

                <p className="text-slate-500">
                  Location coordinates are not available for this property.
                </p>

                <p className="text-sm text-slate-400 mt-1">
                  The property can still be viewed without the map.
                </p>

              </div>

            </div>
          )}

        </div>

      </section>

    </main>
  );
}