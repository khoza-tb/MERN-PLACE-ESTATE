import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import {
  Swiper,
  SwiperSlide,
} from "swiper/react";

import {
  Navigation,
  Pagination,
  Thumbs,
} from "swiper/modules";

import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// ========================================
// FIX LEAFLET MARKER ICON
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

// ========================================
// LISTING PAGE
// ========================================

export default function Listing() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { currentUser } = useSelector(
    (state) => state.user
  );

  // ========================================
  // LISTING STATE
  // ========================================

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // SWIPER STATE
  // ========================================

  const [thumbsSwiper, setThumbsSwiper] =
    useState(null);

  // ========================================
  // INQUIRY STATE
  // ========================================

  const [showInquiry, setShowInquiry] =
    useState(false);

  const [inquiryName, setInquiryName] =
    useState("");

  const [inquiryEmail, setInquiryEmail] =
    useState("");

  const [inquiryPhone, setInquiryPhone] =
    useState("");

  const [inquiryMessage, setInquiryMessage] =
    useState("");

  const [sendingInquiry, setSendingInquiry] =
    useState(false);

  const [inquirySuccess, setInquirySuccess] =
    useState("");

  const [inquiryError, setInquiryError] =
    useState("");

  // ========================================
  // LOAD USER INFORMATION INTO FORM
  // ========================================

  useEffect(() => {
    if (currentUser) {
      setInquiryName(
        currentUser.username ||
          currentUser.name ||
          ""
      );

      setInquiryEmail(
        currentUser.email || ""
      );

      setInquiryPhone(
        currentUser.phone || ""
      );
    }
  }, [currentUser]);

  // ========================================
  // FETCH LISTING
  // ========================================

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `/api/listing/get/${id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            credentials: "include",
          }
        );

        const responseText =
          await res.text();

        let data = {};

        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error(
              "INVALID LISTING RESPONSE:",
              responseText
            );

            throw new Error(
              "The server returned an invalid response."
            );
          }
        }

        if (!res.ok) {
          throw new Error(
            data?.message ||
              "Failed to load listing."
          );
        }

        setListing(data);
      } catch (err) {
        console.error(
          "GET LISTING ERROR:",
          err
        );

        setError(
          err.message ||
            "Failed to load property."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  // ========================================
  // SEND INQUIRY
  // ========================================

  const handleSendInquiry = async (e) => {
    e.preventDefault();

    setInquirySuccess("");
    setInquiryError("");

    // ----------------------------------------
    // CHECK LOGIN
    // ----------------------------------------

    if (!currentUser) {
      navigate("/signin");
      return;
    }

    // ----------------------------------------
    // CHECK LISTING
    // ----------------------------------------

    if (!listing?._id) {
      setInquiryError(
        "Property information is missing."
      );

      return;
    }

    // ----------------------------------------
    // CHECK NAME
    // ----------------------------------------

    if (!inquiryName.trim()) {
      setInquiryError(
        "Please enter your full name."
      );

      return;
    }

    // ----------------------------------------
    // CHECK EMAIL
    // ----------------------------------------

    if (!inquiryEmail.trim()) {
      setInquiryError(
        "Please enter your email address."
      );

      return;
    }

    // ----------------------------------------
    // CHECK EMAIL FORMAT
    // ----------------------------------------

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(
        inquiryEmail.trim()
      )
    ) {
      setInquiryError(
        "Please enter a valid email address."
      );

      return;
    }

    // ----------------------------------------
    // CHECK PHONE
    // ----------------------------------------

    if (!inquiryPhone.trim()) {
      setInquiryError(
        "Please enter your cell number."
      );

      return;
    }

    // ----------------------------------------
    // CHECK MESSAGE
    // ----------------------------------------

    if (!inquiryMessage.trim()) {
      setInquiryError(
        "Please enter a message."
      );

      return;
    }

    // ----------------------------------------
    // CHECK MESSAGE LENGTH
    // ----------------------------------------

    if (inquiryMessage.trim().length > 1000) {
      setInquiryError(
        "Your message must be 1000 characters or less."
      );

      return;
    }

    try {
      setSendingInquiry(true);

      // --------------------------------------
      // SEND TO BACKEND
      // --------------------------------------

      const res = await fetch(
        `/api/inquiries/create/${listing._id}`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            name: inquiryName.trim(),

            email: inquiryEmail
              .trim()
              .toLowerCase(),

            phone: inquiryPhone.trim(),

            message:
              inquiryMessage.trim(),
          }),
        }
      );

      // --------------------------------------
      // READ RESPONSE SAFELY
      // --------------------------------------

      const responseText =
        await res.text();

      let data = {};

      if (responseText) {
        try {
          data = JSON.parse(
            responseText
          );
        } catch (parseError) {
          console.error(
            "INVALID INQUIRY SERVER RESPONSE:",
            responseText
          );

          throw new Error(
            "The server returned an invalid response."
          );
        }
      }

      console.log(
        "📩 INQUIRY RESPONSE:",
        data
      );

      // --------------------------------------
      // CHECK SERVER RESPONSE
      // --------------------------------------

      if (!res.ok) {
        throw new Error(
          data?.message ||
            data?.emailError ||
            "Failed to send inquiry."
        );
      }

      // --------------------------------------
      // MAKE SURE EMAIL WAS SENT
      // --------------------------------------

      if (
        data?.success !== true ||
        data?.emailSent !== true
      ) {
        throw new Error(
          data?.message ||
            "The inquiry could not be sent."
        );
      }

      // --------------------------------------
      // SUCCESS
      // --------------------------------------

      console.log(
        "✅ INQUIRY SENT SUCCESSFULLY:",
        data
      );

      setInquirySuccess(
        "Your inquiry has been sent successfully!"
      );

      setInquiryError("");
      setInquiryMessage("");

      // --------------------------------------
      // CLOSE FORM AFTER 1.5 SECONDS
      // --------------------------------------

      setTimeout(() => {
        setShowInquiry(false);
        setInquirySuccess("");
        setInquiryError("");
        setInquiryMessage("");
      }, 1500);
    } catch (err) {
      console.error(
        "SEND INQUIRY ERROR:",
        err
      );

      // Keep form open if email fails
      setInquirySuccess("");

      setInquiryError(
        err.message ||
          "Failed to send inquiry."
      );
    } finally {
      setSendingInquiry(false);
    }
  };

  // ========================================
  // OPEN INQUIRY FORM
  // ========================================

  const handleOpenInquiry = () => {
    if (!currentUser) {
      navigate("/signin");
      return;
    }

    setInquirySuccess("");
    setInquiryError("");

    setInquiryName(
      currentUser.username ||
        currentUser.name ||
        ""
    );

    setInquiryEmail(
      currentUser.email || ""
    );

    setInquiryPhone(
      currentUser.phone || ""
    );

    setInquiryMessage("");

    setShowInquiry(true);
  };

  // ========================================
  // CLOSE INQUIRY FORM
  // ========================================

  const handleCloseInquiry = () => {
    if (sendingInquiry) {
      return;
    }

    setShowInquiry(false);

    setInquirySuccess("");
    setInquiryError("");
    setInquiryMessage("");

    if (currentUser) {
      setInquiryName(
        currentUser.username ||
          currentUser.name ||
          ""
      );

      setInquiryEmail(
        currentUser.email || ""
      );

      setInquiryPhone(
        currentUser.phone || ""
      );
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-slate-900 rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-gray-600">
            Loading property...
          </p>
        </div>
      </main>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error || !listing) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 text-center">
          <div className="text-5xl mb-4">
            🏠
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Property Not Found
          </h1>

          <p className="text-gray-500 mt-3">
            {error ||
              "This property could not be found."}
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-6 w-full sm:w-auto px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition"
          >
            Back Home
          </button>
        </div>
      </main>
    );
  }

  // ========================================
  // VALUES
  // ========================================

  const images =
    listing.imageUrls || [];

  const latitude = Number(
    listing.latitude
  );

  const longitude = Number(
    listing.longitude
  );

  const hasLocation =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude !== 0 &&
    longitude !== 0;

  const price = Number(
    listing.regularPrice || 0
  );

  const discountPrice = Number(
    listing.discountPrice || 0
  );

  const hasOffer =
    Boolean(listing.offer) &&
    discountPrice > 0 &&
    discountPrice < price;

  const displayPrice =
    hasOffer
      ? discountPrice
      : price;

  // ========================================
  // FORMAT PRICE
  // ========================================

  const formatPrice = (value) => {
    return new Intl.NumberFormat(
      "en-ZA",
      {
        style: "currency",
        currency: "ZAR",
        maximumFractionDigits: 0,
      }
    ).format(value);
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <main className="min-h-screen bg-gray-50 overflow-x-hidden">

      {/* ========================================
          BACK BUTTON
      ======================================== */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium text-sm sm:text-base transition"
        >
          ← Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">

        {/* ========================================
            SWIPER IMAGE GALLERY
        ======================================== */}

        <section className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">

          {images.length > 0 ? (
            <>

              {/* ==================================
                  MAIN SWIPER
              ================================== */}

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
                className="w-full listing-main-swiper"
              >
                {images.map(
                  (image, index) => (
                    <SwiperSlide
                      key={`${image}-${index}`}
                    >
                      <div className="h-[260px] xs:h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] relative">

                        <img
                          src={image}
                          alt={`${listing.name} ${
                            index + 1
                          }`}
                          className="w-full h-full object-cover"
                        />

                        {/* OFFER BADGE */}

                        {hasOffer &&
                          index === 0 && (
                            <span className="absolute top-3 left-3 sm:top-5 sm:left-5 bg-red-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold text-xs sm:text-sm z-10 shadow-lg">
                              Special Offer
                            </span>
                          )}

                        {/* IMAGE COUNTER */}

                        <span className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 bg-black/70 text-white px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm z-10">
                          {index + 1} /{" "}
                          {images.length}
                        </span>

                      </div>
                    </SwiperSlide>
                  )
                )}
              </Swiper>

              {/* ==================================
                  THUMBNAIL SWIPER
              ================================== */}

              <div className="p-2 sm:p-3 md:p-4">

                <Swiper
                  onSwiper={setThumbsSwiper}
                  modules={[Thumbs]}
                  spaceBetween={8}
                  slidesPerView={2}
                  breakpoints={{
                    480: {
                      slidesPerView: 3,
                    },
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
                  watchSlidesProgress
                  className="listing-thumbs"
                >
                  {images.map(
                    (image, index) => (
                      <SwiperSlide
                        key={`thumb-${image}-${index}`}
                        className="cursor-pointer"
                      >
                        <div className="h-16 sm:h-20 md:h-24 overflow-hidden rounded-lg sm:rounded-xl border border-gray-200">
                          <img
                            src={image}
                            alt={`${listing.name} thumbnail ${
                              index + 1
                            }`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </SwiperSlide>
                    )
                  )}
                </Swiper>

              </div>
            </>
          ) : (
            <div className="h-[280px] sm:h-[400px] flex items-center justify-center bg-gray-100">
              <div className="text-center px-4">
                <div className="text-5xl sm:text-6xl">
                  🏠
                </div>

                <p className="mt-3 text-gray-500 text-sm sm:text-base">
                  No property images available
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ========================================
            PROPERTY CONTENT
        ======================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 mt-5 sm:mt-6">

          {/* ========================================
              LEFT CONTENT
          ======================================== */}

          <div className="lg:col-span-2 space-y-5 sm:space-y-6">

            {/* ========================================
                PROPERTY HEADER
            ======================================== */}

            <section className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                <div className="min-w-0">

                  {/* BADGES */}

                  <div className="flex flex-wrap gap-2 mb-3">

                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs sm:text-sm font-semibold capitalize">
                      For {listing.type}
                    </span>

                    {listing.furnished && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-semibold">
                        Furnished
                      </span>
                    )}

                    {listing.parking && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold">
                        Parking
                      </span>
                    )}

                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 break-words">
                    {listing.name}
                  </h1>

                  <p className="text-gray-500 mt-3 flex items-start gap-2 text-sm sm:text-base">

                    <span className="flex-shrink-0">
                      📍
                    </span>

                    <span className="break-words">
                      {listing.address}
                    </span>

                  </p>

                </div>

                {/* PRICE */}

                <div className="text-left sm:text-right flex-shrink-0">

                  {hasOffer && (
                    <p className="text-gray-400 line-through text-base sm:text-lg">
                      {formatPrice(price)}
                    </p>
                  )}

                  <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {formatPrice(
                      displayPrice
                    )}
                  </p>

                  {listing.type ===
                    "rent" && (
                    <p className="text-sm text-gray-500">
                      per month
                    </p>
                  )}

                </div>

              </div>

            </section>

            {/* ========================================
                FEATURES
            ======================================== */}

            <section className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">

              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5">
                Property Features
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">

                {/* BEDROOMS */}

                <div className="border border-gray-200 rounded-xl p-3 sm:p-4 text-center">

                  <div className="text-2xl sm:text-3xl">
                    🛏️
                  </div>

                  <p className="text-xl sm:text-2xl font-bold mt-2">
                    {listing.bedrooms}
                  </p>

                  <p className="text-xs sm:text-sm text-gray-500">
                    Bedrooms
                  </p>

                </div>

                {/* BATHROOMS */}

                <div className="border border-gray-200 rounded-xl p-3 sm:p-4 text-center">

                  <div className="text-2xl sm:text-3xl">
                    🚿
                  </div>

                  <p className="text-xl sm:text-2xl font-bold mt-2">
                    {listing.bathrooms}
                  </p>

                  <p className="text-xs sm:text-sm text-gray-500">
                    Bathrooms
                  </p>

                </div>

                {/* PARKING */}

                <div className="border border-gray-200 rounded-xl p-3 sm:p-4 text-center">

                  <div className="text-2xl sm:text-3xl">
                    🚗
                  </div>

                  <p className="text-xl sm:text-2xl font-bold mt-2">
                    {listing.parking
                      ? "Yes"
                      : "No"}
                  </p>

                  <p className="text-xs sm:text-sm text-gray-500">
                    Parking
                  </p>

                </div>

                {/* FURNISHED */}

                <div className="border border-gray-200 rounded-xl p-3 sm:p-4 text-center">

                  <div className="text-2xl sm:text-3xl">
                    🛋️
                  </div>

                  <p className="text-xl sm:text-2xl font-bold mt-2">
                    {listing.furnished
                      ? "Yes"
                      : "No"}
                  </p>

                  <p className="text-xs sm:text-sm text-gray-500">
                    Furnished
                  </p>

                </div>

              </div>

            </section>

            {/* ========================================
                DESCRIPTION
            ======================================== */}

            <section className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">

              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                About This Property
              </h2>

              <p className="text-gray-600 leading-7 text-sm sm:text-base whitespace-pre-line break-words">
                {listing.description}
              </p>

            </section>

            {/* ========================================
                MAP
            ======================================== */}

            <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

              <div className="p-4 sm:p-6">

                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Property Location
                </h2>

                <p className="text-gray-500 mt-1 text-sm sm:text-base break-words">
                  {listing.address}
                </p>

              </div>

              {hasLocation ? (
                <div className="h-[280px] sm:h-[350px] md:h-[400px]">

                  <MapContainer
                    center={[
                      latitude,
                      longitude,
                    ]}
                    zoom={15}
                    scrollWheelZoom
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
                        <div>
                          <strong>
                            {listing.name}
                          </strong>

                          <p className="mt-1">
                            {listing.address}
                          </p>
                        </div>
                      </Popup>
                    </Marker>

                  </MapContainer>

                </div>
              ) : (
                <div className="h-[220px] sm:h-[300px] bg-gray-100 flex items-center justify-center px-4">

                  <p className="text-gray-500 text-sm sm:text-base text-center">
                    Location information is
                    unavailable.
                  </p>

                </div>
              )}

            </section>

          </div>

          {/* ========================================
              RIGHT SIDEBAR
          ======================================== */}

          <aside className="space-y-5 sm:space-y-6">

            {/* ========================================
                CONTACT CARD
            ======================================== */}

            <section className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 lg:sticky lg:top-6">

              <div className="flex items-start gap-3">

                <div className="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 rounded-xl bg-slate-100 flex items-center justify-center text-lg sm:text-xl">
                  📩
                </div>

                <div className="min-w-0">

                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Interested in this property?
                  </h2>

                  <p className="text-gray-500 mt-1 text-sm">
                    Send us a message and our team
                    will get back to you.
                  </p>

                </div>

              </div>

              {/* ==================================
                  CONTACT BUTTON
              ================================== */}

              {!showInquiry ? (

                <button
                  type="button"
                  onClick={
                    handleOpenInquiry
                  }
                  className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white py-3.5 sm:py-4 rounded-xl font-bold transition"
                >
                  📩 Contact Us
                </button>

              ) : (

                <form
                  onSubmit={
                    handleSendInquiry
                  }
                  className="mt-6 space-y-4 sm:space-y-5"
                >

                  {/* ==================================
                      FORM HEADER
                  ================================== */}

                  <div className="border-b border-gray-200 pb-4">

                    <h3 className="text-lg font-bold text-gray-900">
                      Send an Inquiry
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Tell us how we can help you
                      with this property.
                    </p>

                  </div>

                  {/* ==================================
                      FULL NAME
                  ================================== */}

                  <div>

                    <label
                      htmlFor="inquiry-name"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Full Name
                    </label>

                    <input
                      id="inquiry-name"
                      type="text"
                      value={inquiryName}
                      onChange={(e) => {
                        setInquiryName(
                          e.target.value
                        );

                        setInquiryError("");
                        setInquirySuccess("");
                      }}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition"
                    />

                  </div>

                  {/* ==================================
                      EMAIL
                  ================================== */}

                  <div>

                    <label
                      htmlFor="inquiry-email"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Email Address
                    </label>

                    <input
                      id="inquiry-email"
                      type="email"
                      value={inquiryEmail}
                      onChange={(e) => {
                        setInquiryEmail(
                          e.target.value
                        );

                        setInquiryError("");
                        setInquirySuccess("");
                      }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition"
                    />

                    <p className="text-xs text-gray-500 mt-2">
                      We will use this email to
                      reply to you.
                    </p>

                  </div>

                  {/* ==================================
                      CELL NUMBER
                  ================================== */}

                  <div>

                    <label
                      htmlFor="inquiry-phone"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Cell Number
                    </label>

                    <input
                      id="inquiry-phone"
                      type="tel"
                      value={inquiryPhone}
                      onChange={(e) => {
                        setInquiryPhone(
                          e.target.value
                        );

                        setInquiryError("");
                        setInquirySuccess("");
                      }}
                      placeholder="e.g. 071 234 5678"
                      autoComplete="tel"
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition"
                    />

                  </div>

                  {/* ==================================
                      MESSAGE
                  ================================== */}

                  <div>

                    <label
                      htmlFor="inquiry-message"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Message
                    </label>

                    <textarea
                      id="inquiry-message"
                      value={
                        inquiryMessage
                      }
                      onChange={(e) => {
                        const value =
                          e.target.value.slice(
                            0,
                            1000
                          );

                        setInquiryMessage(
                          value
                        );

                        setInquiryError("");
                        setInquirySuccess("");
                      }}
                      rows={5}
                      maxLength={1000}
                      placeholder="Hi, I'm interested in this property. I would like to know more about availability, viewing times, and pricing..."
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm sm:text-base text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition"
                    />

                    <div className="flex justify-end mt-1">

                      <span className="text-xs text-gray-400">
                        {inquiryMessage.length}/1000
                      </span>

                    </div>

                  </div>

                  {/* ==================================
                      ERROR
                  ================================== */}

                  {inquiryError && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 sm:p-4 text-sm">

                      <span className="text-lg flex-shrink-0">
                        ⚠️
                      </span>

                      <p>
                        {inquiryError}
                      </p>

                    </div>
                  )}

                  {/* ==================================
                      SUCCESS
                  ================================== */}

                  {inquirySuccess && (
                    <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 sm:p-4 text-sm">

                      <span className="text-lg flex-shrink-0">
                        ✅
                      </span>

                      <p>
                        {inquirySuccess}
                      </p>

                    </div>
                  )}

                  {/* ==================================
                      SEND BUTTON
                  ================================== */}

                  <button
                    type="submit"
                    disabled={
                      sendingInquiry
                    }
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold disabled:opacity-60 disabled:cursor-not-allowed transition"
                  >

                    {sendingInquiry ? (
                      <span className="flex items-center justify-center gap-2">

                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                        Sending...

                      </span>
                    ) : (
                      "Send Inquiry"
                    )}

                  </button>

                  {/* ==================================
                      CANCEL BUTTON
                  ================================== */}

                  <button
                    type="button"
                    disabled={
                      sendingInquiry
                    }
                    onClick={
                      handleCloseInquiry
                    }
                    className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 transition"
                  >
                    Cancel
                  </button>

                </form>
              )}

            </section>

            {/* ========================================
                PROPERTY INFORMATION
            ======================================== */}

            <section className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">

              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Property Information
              </h2>

              <div className="space-y-3 text-sm">

                <div className="flex justify-between gap-4">

                  <span className="text-gray-500">
                    Type
                  </span>

                  <span className="font-semibold capitalize text-right">
                    {listing.type}
                  </span>

                </div>

                <div className="flex justify-between gap-4">

                  <span className="text-gray-500">
                    Bedrooms
                  </span>

                  <span className="font-semibold">
                    {listing.bedrooms}
                  </span>

                </div>

                <div className="flex justify-between gap-4">

                  <span className="text-gray-500">
                    Bathrooms
                  </span>

                  <span className="font-semibold">
                    {listing.bathrooms}
                  </span>

                </div>

                <div className="flex justify-between gap-4">

                  <span className="text-gray-500">
                    Parking
                  </span>

                  <span className="font-semibold">
                    {listing.parking
                      ? "Available"
                      : "No"}
                  </span>

                </div>

                <div className="flex justify-between gap-4">

                  <span className="text-gray-500">
                    Furnished
                  </span>

                  <span className="font-semibold">
                    {listing.furnished
                      ? "Yes"
                      : "No"}
                  </span>

                </div>

                <div className="flex justify-between gap-4">

                  <span className="text-gray-500">
                    Offer
                  </span>

                  <span className="font-semibold">
                    {listing.offer
                      ? "Yes"
                      : "No"}
                  </span>

                </div>

              </div>

            </section>

          </aside>

        </div>

      </div>

    </main>
  );
}