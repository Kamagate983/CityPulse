"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Metric = {
  value: number | null;
  unit: string;
  received_at: string;
};

type LiveData = {
  data: {
    weather: Record<string, Metric>;
    air_quality: Record<string, Metric>;
  };
};

export default function Home() {
  const [live, setLive] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLiveData() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/live`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          throw new Error("Erreur API");
        }

        setLive(await response.json());
      } catch {
        setError("Impossible de récupérer les données live d’Abidjan.");
      } finally {
        setLoading(false);
      }
    }

    const initialLoad = window.setTimeout(() => {
      void loadLiveData();
    }, 0);

    return () => clearTimeout(initialLoad);
  }, []);

  const weather = live?.data.weather;
  const airQuality = live?.data.air_quality;
  const metrics = [
    ["Température", weather?.temperature],
    ["Humidité", weather?.humidity],
    ["Précipitations", weather?.precipitation],
    ["Vitesse du vent", weather?.wind_speed],
    ["PM2.5", airQuality?.pm2_5],
    ["PM10", airQuality?.pm10],
    ["Ozone", airQuality?.ozone],
  ] as const;

  const latestReceivedAt = Object.values({
    ...weather,
    ...airQuality,
  })
    .map((metric) => metric.received_at)
    .sort()
    .at(-1);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            CityPulse
          </p>

          <h1 className="text-4xl font-bold md:text-5xl">
            Analyse urbaine d’Abidjan
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            Observatoire intelligent d’Abidjan, basé sur les données météo et
            de qualité de l’air disponibles en temps réel.
          </p>
        </header>

        <div className="mt-6 flex gap-4">
          <Link
            href="/"
            className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950"
          >
            Dashboard
          </Link>

          <Link
            href="/anomalies"
            className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300"
          >
            Anomalies
          </Link>

          <Link
            href="/quality"
            className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300"
          >
            Qualité des données
          </Link>

          <Link
            href="/live"
            className="rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-slate-950"
          >
            Live Abidjan
          </Link>

          <Link
            href="/history"
            className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300"
          >
            Historique
          </Link>

          <Link
            href="/map"
            className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300"
          >
            Carte
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(([label, metric]) => (
            <MetricCard
              key={label}
              label={label}
              value={loading ? "..." : formatMetric(metric)}
            />
          ))}

          <MetricCard
            label="Dernière synchronisation"
            value={
              loading
                ? "..."
                : latestReceivedAt
                  ? formatDate(latestReceivedAt)
                  : "Indisponible"
            }
          />
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  title,
  label,
  value,
}: {
  title?: string;
  label?: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{title ?? label}</p>
      <p className="mt-3 text-2xl font-bold text-cyan-400">{value}</p>
    </div>
  );
}

function formatMetric(metric?: Metric) {
  if (!metric || metric.value === null || metric.value === undefined) {
    return "Indisponible";
  }

  return `${metric.value} ${metric.unit}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("fr-FR");
}