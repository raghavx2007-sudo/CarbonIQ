export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8">
      <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
        Master Your <span className="text-emerald-600">Carbon Footprint</span>
      </h1>
      <p className="text-xl text-slate-600 max-w-2xl" aria-label="App description">
        CarbonIQ uses advanced analytics and AI-driven insights to help you understand, track, and optimize your environmental impact with surgical precision.
      </p>
      
      <div className="flex gap-4 mt-8">
        <a 
          href="/auth/register" 
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg shadow-sm transition-colors focus:ring-4 focus:ring-emerald-300 focus:outline-none"
          aria-label="Get Started and create an account"
        >
          Get Started
        </a>
        <a 
          href="/auth/login" 
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold py-3 px-8 rounded-lg shadow-sm transition-colors focus:ring-4 focus:ring-slate-200 focus:outline-none"
          aria-label="Sign in to your account"
        >
          Sign In
        </a>
      </div>
    </div>
  );
}
