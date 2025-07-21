import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { ArrowLeft, ArrowRight } from "lucide-react";

/**
 * Web‑app Interactive – Dashboard Sauvegardes (version sans dépendance shadcn)
 * -------------------------------------------------
 * • Affiche tous les clients du jour sélectionné dans 4 colonnes : OK, NOK, Erreurs /!\, Inconnu
 * • Navigation jour‑1 / jour+1 (désactivée sur le jour courant)
 * • Clic client → modal native affichant sujet + corps du mail
 * -------------------------------------------------
 * Attendu côté backend :
 *   /Documents/Rapports/rapport_YYYY-MM-DD.json =>  [ {
 *       client, status, subject, body, date, mailLink (optionnel)
 *     } ]
 */

export default function BackupDashboard() {
  const [date, setDate] = useState(dayjs().subtract(1, "day")); // par défaut, la veille
  const [entries, setEntries] = useState([]);
  const [selected, setSelected] = useState(null);

  // Chargement des données à chaque changement de jour
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `https://actservicefr.sharepoint.com/sites/service-technique/Documents%20partages/00_ACT/Rapports/rapport_${date.format("YYYY-MM-DD")}.json`
        );
        if (!res.ok) throw new Error("JSON non trouvé");
        const data = await res.json();
        setEntries(data);
      } catch (err) {
        console.error("Erreur de chargement des backups", err);
        setEntries([]);
      }
    }
    fetchData();
  }, [date]);

  // Bucketise les entrées par statut
  const buckets = {
    OK: [],
    NOK: [],
    ERREUR: [],
    INCONNU: [],
  };
  entries.forEach((e) => {
    if (e.status === "Terminé") buckets.OK.push(e);
    else if (e.status === "Échec") buckets.NOK.push(e);
    else if (e.status === "Terminé avec erreurs") buckets.ERREUR.push(e);
    else buckets.INCONNU.push(e);
  });

  const columnOrder = [
    { key: "OK", label: "OK", bg: "bg-green-100", text: "text-green-800" },
    { key: "NOK", label: "NOK", bg: "bg-red-100", text: "text-red-800" },
    {
      key: "ERREUR",
      label: "Erreurs /!\\",
      bg: "bg-yellow-100",
      text: "text-yellow-800",
    },
    { key: "INCONNU", label: "Inconnu", bg: "bg-gray-100", text: "text-gray-800" },
  ];

  return (
    <div className="p-4 space-y-4 font-sans">
      {/* NAVIGATION JOUR */}
      <div className="flex items-center justify-between gap-2">
        <button
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-40"
          onClick={() => setDate((d) => d.subtract(1, "day"))}
        >
          <ArrowLeft />
        </button>
        <h1 className="text-xl font-semibold">{date.format("DD MMM YYYY")}</h1>
        <button
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-40"
          onClick={() => setDate((d) => d.add(1, "day"))}
          disabled={date.isSame(dayjs(), "day")}
        >
          <ArrowRight />
        </button>
      </div>

      {/* TABLEAU 4 COLONNES */}
      <div className="grid md:grid-cols-4 gap-4">
        {columnOrder.map((col) => (
          <div
            key={col.key}
            className={`border rounded-lg ${col.bg} ${col.text} p-3 space-y-1`}
          >
            <h2 className="font-bold mb-1">{col.label}</h2>
            <ul className="space-y-1">
              {buckets[col.key].length ? (
                buckets[col.key].map((entry) => (
                  <li key={entry.client}>
                    <button
                      className="underline"
                      onClick={() => setSelected(entry)}
                    >
                      {entry.client}
                    </button>
                  </li>
                ))
              ) : (
                <li className="italic text-sm opacity-60">—</li>
              )}
            </ul>
          </div>
        ))}
      </div>

      {/* MODAL simple */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelected(null)}>
          <div
            className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[80vh] overflow-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selected.client} – {selected.status}
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSelected(null)}
              >
                ✕
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm">
              {selected.subject}\n\n{selected.body}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
