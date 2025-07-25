// DashboardBackupStatus.jsx
import React, { useEffect, useState } from "react";

const CATEGORIES = ["OK", "NOK", "Erreurs /!\\", "Inconnu"];

function getDateKey(dateStr) {
  return dateStr.split("T")[0];
}

function categorize(status) {
  const s = status?.toLowerCase();
  if (s === "terminé" || s === "ok" || s === "succès") return "OK";
  if (s === "échec" || s === "nok" || s === "ko") return "NOK";
  if (s.includes("erreurs")) return "Erreurs /!\\";
  return "Inconnu";
}

export default function DashboardBackupStatus() {
  const [jsonData, setJsonData] = useState([]);
  const [dates, setDates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const defaultDate = new Date(today);
    defaultDate.setDate(today.getDate() - 1);
    const dateString = defaultDate.toISOString().split("T")[0];

    setDates([dateString]);
    fetchJson(dateString);
  }, []);

  function fetchJson(dateStr) {
    setLoading(true);
    const url = `../public/rapports/rapport_${dateStr}.json`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setJsonData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement JSON:", err);
        setJsonData([]);
        setLoading(false);
      });
  }

  function changeDate(delta) {
    const newDate = new Date(dates[0]);
    newDate.setDate(newDate.getDate() + delta);
    const newDateString = newDate.toISOString().split("T")[0];
    setDates([newDateString]);
    fetchJson(newDateString);
  }

  if (loading) return <div className="text-center p-8">Chargement...</div>;

  const currentDate = dates[0];
  const regroupées = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = [];
    return acc;
  }, {});

  (jsonData || []).forEach((l) => {
    const cat = categorize(l.status);
    regroupées[cat].push(l);
  });

  return (
    <div className="p-4 text-white bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <button
          className="bg-gray-700 px-3 py-1 rounded disabled:opacity-30"
          onClick={() => changeDate(-1)}
        >
          ⬅️
        </button>
        <h1 className="text-3xl font-bold">{currentDate}</h1>
        <button
          className="bg-gray-700 px-3 py-1 rounded disabled:opacity-30"
          onClick={() => changeDate(1)}
          disabled={new Date(currentDate).toDateString() === new Date().toDateString()}
        >
          ➡️
        </button>
      </div>

      {CATEGORIES.map((cat) => (
        <div key={cat} className="mb-4">
          <h2 className="text-xl font-semibold mb-2">{cat}</h2>
          <ul className="ml-4 list-disc">
            {regroupées[cat].length ? (
              regroupées[cat].map((l, i) => (
                <li key={i} className="mb-1">
                  <span className="font-medium">{l.client}</span> - {l.status} - {new Date(l.date).toLocaleTimeString()} -
                  <a
                    href={l.mailLink}
                    target="_blank"
                    className="text-blue-400 underline ml-1"
                  >
                    Voir mail
                  </a>
                </li>
              ))
            ) : (
              <li className="text-gray-400">—</li>
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}
