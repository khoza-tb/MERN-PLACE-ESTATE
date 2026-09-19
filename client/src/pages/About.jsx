import React from "react";
import { Link } from "react-router-dom";
import {
  Home,
  ShieldCheck,
  Search,
  MapPin,
  Users,
  ArrowRight,
} from "lucide-react";

export default function About() {
  return (
    <main className="bg-white text-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/95 to-slate-900/70" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="max-w-3xl">
            <span className="inline-block mb-5 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur">
              About PrimePlaceEstate
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Find a place you can
              <span className="text-green-400"> call home.</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed">
              PrimePlaceEstate is a modern real-estate platform designed to
              make finding, exploring, and managing properties simple,
              convenient, and enjoyable.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/search"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Explore Properties
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/my-listings"
                className="inline-flex items-center gap-2 border border-white/30 hover:bg-white/10 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                List Your Property
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-green-600 font-semibold uppercase tracking-wide text-sm">
              Who We Are
            </p>

            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-900">
              Making property discovery easier
            </h2>

            <p className="mt-6 text-slate-600 leading-relaxed text-lg">
              PrimePlaceEstate brings property seekers and property owners
              together through a simple and intuitive platform. Whether you're
              searching for a rental property, looking to buy your next home,
              or wanting to showcase a property, our platform provides the
              tools you need.
            </p>

            <p className="mt-4 text-slate-600 leading-relaxed">
              We focus on providing clear property information, beautiful
              property images, useful search features, and location details so
              users can make informed decisions when exploring properties.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-slate-900 p-7 text-white">
              <Home className="text-green-400 mb-5" size={34} />
              <h3 className="text-2xl font-bold">Properties</h3>
              <p className="mt-2 text-slate-400">
                Discover properties that match your needs and lifestyle.
              </p>
            </div>

            <div className="rounded-2xl bg-green-500 p-7 text-white">
              <MapPin className="mb-5" size={34} />
              <h3 className="text-2xl font-bold">Locations</h3>
              <p className="mt-2 text-green-50">
                Explore properties and their locations with interactive maps.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-100 p-7">
              <Search className="text-slate-900 mb-5" size={34} />
              <h3 className="text-2xl font-bold text-slate-900">
                Easy Search
              </h3>
              <p className="mt-2 text-slate-600">
                Search and filter listings to find what you're looking for.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-100 p-7">
              <ShieldCheck className="text-green-600 mb-5" size={34} />
              <h3 className="text-2xl font-bold text-slate-900">
                Trusted Listings
              </h3>
              <p className="mt-2 text-slate-600">
                View detailed property information before making a decision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-green-600 font-semibold uppercase tracking-wide text-sm">
              What We Offer
            </p>

            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-900">
              Everything you need to explore property
            </h2>

            <p className="mt-4 text-slate-600">
              PrimePlaceEstate is built around making the property journey
              easier for both buyers, renters, and property owners.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-6">
                <Search className="text-green-600" size={24} />
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                Find Your Property
              </h3>

              <p className="mt-3 text-slate-600 leading-relaxed">
                Browse available properties and use search filters to narrow
                down your options based on your preferences.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-6">
                <Home className="text-green-600" size={24} />
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                List Your Property
              </h3>

              <p className="mt-3 text-slate-600 leading-relaxed">
                Property owners can create listings with images, descriptions,
                pricing, features, and location information.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-6">
                <MapPin className="text-green-600" size={24} />
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                Explore Locations
              </h3>

              <p className="mt-3 text-slate-600 leading-relaxed">
                View property locations on an interactive map and get a better
                understanding of where each property is situated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="rounded-3xl bg-slate-900 overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 sm:p-12 lg:p-16">
              <p className="text-green-400 font-semibold uppercase tracking-wide text-sm">
                Our Mission
              </p>

              <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
                Connecting people with the right places.
              </h2>

              <p className="mt-6 text-slate-300 leading-relaxed">
                Our mission is to simplify the real-estate experience by
                creating a platform where people can easily discover
                properties, compare their options, and connect with property
                owners.
              </p>

              <p className="mt-4 text-slate-300 leading-relaxed">
                We believe finding a property should be straightforward,
                transparent, and accessible.
              </p>
            </div>

            <div className="bg-green-500 p-8 sm:p-12 lg:p-16 flex items-center">
              <div>
                <Users size={42} className="text-white mb-6" />

                <h3 className="text-2xl font-bold text-white">
                  Built for people
                </h3>

                <p className="mt-4 text-green-50 leading-relaxed">
                  Whether you're searching for your first home, your next
                  rental, an investment opportunity, or a place to list your
                  property, PrimePlaceEstate is designed to put you first.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Ready to find your next place?
          </h2>

          <p className="mt-4 text-slate-600 text-lg">
            Start exploring properties and discover a place that feels right
            for you.
          </p>

          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-7 py-3 rounded-lg font-semibold transition"
            >
              Browse Properties
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/signup"
              className="inline-flex items-center gap-2 border border-slate-300 hover:bg-white text-slate-800 px-7 py-3 rounded-lg font-semibold transition"
            >
              Create an Account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}