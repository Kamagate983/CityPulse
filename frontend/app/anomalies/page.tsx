"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Anomaly = {
  date: string;
  zone: string;
  traffic_count: number;
  average_traffic: number;
  difference_percent: number;
  z_score: number;
  weather: string;
  temperature: number;
  air_quality: number;
  explanation: string;
};

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/anomalies`)
      .then((response) => response.json())
      .then((data) => {
        setAnomalies(data);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          ← Retour au dashboard
        </Link>

        <header className="mb-10 mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            CityPulse
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Détection des anomalies
          </h1>

          <p className="mt-4 text-slate-400">
            Les anomalies sont détectées grâce à l’écart entre le trafic
            observé et la moyenne historique.
          </p>
        </header>

        {loading && (
          <p className="text-slate-400">Chargement des anomalies...</p>
        )}

        {!loading && anomalies.length === 0 && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-300">
            Aucune anomalie détectée.
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {anomalies.map((anomaly) => (
            <article
              key={anomaly.date}
              className="rounded-2xl border border-red-500/30 bg-slate-900 p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{anomaly.date}</h2>

                <span className="rounded-full bg-red-500/20 px-3 py-1 text-sm text-red-300">
                  Anomalie
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <Metric
                  label="Trafic observé"
                  value={`${anomaly.traffic_count}`}
                />

                <Metric
                  label="Variation"
                  value={`${anomaly.difference_percent}%`}
                />

                <Metric
                  label="Score Z"
                  value={`${anomaly.z_score}`}
                />

                <Metric
                  label="Météo"
                  value={anomaly.weather}
                />
              </div>

              <div className="mt-6 rounded-xl bg-slate-800/70 p-4 text-sm text-slate-300">
                <strong className="text-cyan-400">Explication :</strong>{" "}
                {anomaly.explanation}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}