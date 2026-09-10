"use client";

import { useEffect, useState } from "react";

type Kpis = {
  average_traffic: number;
  traffic_change: number;
  anomalies_detected: number;
  data_quality: number;
};

export default function Home() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/kpis")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des KPI");
        }

        return response.json();
      })
      .then((data) => setKpis(data))
      .catch(() => {
        setError(
          "Impossible de contacter le backend. Vérifie que FastAPI est lancé."
        );
      });
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-cyan-400">
            CityPulse
          </p>

          <h1 className="text-4xl font-bold">
            Observatoire intelligent de la mobilité urbaine
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            Analyse du trafic, détection d’anomalies et suivi de la qualité des
            données.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Trafic moyen"
            value={kpis ? `${kpis.average_traffic}` : "..."}
            description="véhicules observés"
          />

          <KpiCard
            title="Évolution"
            value={kpis ? `+${kpis.traffic_change}%` : "..."}
            description="par rapport à la période précédente"
          />

          <KpiCard
            title="Anomalies"
            value={kpis ? `${kpis.anomalies_detected}` : "..."}
            description="détectées récemment"
          />

          <KpiCard
            title="Qualité des données"
            value={kpis ? `${kpis.data_quality}%` : "..."}
            description="taux de complétude"
          />
        </section>

        <section className="mt-10 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Prochaine étape</h2>
          <p className="mt-2 text-slate-400">
            Ajouter les données historiques, les graphiques et le système de
            détection d’anomalies.
          </p>
        </section>
      </div>
    </main>
  );
}

function KpiCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-3 text-3xl font-bold text-cyan-400">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}