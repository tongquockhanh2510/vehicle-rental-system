import React, { useEffect, useMemo, useState } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

const DEFAULT_CENTER = { lat: 10.8231, lng: 106.6297 };
const mapContainerStyle = { width: '100%', height: '100%' };
const GOOGLE_MAP_LIBRARIES = ['marker'];

function toNumber(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export default function GoogleMapView({
  lat,
  lng,
  zoom = 13,
  title = 'Vị trí phương tiện',
  marker = true,
  className = '',
  heightClassName = 'h-80',
}) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';
  const [mapRef, setMapRef] = useState(null);
  const [authDenied, setAuthDenied] = useState(false);

  const center = useMemo(
    () => ({
      lat: toNumber(lat, DEFAULT_CENTER.lat),
      lng: toNumber(lng, DEFAULT_CENTER.lng),
    }),
    [lat, lng],
  );

  useEffect(() => {
    const previousAuthFailure = window.gm_authFailure;
    window.gm_authFailure = () => setAuthDenied(true);

    return () => {
      if (typeof previousAuthFailure === 'function') {
        window.gm_authFailure = previousAuthFailure;
      } else {
        delete window.gm_authFailure;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef || !marker || !window.google?.maps) return undefined;
    if (!window.google.maps.marker?.AdvancedMarkerElement) return undefined;

    const markerInstance = new window.google.maps.marker.AdvancedMarkerElement({
      map: mapRef,
      position: center,
      title,
    });

    return () => {
      markerInstance.map = null;
    };
  }, [mapRef, marker, center, title, mapId]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
    libraries: GOOGLE_MAP_LIBRARIES,
  });

  if (!apiKey) {
    return (
      <div
        className={`flex ${heightClassName} items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-center text-sm text-amber-100 ${className}`}
      >
        Thiếu Google Maps API key. Vui lòng cấu hình
        <code className="mx-1 rounded bg-slate-900/70 px-1.5 py-0.5 text-xs text-amber-200">
          VITE_GOOGLE_MAPS_API_KEY
        </code>
        trong file `.env`.
      </div>
    );
  }

  if (authDenied) {
    return (
      <div
        className={`flex ${heightClassName} items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-center text-sm text-rose-100 ${className}`}
      >
        Google Maps bị từ chối quyền truy cập. Kiểm tra Billing, Maps JavaScript API và
        HTTP referrer (`localhost:5173`, `127.0.0.1:5173`) trong Google Cloud.
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className={`flex ${heightClassName} items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-center text-sm text-rose-100 ${className}`}
      >
        Không tải được Google Maps. Kiểm tra API key, domain được phép và Maps JavaScript API đã bật.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={`flex ${heightClassName} items-center justify-center rounded-2xl border border-white/10 bg-slate-900/60 text-sm text-slate-300 ${className}`}
      >
        Đang tải bản đồ...
      </div>
    );
  }

  return (
    <div className={`${heightClassName} overflow-hidden rounded-2xl border border-cyan-400/20 ${className}`}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={toNumber(zoom, 13)}
        onLoad={(map) => setMapRef(map)}
        onUnmount={() => setMapRef(null)}
        options={{
          disableDefaultUI: false,
          clickableIcons: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          mapId: mapId || undefined,
        }}
      />
    </div>
  );
}
