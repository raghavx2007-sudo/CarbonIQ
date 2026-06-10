"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CarbonPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    milesDriven: 0,
    carMpg: 25,
    flightsTaken: 0,
    publicTransitMiles: 0,
    kwhUsed: 0,
    percentageRenewable: 0,
    beefMealsPerWeek: 0,
    chickenMealsPerWeek: 0,
    veganMealsPerWeek: 0,
    newClothesBought: 0,
    electronicsBought: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: Number(e.target.value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        travel: {
          milesDriven: formData.milesDriven,
          carMpg: formData.carMpg,
          flightsTaken: formData.flightsTaken,
          publicTransitMiles: formData.publicTransitMiles,
        },
        electricity: {
          kwhUsed: formData.kwhUsed,
          percentageRenewable: formData.percentageRenewable,
        },
        food: {
          beefMealsPerWeek: formData.beefMealsPerWeek,
          chickenMealsPerWeek: formData.chickenMealsPerWeek,
          veganMealsPerWeek: formData.veganMealsPerWeek,
        },
        shopping: {
          newClothesBought: formData.newClothesBought,
          electronicsBought: formData.electronicsBought,
        },
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/carbon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-slate-200">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Log Your Footprint</h1>
      
      {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-slate-700">Travel</legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="milesDriven" className="block text-sm font-medium text-slate-700">Miles Driven</label>
              <input type="number" id="milesDriven" name="milesDriven" min="0" value={formData.milesDriven} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border" aria-label="Miles Driven" />
            </div>
            <div>
              <label htmlFor="carMpg" className="block text-sm font-medium text-slate-700">Car MPG</label>
              <input type="number" id="carMpg" name="carMpg" min="0.1" step="0.1" value={formData.carMpg} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border" aria-label="Car MPG" />
            </div>
            <div>
              <label htmlFor="flightsTaken" className="block text-sm font-medium text-slate-700">Flights Taken</label>
              <input type="number" id="flightsTaken" name="flightsTaken" min="0" value={formData.flightsTaken} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border" aria-label="Flights Taken" />
            </div>
            <div>
              <label htmlFor="publicTransitMiles" className="block text-sm font-medium text-slate-700">Transit Miles</label>
              <input type="number" id="publicTransitMiles" name="publicTransitMiles" min="0" value={formData.publicTransitMiles} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border" aria-label="Public Transit Miles" />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-slate-700">Electricity</legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="kwhUsed" className="block text-sm font-medium text-slate-700">kWh Used</label>
              <input type="number" id="kwhUsed" name="kwhUsed" min="0" value={formData.kwhUsed} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border" aria-label="kWh Used" />
            </div>
            <div>
              <label htmlFor="percentageRenewable" className="block text-sm font-medium text-slate-700">% Renewable</label>
              <input type="number" id="percentageRenewable" name="percentageRenewable" min="0" max="100" value={formData.percentageRenewable} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border" aria-label="Percentage Renewable" />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-slate-700">Food (Meals/Week)</legend>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="beefMealsPerWeek" className="block text-sm font-medium text-slate-700">Beef</label>
              <input type="number" id="beefMealsPerWeek" name="beefMealsPerWeek" min="0" value={formData.beefMealsPerWeek} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border" aria-label="Beef Meals" />
            </div>
            <div>
              <label htmlFor="chickenMealsPerWeek" className="block text-sm font-medium text-slate-700">Chicken</label>
              <input type="number" id="chickenMealsPerWeek" name="chickenMealsPerWeek" min="0" value={formData.chickenMealsPerWeek} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border" aria-label="Chicken Meals" />
            </div>
            <div>
              <label htmlFor="veganMealsPerWeek" className="block text-sm font-medium text-slate-700">Vegan</label>
              <input type="number" id="veganMealsPerWeek" name="veganMealsPerWeek" min="0" value={formData.veganMealsPerWeek} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border" aria-label="Vegan Meals" />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-slate-700">Shopping</legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="newClothesBought" className="block text-sm font-medium text-slate-700">New Clothes</label>
              <input type="number" id="newClothesBought" name="newClothesBought" min="0" value={formData.newClothesBought} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border" aria-label="New Clothes" />
            </div>
            <div>
              <label htmlFor="electronicsBought" className="block text-sm font-medium text-slate-700">Electronics</label>
              <input type="number" id="electronicsBought" name="electronicsBought" min="0" value={formData.electronicsBought} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border" aria-label="Electronics" />
            </div>
          </div>
        </fieldset>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
        >
          {loading ? "Calculating..." : "Calculate & Save Footprint"}
        </button>
      </form>
    </div>
  );
}
