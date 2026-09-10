"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Quality = {
  quality_score: number;
  total_rows: number;
  total_columns: number;
  missing_values: number;
  duplicate_rows: number;
  invalid_traffic_values: number;
  invalid_temperature_values: number;
};

export default function QualityPage() {
  const [quality, setQuality] = useState<Quality | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/data-quality`)
      .then((response) => response.json())
      .then((data) => setQuality(data));
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
            Qualité des données
          </h1>

          <p className="mt-4 text-slate-400">
            Contrôle de la complétude, de la cohérence et de la fiabilité des
            données utilisées.
          </p>
        </header>

        {!quality ? (
          <p className="text-slate-400">Chargement...</p>
        ) : (
          <>
            <section className="mb-8 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-8">
              <p className="text-sm text-cyan-300">Score global</p>

              <p className="mt-2 text-6xl font-bold text-cyan-400">
                {quality.quality_score}%
              </p>

              <p className="mt-3 text-slate-300">
                Score basé sur la complétude et la validité des cellules.
              </p>
            </section>

            <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <QualityCard
                label="Lignes analysées"
                value={quality.total_rows}
              />

              <QualityCard
                label="Colonnes analysées"
                value={quality.total_columns}
              />

              <QualityCard
                label="Valeurs manquantes"
                value={quality.missing_values}
              />

              <QualityCard
                label="Doublons"
                value={quality.duplicate_rows}
              />

              <QualityCard
                label="Trafic invalide"
                value={quality.invalid_traffic_values}
              />

              <QualityCard
                label="Température invalide"
                value={quality.invalid_temperature_values}
              />
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function QualityCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const isValid = value === 0;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm text-slate-400">{label}</p>

      <p
        className={`mt-3 text-3xl font-bold ${
          isValid ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {isValid ? "Aucun problème détecté" : "Vérification nécessaire"}
      </p>
    </div>
  );
}