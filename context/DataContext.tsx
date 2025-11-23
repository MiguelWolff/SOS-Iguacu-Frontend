import React, { createContext, useContext, useEffect, useState } from "react";
import { lookupCep } from "../services/nominatim"; // we'll use this for city/state too (via Nominatim reverse)
import type { Area, Volunteer, Donation } from "../types/appTypes";

type DataContextValue = {
  volunteers: Volunteer[];
  areas: Area[];
  donations: Donation[];
  addVolunteer: (v: Omit<Volunteer, "id">) => void;
  addArea: (a: { name: string; cep: string; lat?: number | null; lng?: number | null }) => Promise<void>;
  addDonation: (d: Omit<Donation, "id">) => void;
  generateCSV: (type: "volunteers" | "areas" | "donations") => void;
  updateAreaCoords: (id: string, lat: number, lng: number) => void;
};

const uid = (p = "id") => p + "_" + Math.random().toString(36).slice(2, 9);

const DataContext = createContext<DataContextValue | undefined>(undefined);

function useLocalStorageState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState] as const;
}

// NOTE: types are kept in src/types/appTypes.ts (see file below)
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [volunteers, setVolunteers] = useLocalStorageState<Volunteer[]>("vols", []);
  const [areas, setAreas] = useLocalStorageState<Area[]>("areas", []);
  const [donations, setDonations] = useLocalStorageState<Donation[]>("dons", []);

  const addVolunteer = (v: Omit<Volunteer, "id">) => {
    const newV: Volunteer = { ...v, id: uid("v") };
    setVolunteers((p) => [newV, ...p]);
  };

  // addArea will try to keep city/state if possible (via lookupCep or via provided lat/lng)
  const addArea = async (a: { name: string; cep: string; lat?: number | null; lng?: number | null }) => {
    const { name, cep, lat, lng } = a;
    // prefer using provided coords to reverse geocode (more accurate)
    let city: string | undefined;
    let state: string | undefined;

    if ((lat || lat === 0) && (lng || lng === 0)) {
      try {
        const res = await lookupCep({ lat, lon: lng }); // here lookupCep is a general reverse function in services
        if (res?.address) {
          city = res.address.city || res.address.town || res.address.village || res.address.county;
          state = res.address.state;
        }
      } catch (e) {
        // ignore
      }
    }

    // fallback: try ViaCEP by CEP string to get locality if lat/lng not provided or reverse failed
    if (!city || !state) {
      try {
        const cepRaw = cep.replace(/[^0-9]/g, "");
        if (cepRaw) {
          const r = await fetch(`https://viacep.com.br/ws/${cepRaw}/json/`);
          const j = await r.json();
          if (!j.erro) {
            city = j.localidade || city;
            state = j.uf || state;
          }
        }
      } catch {}
    }

    const newA: Area = {
      id: uid("a"),
      name: name.trim(),
      cep: cep.trim(),
      city,
      state,
      lat: lat ?? undefined,
      lng: lng ?? undefined,
    };

    setAreas((p) => [newA, ...p]);
  };

  const addDonation = (d: Omit<Donation, "id">) => {
    const newD: Donation = { ...d, id: uid("d") };
    setDonations((p) => [newD, ...p]);
  };

  const generateCSV = (type: "volunteers" | "areas" | "donations") => {
    let rows: string[][] = [];
    if (type === "volunteers") {
      rows = [
        ["id", "name", "phone", "email", "skills", "areaId"],
        ...volunteers.map((v) => [v.id, v.name, v.phone || "", v.email || "", v.skills || "", v.areaId || ""]),
      ];
    } else if (type === "areas") {
      rows = [
        ["id", "name", "cep", "city", "state", "lat", "lng"],
        ...areas.map((a) => [a.id, a.name, a.cep, a.city || "", a.state || "", String(a.lat || ""), String(a.lng || "")]),
      ];
    } else {
      rows = [
        ["id", "description", "quantity", "areaId"],
        ...donations.map((d) => [d.id, d.description, String(d.quantity), d.areaId || ""]),
      ];
    }
    const csv = rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateAreaCoords = (id: string, lat: number, lng: number) => {
    setAreas((p) => p.map((a) => (a.id === id ? { ...a, lat, lng } : a)));
  };

  return (
    <DataContext.Provider
      value={{ volunteers, areas, donations, addVolunteer, addArea, addDonation, generateCSV, updateAreaCoords }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextValue => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
};
