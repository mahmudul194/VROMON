'use client';

import React, { useEffect, useRef } from 'react';

interface DestinationMapProps {
  latitude: number;
  longitude: number;
  name: string;
  district: string;
}

export function DestinationMap({ latitude, longitude, name, district }: DestinationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;
      const L = (await import('leaflet')).default;

      if (!isMounted || !mapContainerRef.current) return;

      // Load Leaflet stylesheet once
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 11,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const customIcon = L.divIcon({
        className: 'vromon-map-pin',
        html: `<div style="width:20px;height:20px;background:#2f6b2f;border:3px solid #ffcb3d;border-radius:9999px;box-shadow:0 4px 12px rgba(0,0,0,0.28);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker([latitude, longitude], { icon: customIcon })
        .addTo(map)
        .bindPopup(`<strong>${name}</strong><br/>${district} District`)
        .openPopup();

      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, name, district]);

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-3xl border border-vromon-border/50 bg-vromon-leaf">
      <div ref={mapContainerRef} className="h-full w-full z-10" />
    </div>
  );
}
