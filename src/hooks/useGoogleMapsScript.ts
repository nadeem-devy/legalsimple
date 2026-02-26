"use client";

import { useState, useEffect } from "react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const SCRIPT_ID = "google-maps-script";

let isLoading = false;
let isLoaded = false;

export function useGoogleMapsScript() {
  const [loaded, setLoaded] = useState(isLoaded);

  useEffect(() => {
    if (isLoaded) {
      setLoaded(true);
      return;
    }

    if (isLoading) {
      // Another instance is loading — poll until done
      const interval = setInterval(() => {
        if (isLoaded) {
          setLoaded(true);
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }

    if (document.getElementById(SCRIPT_ID)) {
      isLoaded = true;
      setLoaded(true);
      return;
    }

    isLoading = true;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      setLoaded(true);
    };
    script.onerror = () => {
      isLoading = false;
      console.error("Failed to load Google Maps script");
    };
    document.head.appendChild(script);
  }, []);

  return loaded;
}
