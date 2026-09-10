"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Observation = {
  value: number;
  unit: string;
  observed_at: string;
  received_at: string;
};

export default function HistoryPage() {
  const [metric, setMetric] = useState("temperature");
  const [category, setCategory] = useState("weather");
  const [data, setData] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      setLoading(true);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/live/history?category=${category}&metric=${metric}&limit=100`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          throw new Error("Erreur API");
        }

        const result = await response.json();
        if (!cancelled) {
          setData(result);
        }
      } catch {
        if (!cancelled) {
          setData([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    const initialLoad = window.setTimeout(() => {
      void loadHistory();
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(initialLoad);
    };
  }, [category, metric]);

  const chartData = data.map((item) => ({
    date: new Date(item.observed_at).toLocaleString("fr-FR"),
    value: item.value,
  }));

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-cyan-400">
          ← Retour au dashboard
        </Link>

        <h1 className="mt-8 text-4xl font-bold">
          Historique des données d’Abidjan
        </h1>

        <p className="mt-3 text-slate-400">
          Historique construit à partir des synchronisations réelles.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <select
            value={category}
            onChange={(event) => {
              const value = event.target.value;
              setCategory(value);
              setMetric(value === "weather" ? "temperature" : "pm2_5");
            }}
            className="rounded-lg bg-slate-800 px-4 py-3"
          >
            <option value="weather">Météo</option>
            <option value="air_quality">Qualité de l’air</option>
          </select>

          <select
            value={metric}
            onChange={(event) => setMetric(event.target.value)}
            className="rounded-lg bg-slate-800 px-4 py-3"
          >
            {category === "weather" ? (
              <>
                <option value="temperature">Température</option>
                <option value="humidity">Humidité</option>
                <option value="precipitation">Précipitations</option>
                <option value="wind_speed">Vent</option>
              </>
            ) : (
              <>
                <option value="pm2_5">PM2.5</option>
                <option value="pm10">PM10</option>
                <option value="ozone">Ozone</option>
                <option value="nitrogen_dioxide">
                  Dioxyde d’azote
                </option>
              </>
            )}
          </select>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          {loading ? (
            <p className="text-slate-400">Chargement...</p>
          ) : data.length === 0 ? (
            <p className="text-slate-400">
              Pas encore assez d’historique. L’application collecte les
              données automatiquement toutes les 15 minutes.
            </p>
          ) : (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    tick={{ fontSize: 11 }}
                  />

                  <YAxis stroke="#94a3b8" />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}