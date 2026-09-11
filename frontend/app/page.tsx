"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

type MetricKey =
  | "temperature"
  | "humidity"
  | "precipitation"
  | "wind_speed"
  | "pm2_5"
  | "pm10"
  | "ozone";

type ViewMode = "all" | "weather" | "air";

type MetricMeta = {
  group: "weather" | "air";
  label: string;
  unit: string;
  short: string;
  color: string;
};

export default function Home() {
  const [live, setLive] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("temperature");

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

  const metrics = useMemo(
    () => [
      ["Température", weather?.temperature, "temperature"] as const,
      ["Humidité", weather?.humidity, "humidity"] as const,
      ["Précipitations", weather?.precipitation, "precipitation"] as const,
      ["Vitesse du vent", weather?.wind_speed, "wind_speed"] as const,
      ["PM2.5", airQuality?.pm2_5, "pm2_5"] as const,
      ["PM10", airQuality?.pm10, "pm10"] as const,
      ["Ozone", airQuality?.ozone, "ozone"] as const,
    ],
    [weather, airQuality],
  );

  const chartData = useMemo(() => {
    const sample = [
      { time: "06h", temperature: 26, humidity: 78, precipitation: 0.8, wind_speed: 10, pm2_5: 8, pm10: 12, ozone: 41 },
      { time: "08h", temperature: 27, humidity: 76, precipitation: 0.4, wind_speed: 12, pm2_5: 7, pm10: 13, ozone: 43 },
      { time: "10h", temperature: 28, humidity: 72, precipitation: 0.2, wind_speed: 14, pm2_5: 11, pm10: 19, ozone: 45 },
      { time: "12h", temperature: 29, humidity: 68, precipitation: 1.2, wind_speed: 15, pm2_5: 10, pm10: 16, ozone: 48 },
      { time: "14h", temperature: 30, humidity: 66, precipitation: 1.7, wind_speed: 16, pm2_5: 14, pm10: 22, ozone: 52 },
      { time: "16h", temperature: 29, humidity: 70, precipitation: 2.6, wind_speed: 13, pm2_5: 12, pm10: 21, ozone: 49 },
    ]; 
    return sample;
  }, []);

  const latestReceivedAt = Object.values({
    ...weather,
    ...airQuality,
  })
    .map((metric) => metric.received_at)
    .sort()
    .at(-1);

  const selectedMetricLabel =
    metrics.find(([, , key]) => key === selectedMetric)?.[0] ?? "Température";
  const selectedMetricData =
    metrics.find(([, , key]) => key === selectedMetric)?.[1];

  const selectedMetricMeta = METRICS_META[selectedMetric];

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 px-4 py-6 text-white md:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-6rem] top-[-6rem] h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-[-4rem] top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-[-4rem] left-1/3 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-8">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/50 bg-cyan-400/10 text-cyan-300 shadow-lg shadow-cyan-500/20">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-label="CityPulse logo"
                >
                  <path
                    d="M12 3L3 12l9 9 9-9-9-9z"
                    className="stroke-current"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 17l8-8 8 8"
                    className="stroke-current"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">
                CityPulse
              </p>
            </div>

            <div className="max-w-4xl">
              <h1 className="text-4xl font-black leading-tight md:text-5xl">
                Analyse urbaine d’Abidjan
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
                Observatoire intelligent d’Abidjan, basé sur les données météo
                et de qualité de l’air disponibles en temps réel.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-emerald-300/50 bg-emerald-400/10 px-4 py-3 backdrop-blur-xl">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_12px_#4ade80]" />
            <div>
              <div className="text-[0.68rem] font-black uppercase tracking-[0.25em] text-slate-400">
                Flux live
              </div>
              <div className="text-sm font-bold text-emerald-300">
                {loading ? "Initialisation" : "En ligne"}
              </div>
            </div>
          </div>
        </header>

        <nav className="mb-7 flex flex-wrap gap-2">
          <Link
            href="/"
            className="rounded-full bg-cyan-300 px-5 py-2.5 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-200"
          >
            Dashboard
          </Link>
          <Link
            href="/anomalies"
            className="rounded-full border border-slate-700 px-5 py-2.5 font-bold text-slate-300 transition hover:border-cyan-300 hover:text-cyan-200"
          >
            Anomalies
          </Link>
          <Link
            href="/quality"
            className="rounded-full border border-slate-700 px-5 py-2.5 font-bold text-slate-300 transition hover:border-cyan-300 hover:text-cyan-200"
          >
            Qualité des données
          </Link>
          <Link
            href="/live"
            className="rounded-full border border-emerald-400/60 bg-emerald-400/10 px-5 py-2.5 font-black text-emerald-200 transition hover:bg-emerald-400/20"
          >
            Live Abidjan
          </Link>
          <Link
            href="/history"
            className="rounded-full border border-slate-700 px-5 py-2.5 font-bold text-slate-300 transition hover:border-cyan-300 hover:text-cyan-200"
          >
            Historique
          </Link>
          <Link
            href="/map"
            className="rounded-full border border-slate-700 px-5 py-2.5 font-bold text-slate-300 transition hover:border-cyan-300 hover:text-cyan-200"
          >
            Carte
          </Link>
        </nav>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/50 bg-red-500/10 p-4 text-red-200 shadow-lg shadow-red-500/10">
            {error}
          </div>
        )}

        <section className="mb-6 grid gap-4 lg:grid-cols-[1.55fr_0.85fr]">
          <article className="rounded-[2rem] border border-cyan-300/20 bg-slate-900/50 p-6 backdrop-blur-xl">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[0.70rem] font-black uppercase tracking-[0.28em] text-slate-400">
                  Aperçu du territoire
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">
                  Surveillance urbaine
                </h2>
              </div>

              <div className="flex gap-2">
                {[
                  { label: "Tout", value: "all" },
                  { label: "Météo", value: "weather" },
                  { label: "Air", value: "air" },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setViewMode(item.value as ViewMode)}
                    className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.2em] transition ${
                      viewMode === item.value
                        ? "bg-cyan-300 text-slate-950"
                        : "border border-slate-700 text-slate-400 hover:text-cyan-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {metrics
                .filter(([, , key]) => {
                  if (viewMode === "weather")
                    return [
                      "temperature",
                      "humidity",
                      "precipitation",
                      "wind_speed",
                    ].includes(key);
                  if (viewMode === "air")
                    return ["pm2_5", "pm10", "ozone"].includes(key);
                  return true;
                })
                .slice(0, 4)
                .map(([label, metric, key]) => (
                  <MetricCard
                    key={label}
                    label={label}
                    value={loading ? "..." : formatMetric(metric)}
                    isSelected={selectedMetric === key}
                    onClick={() => setSelectedMetric(key)}
                  />
                ))}
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-slate-700/80 bg-slate-950/40 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[0.70rem] font-black uppercase tracking-[0.25em] text-slate-400">
                    Signal principal
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xl font-black text-white">
                      {selectedMetricLabel}
                    </span>
                    <span className="rounded-full bg-cyan-400/20 px-2 py-1 text-[0.68rem] font-black uppercase tracking-[0.2em] text-cyan-200">
                      {viewMode}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-cyan-300">
                    {loading ? "..." : formatMetric(selectedMetricData)}
                  </div>
                  <div className="text-[0.70rem] font-black uppercase tracking-[0.2em] text-slate-500">
                    {latestReceivedAt ? formatDate(latestReceivedAt) : "--"}
                  </div>
                </div>
              </div>

              <div className="relative h-44 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(34,211,238,0.04)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
                <div className="absolute inset-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
                      <defs>
                        <linearGradient id="signal-gradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0" stopColor={selectedMetricMeta.color} stopOpacity={0.9} />
                          <stop offset="1" stopColor={selectedMetricMeta.color} stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey={selectedMetric} stroke={selectedMetricMeta.color} fill="url(#signal-gradient)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </article>

          <aside className="rounded-[2rem] border border-emerald-300/30 bg-gradient-to-br from-emerald-500/20 to-slate-900/80 p-6 backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-[0.70rem] font-black uppercase tracking-[0.28em] text-emerald-300">
                Système
              </span>
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_12px_#4ade80]" />
            </div>

            <div className="mb-8">
              <div className="text-5xl font-black leading-none text-white">
                {loading ? "--" : metrics.length}
              </div>
              <div className="mt-2 text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                métriques détectées
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <span className="text-sm font-bold text-slate-400">Qualité air</span>
                <span className="rounded-full bg-cyan-400/20 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.2em] text-cyan-200">
                  Stable
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <span className="text-sm font-bold text-slate-400">Météo</span>
                <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.2em] text-emerald-200">
                  {loading ? "--" : "Live"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-400">
                  Dernière synchro
                </span>
                <span className="text-[0.72rem] font-black text-slate-200">
                  {loading
                    ? "..."
                    : latestReceivedAt
                      ? formatDate(latestReceivedAt)
                      : "Indisponible"}
                </span>
              </div>
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-slate-700/70 bg-slate-900/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[0.72rem] font-black uppercase tracking-[0.3em] text-slate-400">
                    Niveau de vigilance
                  </div>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-4xl font-black text-emerald-300">82%</span>
                    <span className="pb-1 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                      normal
                    </span>
                  </div>
                </div>
                <div className="relative h-16 w-16">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-300/30" />
                  <div className="absolute inset-1 rounded-full border-4 border-emerald-300" />
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-cyan-300/20 bg-slate-950/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[0.70rem] font-black uppercase tracking-[0.25em] text-slate-400">
                  Filtres actifs
                </span>
                <span className="rounded-full border border-cyan-300/50 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.2em] text-cyan-200">
                  {viewMode}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Capteurs</span>
                  <span className="text-sm font-black text-cyan-300">07</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Stations</span>
                  <span className="text-sm font-black text-emerald-300">05</span>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-slate-700 bg-slate-900/50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[0.70rem] font-black uppercase tracking-[0.25em] text-slate-400">
                  Flux de signal
                </span>
                <span className="rounded-full border border-emerald-300/50 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.2em] text-emerald-200">
                  OK
                </span>
              </div>
              <div className="flex items-end gap-2">
                {[50, 65, 48, 76, 70, 90, 62, 84, 74].map((height, index) => (
                  <div key={index} className="flex flex-1 items-end justify-center">
                    <span
                      className="w-2 rounded-full bg-cyan-300 shadow-[0_0_7px_#67e8f9]"
                      style={{ height: `${height * 0.45}px` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics
            .filter(([, , key]) => {
              if (viewMode === "weather")
                return [
                  "temperature",
                  "humidity",
                  "precipitation",
                  "wind_speed",
                ].includes(key);
              if (viewMode === "air")
                return ["pm2_5", "pm10", "ozone"].includes(key);
              return true;
            })
            .map(([label, metric, key]) => (
              <MetricCard
                key={label}
                label={label}
                value={loading ? "..." : formatMetric(metric)}
                isSelected={selectedMetric === key}
                onClick={() => setSelectedMetric(key)}
              />
            ))}
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.6rem] border border-slate-700 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between">
              <span className="text-[0.68rem] font-black uppercase tracking-[0.25em] text-slate-400">
                Météo
              </span>
              <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-[0.68rem] font-black uppercase text-emerald-200">
                normal
              </span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-4xl font-black text-cyan-300">
                {loading ? "--" : formatMetric(weather?.temperature)}
              </span>
              <span className="text-sm font-black uppercase text-slate-500">
                °C
              </span>
            </div>
          </div>
          <div className="rounded-[1.6rem] border border-slate-700 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between">
              <span className="text-[0.68rem] font-black uppercase tracking-[0.25em] text-slate-400">
                Qualité air
              </span>
              <span className="rounded-full bg-cyan-400/20 px-3 py-1 text-[0.68rem] font-black uppercase text-cyan-200">
                bonne
              </span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-4xl font-black text-cyan-300">
                {loading ? "--" : formatMetric(airQuality?.pm2_5)}
              </span>
              <span className="text-sm font-black uppercase text-slate-500">
                PM2.5
              </span>
            </div>
          </div>
          <div className="rounded-[1.6rem] border border-slate-700 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between">
              <span className="text-[0.68rem] font-black uppercase tracking-[0.25em] text-slate-400">
                Prévision
              </span>
              <span className="rounded-full bg-amber-400/20 px-3 py-1 text-[0.68rem] font-black uppercase text-amber-200">
                pluie faible
              </span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-4xl font-black text-amber-300">
                24%
              </span>
              <span className="text-sm font-black uppercase text-slate-500">
                pluie
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

const METRICS_META: Record<MetricKey, MetricMeta> = {
  temperature: { group: "weather", label: "Température", unit: "°C", short: "°C", color: "#22d3ee" },
  humidity: { group: "weather", label: "Humidité", unit: "%", short: "%", color: "#34d399" },
  precipitation: { group: "weather", label: "Précipitations", unit: "mm", short: "mm", color: "#a78bfa" },
  wind_speed: { group: "weather", label: "Vitesse du vent", unit: "km/h", short: "km/h", color: "#c084fc" },
  pm2_5: { group: "air", label: "PM2.5", unit: "µg/m³", short: "µg/m³", color: "#2dd4bf" },
  pm10: { group: "air", label: "PM10", unit: "µg/m³", short: "µg/m³", color: "#fde68a" },
  ozone: { group: "air", label: "Ozone", unit: "µg/m³", short: "µg/m³", color: "#83e1ff" },
};

function MetricCard({
  title,
  label,
  value,
  isSelected,
  onClick,
}: {
  title?: string;
  label?: string;
  value: string;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full rounded-[1.7rem] border p-5 text-left shadow-xl shadow-slate-950/30 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/70 hover:bg-slate-800/80 ${
        isSelected
          ? "border-cyan-300 bg-cyan-300/10"
          : "border-slate-700/80 bg-slate-900/70"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-[0.70rem] font-black uppercase tracking-[0.22em] text-slate-400">
          {title ?? label}
        </p>
        <span
          className={`h-2 w-2 rounded-full ${
            isSelected ? "bg-cyan-300" : "bg-slate-500"
          } opacity-90`}
        />
      </div>
      <p className="mt-5 text-2xl font-black leading-tight text-cyan-300">
        {value}
      </p>
    </button>
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