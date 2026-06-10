import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function getUserFootprint() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  if (!token) {
    redirect("/auth/login");
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/carbon`, {
      headers: { Cookie: `auth_token=${token}` },
      cache: 'no-store'
    });
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    return data.history?.[data.history.length - 1];
  } catch (err) {
    redirect("/auth/login");
  }
}

export default async function Dashboard() {
  const footprint = await getUserFootprint();

  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Your Dashboard</h1>
      
      {!footprint ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <p className="text-slate-600 mb-4">You haven't logged any footprints yet.</p>
          <a href="/carbon" className="text-emerald-600 font-medium hover:underline">Log your first footprint &rarr;</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-700 mb-2">Total Emissions</h2>
            <div className="text-5xl font-extrabold text-emerald-600">
              {footprint.totalCo2eKg.toFixed(1)} <span className="text-2xl text-slate-500 font-medium">kg CO₂e</span>
            </div>
            <p className="mt-4 text-sm text-slate-500">Based on your latest logged activity.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-700 mb-4">Category Breakdown</h2>
            <ul className="space-y-3" aria-label="Emission Breakdown">
              <li className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Travel</span>
                <span className="text-slate-900">{footprint.travelCo2e.toFixed(1)} kg</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Electricity</span>
                <span className="text-slate-900">{footprint.electricityCo2e.toFixed(1)} kg</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Food</span>
                <span className="text-slate-900">{footprint.foodCo2e.toFixed(1)} kg</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Shopping</span>
                <span className="text-slate-900">{footprint.shoppingCo2e.toFixed(1)} kg</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
