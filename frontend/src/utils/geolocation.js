/**
 * Auto-detect user location using the browser's Geolocation API
 * and reverse geocode it to a readable city/area name via OpenStreetMap Nominatim.
 */
export async function detectUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            {
              headers: {
                "Accept-Language": "en",
              },
            }
          );

          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};

            const locality =
              addr.suburb ||
              addr.neighbourhood ||
              addr.residential ||
              addr.city_district ||
              "";

            const city =
              addr.city ||
              addr.town ||
              addr.village ||
              addr.municipality ||
              addr.state_district ||
              addr.state ||
              "";

            const formatted =
              locality && city && locality.toLowerCase() !== city.toLowerCase()
                ? `${locality}, ${city}`
                : city || locality || "Current Location";

            resolve({
              formatted,
              city: city || locality || "Current Location",
              state: addr.state || "",
              latitude,
              longitude,
            });
            return;
          }
        } catch (err) {
          console.warn("Reverse geocode fetch failed, using fallback:", err);
        }

        resolve({
          formatted: "Current Location",
          city: "Current Location",
          latitude,
          longitude,
        });
      },
      (error) => {
        let msg = "Could not detect location.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Location permission was denied. Please allow location access in your browser or type your city manually.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = "Location information is currently unavailable.";
        } else if (error.code === error.TIMEOUT) {
          msg = "Location request timed out. Please try again or type your city manually.";
        }
        reject(new Error(msg));
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
}
