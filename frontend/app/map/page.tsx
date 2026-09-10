"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let map: LeafletMap | undefined;
    let cancelled = false;

    async function createMap() {
      const leaflet = await import("leaflet");

      if (cancelled || !mapRef.current) return;

      map = leaflet
        .map(mapRef.current)
        .setView([5.3599517, -4.0082563], 11);

      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        })
        .addTo(map);

      leaflet
        .marker([5.3599517, -4.0082563])
        .addTo(map)
        .bindPopup("Abidjan")
        .openPopup();
    }

    void createMap();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-cyan-400">
          ← Retour au dashboard
        </Link>

        <h1 className="mt-8 text-4xl font-bold">Carte d’Abidjan</h1>

        <div
          ref={mapRef}
          className="mt-8 h-[600px] overflow-hidden rounded-2xl"
        />
      </div>
    </main>
  );
}
