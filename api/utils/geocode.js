export const geocodeAddress = async (address) => {
  try {
    if (!address || !address.trim()) {
      return {
        latitude: 0,
        longitude: 0,
      };
    }

    const url =
      `https://nominatim.openstreetmap.org/search?` +
      new URLSearchParams({
        q: address,
        format: "json",
        limit: "1",
      });

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "PrimePlaceEstate/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(
        "Geocoding service failed."
      );
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      console.log(
        "No coordinates found for:",
        address
      );

      return {
        latitude: 0,
        longitude: 0,
      };
    }

    return {
      latitude: Number(data[0].lat),
      longitude: Number(data[0].lon),
    };
  } catch (error) {
    console.error(
      "GEOCODING ERROR:",
      error
    );

    return {
      latitude: 0,
      longitude: 0,
    };
  }
};