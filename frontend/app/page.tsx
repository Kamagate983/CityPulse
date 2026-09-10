"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Kpis = {
  average_traffic: number;
  maximum_traffic: number;
  minimum_traffic: number;
  total_days: number;
  data_quality: number;
};

type TrafficData = {
  date: string;
  zone: string;
  traffic_count: number;
  weather: string;
  temperature: number;
  air_quality: number;
};

export default function Home() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [kpisResponse, trafficResponse] = await Promise.all([
          fetch("http://localhost:8000/api/kpis"),
          fetch("http://localhost:8000/api/traffic"),
        ]);

        if (!kpisResponse.ok || !trafficResponse.ok) {
          throw new Error("Erreur API");
        }

        const kpisData = await kpisResponse.json();
        const trafficResponseData = await trafficResponse.json();

        setKpis(kpisData);
        setTrafficData(trafficResponseData);
      } catch {
        setError(
          "Impossible de contacter le backend. Vérifie que FastAPI est lancé."
        );
      }
    }

    loadDashboard();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            CityPulse
          </p>

          <h1 className="text-4xl font-bold md:text-5xl">
            Urban Mobility Intelligence
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            Analyse du trafic urbain, suivi des indicateurs et détection
            d’anomalies.
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <KpiCard
            title="Trafic moyen"
            value={kpis ? `${kpis.average_traffic}` : "..."}
            description="véhicules par jour"
          />

          <KpiCard
            title="Pic de trafic"
            value={kpis ? `${kpis.maximum_traffic}` : "..."}
            description="maximum observé"
          />

          <KpiCard
            title="Trafic minimum"
            value={kpis ? `${kpis.minimum_traffic}` : "..."}
            description="minimum observé"
          />

          <KpiCard
            title="Jours analysés"
            value={kpis ? `${kpis.total_days}` : "..."}
            description="dans la période"
          />

          <KpiCard
            title="Qualité"
            value={kpis ? `${kpis.data_quality}%` : "..."}
            description="complétude des données"
          />
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Évolution du trafic</h2>
            <p className="mt-1 text-sm text-slate-500">
              Nombre de véhicules observés par jour
            </p>
          </div>

          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                />

                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="traffic_count"
                  name="Trafic"
                  stroke="#22d3ee"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#22d3ee" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 p-6">
            <h2 className="text-xl font-semibold">Dernières observations</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/50 text-slate-400">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Zone</th>
                  <th className="px-6 py-4">Trafic</th>
                  <th className="px-6 py-4">Météo</th>
                  <th className="px-6 py-4">Température</th>
                  <th className="px-6 py-4">Qualité air</th>
                </tr>
              </thead>

              <tbody>
                {trafficData.slice(-5).reverse().map((row) => (
                  <tr
                    key={row.date}
                    className="border-t border-slate-800 text-slate-300"
                  >
                    <td className="px-6 py-4">{row.date}</td>
                    <td className="px-6 py-4">{row.zone}</td>
                    <td className="px-6 py-4 font-semibold text-cyan-400">
                      {row.traffic_count}
                    </td>
                    <td className="px-6 py-4">{row.weather}</td>
                    <td className="px-6 py-4">{row.temperature} °C</td>
                    <td className="px-6 py-4">{row.air_quality}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-3 text-2xl font-bold text-cyan-400">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}