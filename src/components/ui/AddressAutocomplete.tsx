"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGoogleMapsScript } from "@/hooks/useGoogleMapsScript";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (placeDetails: {
    fullAddress: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  }) => void;
  placeholder?: string;
  className?: string;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  /** Restrict to street-level only (no city/state/zip appended) */
  streetOnly?: boolean;
}

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "123 Main Street, Phoenix, AZ 85001",
  className,
  onKeyPress,
  streetOnly = false,
}: AddressAutocompleteProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const mapsLoaded = useGoogleMapsScript();
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize services when Maps loads
  useEffect(() => {
    if (mapsLoaded && window.google) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      // PlacesService needs a div (not displayed)
      const div = document.createElement("div");
      placesService.current = new google.maps.places.PlacesService(div);
    }
  }, [mapsLoaded]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update dropdown position when showing
  const updateDropdownPosition = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 320; // approximate max height

      // Show above if not enough space below
      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        setDropdownPos({
          top: rect.top + window.scrollY - dropdownHeight - 4,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      } else {
        setDropdownPos({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    }
  }, []);

  // Recalculate position on scroll/resize
  useEffect(() => {
    if (!showDropdown) return;
    updateDropdownPosition();
    window.addEventListener("scroll", updateDropdownPosition, true);
    window.addEventListener("resize", updateDropdownPosition);
    return () => {
      window.removeEventListener("scroll", updateDropdownPosition, true);
      window.removeEventListener("resize", updateDropdownPosition);
    };
  }, [showDropdown, updateDropdownPosition]);

  const fetchPredictions = useCallback(
    (input: string) => {
      if (!autocompleteService.current || input.length < 3) {
        setPredictions([]);
        setShowDropdown(false);
        return;
      }

      autocompleteService.current.getPlacePredictions(
        {
          input,
          componentRestrictions: { country: "us" },
          types: ["address"],
        },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results as unknown as Prediction[]);
            setShowDropdown(true);
            setActiveIndex(-1);
          } else {
            setPredictions([]);
            setShowDropdown(false);
          }
        }
      );
    },
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchPredictions(val), 300);
  };

  const handleSelectPrediction = (prediction: Prediction) => {
    if (!placesService.current) {
      onChange(prediction.description);
      setShowDropdown(false);
      return;
    }

    placesService.current.getDetails(
      { placeId: prediction.place_id, fields: ["address_components", "formatted_address"] },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          let street = "";
          let city = "";
          let state = "";
          let zip = "";

          for (const component of place.address_components || []) {
            const types = component.types;
            if (types.includes("street_number")) {
              street = component.long_name + " " + street;
            } else if (types.includes("route")) {
              street = street + component.long_name;
            } else if (types.includes("locality")) {
              city = component.long_name;
            } else if (types.includes("administrative_area_level_1")) {
              state = component.short_name;
            } else if (types.includes("postal_code")) {
              zip = component.long_name;
            }
          }

          street = street.trim();

          const fullAddress = streetOnly
            ? street
            : [street, city, `${state} ${zip}`].filter(Boolean).join(", ");

          onChange(fullAddress);
          onSelect?.({ fullAddress, street, city, state, zip });
        } else {
          onChange(prediction.description);
        }
        setShowDropdown(false);
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || predictions.length === 0) {
      if (e.key === "Enter" && onKeyPress) onKeyPress(e);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < predictions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : predictions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) {
        handleSelectPrediction(predictions[activeIndex]);
      } else if (onKeyPress) {
        setShowDropdown(false);
        onKeyPress(e);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const dropdownContent =
    showDropdown && predictions.length > 0 && dropdownPos ? (
      <div
        ref={dropdownRef}
        style={{
          position: "absolute",
          top: dropdownPos.top,
          left: dropdownPos.left,
          width: dropdownPos.width,
          zIndex: 99999,
        }}
      >
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="max-h-[300px] overflow-y-auto">
            {predictions.map((prediction, idx) => (
              <button
                key={prediction.place_id}
                type="button"
                onClick={() => handleSelectPrediction(prediction)}
                onMouseEnter={() => setActiveIndex(idx)}
                className={cn(
                  "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors",
                  idx === activeIndex ? "bg-blue-50" : "hover:bg-slate-50",
                  idx < predictions.length - 1 && "border-b border-slate-100"
                )}
              >
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {prediction.structured_formatting.main_text}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {prediction.structured_formatting.secondary_text}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <div className="px-4 py-1.5 bg-slate-50 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 text-right">Powered by Google</p>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <div ref={containerRef} className="relative flex-1">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (predictions.length > 0) {
            updateDropdownPosition();
            setShowDropdown(true);
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
        className={cn("pl-9 h-12 text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl", className)}
      />

      {typeof document !== "undefined" && dropdownContent
        ? createPortal(dropdownContent, document.body)
        : null}
    </div>
  );
}
