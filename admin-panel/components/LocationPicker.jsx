"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";

// Leaflet'i client-side only olarak yükle
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

// Map events için ayrı component
const MapEvents = dynamic(() => import('./MapEvents.jsx'), { ssr: false });

// Click event handler component
function LocationMarker({ position }) {
  const [L, setL] = useState(null);

  useEffect(() => {
    // Leaflet'i client-side'da yükle
    if (typeof window !== "undefined") {
      import("leaflet").then((leaflet) => {
        setL(leaflet.default);

        // Fix for default markers
        delete leaflet.default.Icon.Default.prototype._getIconUrl;
        leaflet.default.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });
      });
    }
  }, []);

  if (!L || !position) return null;

  return (
    <Marker position={position}>
      <Popup>
        Seçilen konum: {position[0].toFixed(6)}, {position[1].toFixed(6)}
      </Popup>
    </Marker>
  );
}

export default function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
  className = "",
}) {
  const [position, setPosition] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Client-side mounting kontrolü
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initial position setup
  useEffect(() => {
    if (latitude && longitude) {
      setPosition([parseFloat(latitude), parseFloat(longitude)]);
    } else {
      // Türkiye merkezi (Ankara) varsayılan konum
      setPosition([39.9334, 32.8597]);
    }
  }, [latitude, longitude]);

  const handleLocationSelect = useCallback(
    (lat, lng) => {
      const newPosition = [lat, lng];
      setPosition(newPosition);
      if (onLocationChange) {
        onLocationChange(lat, lng);
      }
    },
    [onLocationChange]
  );

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setPosition([lat, lng]);
          handleLocationSelect(lat, lng);
        },
        (error) => {
          console.error("Konum alınırken hata:", error);
          alert("Konum bilginiz alınamadı. Lütfen manuel olarak seçin.");
        }
      );
    } else {
      alert("Tarayıcınız konum servisini desteklemiyor.");
    }
  };

  if (!isClient || !position) {
    return (
      <div
        className={`h-64 bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="text-gray-500">Harita yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-3 flex justify-between items-center">
        <div className="text-sm font-medium text-gray-700">
          Konum Seçin (Harita üzerine tıklayın)
        </div>
        <button
          type="button"
          onClick={getCurrentLocation}
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Mevcut Konumum
        </button>
      </div>

      <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents onLocationSelect={handleLocationSelect} />
          <LocationMarker position={position} />
        </MapContainer>
      </div>

      {position && (
        <div className="mt-2 text-xs text-gray-600">
          Seçilen konum: {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </div>
      )}
    </div>
  );
}
