"use client";

import { useEffect, useState } from "react";

type Metric = {
  value: number | null;
  unit: string;
  source: string;
  observed_at: string;
  received_at: string;
};

type LiveData = {
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  data: {
    weather: Record<string, Metric>;
    air_quality: Record<string, Metric>;
  };
};

export default function LivePage() {
  const [live, setLive] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState("");

  async function loadLiveData() {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/live`,
        {
        cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Erreur API");
      }

      const data = await response.json();

      setLive(data);
      setLastRefresh(new Date().toLocaleTimeString("fr-FR"));
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void loadLiveData();
    }, 0);

    const interval = setInterval(loadLiveData, 5 * 60 * 1000);

    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, []);

  const temperature = live?.data.weather?.temperature;
  const humidity = live?.data.weather?.humidity;
  const precipitation = live?.data.weather?.precipitation;
  const windSpeed = live?.data.weather?.wind_speed;
  const pm25 = live?.data.air_quality?.pm2_5;
  const pm10 = live?.data.air_quality?.pm10;
  const ozone = live?.data.air_quality?.ozone;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
              CityPulse Live
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Données en temps réel — Abidjan
            </h1>

            <p className="mt-3 text-slate-400">
              Coordonnées : 5.3599517, -4.0082563
            </p>
          </div>

          <button
            onClick={loadLiveData}
            className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950"
          >
            Actualiser
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          Source opérationnelle : Open-Meteo
          {lastRefresh && ` · Actualisé à ${lastRefresh}`}
        </div>

        {loading ? (
          <p className="mt-10 text-slate-400">
            Récupération des données d’Abidjan...
          </p>
        ) : !live ? (
          <p className="mt-10 text-red-400">
            Impossible de récupérer les données live.
          </p>
        ) : (
          <>
            <section className="mt-8">
              <h2 className="mb-4 text-2xl font-semibold">
                Conditions météo
              </h2>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <LiveCard
                  label="Température"
                  value={formatMetric(temperature)}
                />

                <LiveCard
                  label="Humidité"
                  value={formatMetric(humidity)}
                />

                <LiveCard
                  label="Précipitations"
                  value={formatMetric(precipitation)}
                />

                <LiveCard
                  label="Vent"
                  value={formatMetric(windSpeed)}
                />
              </div>
            </section>

            <section className="mt-10">
              <h2 className="mb-4 text-2xl font-semibold">
                Qualité de l’air
              </h2>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <LiveCard
                  label="PM2.5"
                  value={formatMetric(pm25)}
                />

                <LiveCard
                  label="PM10"
                  value={formatMetric(pm10)}
                />

                <LiveCard
                  label="Ozone"
                  value={formatMetric(ozone)}
                />
              </div>
            </section>

            <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold">À propos des données</h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Les données sont récupérées automatiquement auprès d’Open-Meteo
                et conservées dans une base SQLite locale. La synchronisation
                backend s’effectue toutes les 15 minutes et l’interface se
                rafraîchit toutes les 5 minutes.
              </p>

              <p className="mt-3 text-sm text-slate-500">
                Ces données concernent la météo et la qualité de l’air. Elles
                ne représentent pas encore le trafic routier d’Abidjan.
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function LiveCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-bold text-cyan-400">{value}</p>
    </div>
  );
}

function formatMetric(metric?: Metric) {
  if (!metric || metric.value === null || metric.value === undefined) {
    return "Indisponible";
  }

  return `${metric.value} ${metric.unit}`;
}