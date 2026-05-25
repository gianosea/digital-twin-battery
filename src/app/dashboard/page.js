"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
// Import koneksi Supabase menggunakan alias @ agar terhindar dari error path
import { supabase } from "@/utils/supabase"; 

export default function Dashboard() {
  const router = useRouter();

  // State Baterai (Nilai Default saat loading)
  const [batteryData, setBatteryData] = useState({
    soc: 0,
    soh: 0,
    cycle_count: 0,
    current: 0,
    total_voltage: 0,
    status: "LOADING DATA...",
    temperatures: { region1: 0, region2: 0, region3: 0, region4: 0, region5: 0, region6: 0 },
    cells: Array.from({ length: 13 }, (_, i) => ({ id: i + 1, voltage: 0, state: "normal" }))
  });

  // Logika Fetch & Realtime Supabase
  useEffect(() => {
    // Fungsi untuk memetakan data Supabase ke State React
    const updateDashboardState = (data) => {
      if (!data) return;

      // Fungsi penentu warna/state sel baterai
      const evaluateState = (voltage) => {
        if (voltage < 3.0) return "warning";
        if (voltage > 4.2) return "danger";
        return "normal";
      };

      setBatteryData({
        soc: data.soc ?? 0,
        soh: data.soh ?? 0,
        cycle_count: data.cycle_count ?? 0,
        current: data.current ?? 0,
        total_voltage: data.total_voltage ?? 0,
        status: data.status ?? "SYSTEM NORMAL",
        temperatures: { 
          region1: data.temperature_1 ?? 0, 
          region2: data.temperature_2 ?? 0, 
          region3: data.temperature_3 ?? 0, 
          region4: data.temperature_4 ?? 0, 
          region5: data.temperature_5 ?? 0, 
          region6: data.temperature_6 ?? 0
        },
        cells: [
          { id: 1, voltage: data.cell1_voltage ?? 0, state: evaluateState(data.cell1_voltage) },
          { id: 2, voltage: data.cell2_voltage ?? 0, state: evaluateState(data.cell2_voltage) },
          { id: 3, voltage: data.cell3_voltage ?? 0, state: evaluateState(data.cell3_voltage) },
          { id: 4, voltage: data.cell4_voltage ?? 0, state: evaluateState(data.cell4_voltage) },
          { id: 5, voltage: data.cell5_voltage ?? 0, state: evaluateState(data.cell5_voltage) },
          { id: 6, voltage: data.cell6_voltage ?? 0, state: evaluateState(data.cell6_voltage) },
          { id: 7, voltage: data.cell7_voltage ?? 0, state: evaluateState(data.cell7_voltage) },
          { id: 8, voltage: data.cell8_voltage ?? 0, state: evaluateState(data.cell8_voltage) },
          { id: 9, voltage: data.cell9_voltage ?? 0, state: evaluateState(data.cell9_voltage) },
          { id: 10, voltage: data.cell10_voltage ?? 0, state: evaluateState(data.cell10_voltage) },
          { id: 11, voltage: data.cell11_voltage ?? 0, state: evaluateState(data.cell11_voltage) },
          { id: 12, voltage: data.cell12_voltage ?? 0, state: evaluateState(data.cell12_voltage) },
          { id: 13, voltage: data.cell13_voltage ?? 0, state: evaluateState(data.cell13_voltage) },
        ]
      });
    };

    // 1. Ambil data baris terakhir saat buka web
    const fetchInitialData = async () => {
      const { data, error } = await supabase
        .from('battery_logs') // Pastikan nama tabel ini benar
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        updateDashboardState(data);
      } else if (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchInitialData();

    // 2. Langganan (Subscribe) ke perubahan data Real-time
    const channel = supabase
      .channel('realtime_battery')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'battery_logs' },
        (payload) => {
          updateDashboardState(payload.new);
        }
      )
      .subscribe();

    // Cleanup memori saat pindah halaman
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = () => {
    router.push("/");
  };

  const circ = 251.32; 

  return (
    <div className="flex min-h-screen bg-[#f4f7fe] text-slate-800 font-sans">
      
      {/* ========================================================= */}
      {/* SIDEBAR NAVIGASI KIRI */}
      {/* ========================================================= */}
      <aside className="w-64 bg-white flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 border-r border-slate-100">
        
        {/* Header Sidebar / Logo */}
        <div className="p-8 flex items-center gap-3">
          <Image 
            src="/logo-bh.png" 
            alt="B-Hero Logo" 
            width={36} 
            height={36} 
            className="object-contain" 
            style={{ width: 'auto', height: 'auto' }} 
            priority 
          />
          <span className="text-2xl font-black tracking-tight text-[#333866]">B-HERO</span>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 px-4 flex flex-col gap-2">
          {/* Active Menu */}
          <Link href="/dashboard" className="flex items-center gap-4 bg-[#333866] text-white px-5 py-3.5 rounded-2xl font-bold transition-all shadow-md shadow-[#333866]/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3V6ZM3 15.75a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-2.25Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3v-2.25Z" clipRule="evenodd" />
            </svg>
            Dashboard
          </Link>
          
          {/* Inactive Menus */}
          <Link href="/analytic" className="flex items-center gap-4 text-slate-400 hover:text-[#333866] hover:bg-slate-50 px-5 py-3.5 rounded-2xl font-semibold transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
            </svg>
            Analytic
          </Link>
          <Link href="/reports" className="flex items-center gap-4 text-slate-400 hover:text-[#333866] hover:bg-slate-50 px-5 py-3.5 rounded-2xl font-semibold transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
            Reports
          </Link>
          <Link href="/about" className="flex items-center gap-4 text-slate-400 hover:text-[#333866] hover:bg-slate-50 px-5 py-3.5 rounded-2xl font-semibold transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
            About Us
          </Link>
        </nav>

        {/* Tombol Logout */}
        <div className="p-6">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 text-slate-400 hover:text-red-500 hover:bg-red-50 px-5 py-3.5 rounded-2xl font-bold transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>
            Log Out
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* KONTEN UTAMA DASHBOARD */}
      {/* ========================================================= */}
      <main className="flex-1 p-8 md:p-10 overflow-y-auto">
        
        {/* Header Halaman */}
        <header className="mb-8">
          <h1 className="text-[32px] font-extrabold text-[#333866] tracking-tight">Welcome Back, B-Hero</h1>
          <p className="text-slate-500 font-medium mt-1">Here is your 13s battery pack information today.</p>
        </header>

        {/* ========================================================= */}
        {/* BARIS 1: PANEL DIAGNOSTIK GABUNGAN */}
        {/* ========================================================= */}
        <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8">
          
          {/* Header Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-slate-100 pb-6">
            <h2 className="text-2xl font-black text-[#333866]">System Diagnostic</h2>
            
            <div className={`border px-5 py-2.5 rounded-full font-black text-sm animate-pulse flex items-center gap-2 shadow-sm ${
              batteryData.status === "SYSTEM NORMAL" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50/80 text-red-600 border-red-200"
            }`}>
              {batteryData.status === "SYSTEM NORMAL" ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" /></svg>
              )}
              {batteryData.status}
            </div>
          </div>

          {/* Ilustrasi Pack Baterai (Desain Silinder 3D Dinamis) */}
          <div className="bg-[#f8f9fa] rounded-3xl p-8 flex flex-col items-center justify-center mb-8 relative overflow-hidden">
            
            {/* 6 REGION SUHU DENGAN GRID */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 sm:gap-6 w-full max-w-4xl mb-10 px-2 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest z-10 text-center">
              <div className={`flex flex-col items-center ${batteryData.temperatures.region1 > 40 ? "text-red-500 scale-110 transition-transform" : ""}`}>
                <span className="mb-1">Region 1</span>
                <span className="text-base sm:text-lg leading-none">{Number(batteryData.temperatures.region1).toFixed(1)}°C</span>
              </div>
              <div className={`flex flex-col items-center ${batteryData.temperatures.region2 > 40 ? "text-red-500 scale-110 transition-transform" : ""}`}>
                <span className="mb-1">Region 2</span>
                <span className="text-base sm:text-lg leading-none">{Number(batteryData.temperatures.region2).toFixed(1)}°C</span>
              </div>
              <div className={`flex flex-col items-center ${batteryData.temperatures.region3 > 40 ? "text-red-500 scale-110 transition-transform" : ""}`}>
                <span className="mb-1">Region 3</span>
                <span className="text-base sm:text-lg leading-none">{Number(batteryData.temperatures.region3).toFixed(1)}°C</span>
              </div>
              <div className={`flex flex-col items-center ${batteryData.temperatures.region4 > 40 ? "text-red-500 scale-110 transition-transform" : ""}`}>
                <span className="mb-1">Region 4</span>
                <span className="text-base sm:text-lg leading-none">{Number(batteryData.temperatures.region4).toFixed(1)}°C</span>
              </div>
              <div className={`flex flex-col items-center ${batteryData.temperatures.region5 > 40 ? "text-red-500 scale-110 transition-transform" : ""}`}>
                <span className="mb-1">Region 5</span>
                <span className="text-base sm:text-lg leading-none">{Number(batteryData.temperatures.region5).toFixed(1)}°C</span>
              </div>
              <div className={`flex flex-col items-center ${batteryData.temperatures.region6 > 40 ? "text-red-500 scale-110 transition-transform" : ""}`}>
                <span className="mb-1">Region 6</span>
                <span className="text-base sm:text-lg leading-none">{Number(batteryData.temperatures.region6).toFixed(1)}°C</span>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 w-full max-w-4xl justify-center z-10 relative">
              <div className="absolute top-4 left-4 right-4 h-3 bg-slate-300 rounded-full z-0 opacity-50"></div>
              <div className="absolute bottom-4 left-4 right-4 h-3 bg-slate-300 rounded-full z-0 opacity-50"></div>

              {batteryData.cells.map((cell) => (
                <div 
                  key={cell.id}
                  className={`w-12 sm:w-16 h-32 sm:h-40 rounded-full relative flex flex-col items-center justify-between py-3 transition-all duration-500 z-10 shadow-lg ${
                    cell.state === "warning" ? "bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 shadow-amber-400/50" : 
                    cell.state === "danger" ? "bg-gradient-to-r from-red-400 via-red-500 to-red-600 shadow-red-500/50" : 
                    "bg-gradient-to-r from-[#4d63a8] via-[#6079ca] to-[#4d63a8]"
                  }`}
                >
                  <div className="w-6 h-3 bg-slate-200 rounded-full shadow-inner opacity-80"></div>
                  <span className="text-sm sm:text-base font-black text-white/90 drop-shadow-md">{cell.id}</span>
                  <div className="w-8 h-2 bg-slate-800/20 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>

          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Cell Voltages Detail</h3>
          
          <div className="w-full overflow-x-auto pb-4">
            <div 
              className="grid gap-2 sm:gap-3 min-w-[780px]" 
              style={{ gridTemplateColumns: "repeat(13, minmax(0, 1fr))" }}
            >
              {batteryData.cells.map((cell) => (
                <div 
                  key={cell.id} 
                  className={`p-2 sm:p-3 rounded-2xl text-center transition-colors border-2 ${
                    cell.state === "warning" ? "bg-amber-50 border-amber-200" : 
                    cell.state === "danger" ? "bg-red-50 border-red-200" : 
                    "bg-white border-slate-100 hover:border-[#6079ca]/30 hover:shadow-md"
                  }`}
                >
                  <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cell {cell.id}</div>
                  <div className={`text-base sm:text-lg font-black ${
                    cell.state === "warning" ? "text-amber-600" : 
                    cell.state === "danger" ? "text-red-600" : "text-[#333866]"
                  }`}>
                    {Number(cell.voltage).toFixed(2)}<span className="text-[10px] sm:text-xs ml-0.5 text-slate-400 font-bold">V</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* BARIS 2: SoC & SoH DENGAN GAUGE SETENGAH LINGKARAN */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Panel State of Charge */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center">
            <h2 className="text-lg font-black text-[#333866] mb-8">State Of Charge</h2>
            
            <div className="relative w-72 h-36 mb-2 flex justify-center">
              <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible">
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#f1f5f9" strokeWidth="24" strokeLinecap="round" />
                <path 
                  d="M 20 100 A 80 80 0 0 1 180 100" 
                  fill="none" 
                  stroke="#6079ca" 
                  strokeWidth="24" 
                  strokeLinecap="round" 
                  strokeDasharray={circ} 
                  strokeDashoffset={circ - (circ * batteryData.soc / 100)} 
                  className="transition-all duration-1000 ease-out drop-shadow-md"
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                <span className="text-5xl font-black text-[#333866] tracking-tighter">
                  {Number(batteryData.soc).toFixed(0)}<span className="text-2xl text-slate-400">%</span>
                </span>
              </div>
            </div>
            <p className="text-sm font-bold text-slate-400">Current Battery Level</p>
          </div>

          {/* Panel State of Health */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center">
            <h2 className="text-lg font-black text-[#333866] mb-8">State Of Health</h2>
            
            <div className="relative w-72 h-36 mb-2 flex justify-center">
              <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible">
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#f1f5f9" strokeWidth="24" strokeLinecap="round" />
                <path 
                  d="M 20 100 A 80 80 0 0 1 180 100" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="24" 
                  strokeLinecap="round" 
                  strokeDasharray={circ} 
                  strokeDashoffset={circ - (circ * batteryData.soh / 100)} 
                  className="transition-all duration-1000 ease-out drop-shadow-md"
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                <span className="text-5xl font-black text-[#333866] tracking-tighter">
                  {Number(batteryData.soh).toFixed(0)}<span className="text-2xl text-slate-400">%</span>
                </span>
              </div>
            </div>
            <p className="text-sm font-bold text-slate-400">Battery Degradation Level</p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BARIS 3: TOTAL VOLTAGE, CURRENT, CYCLE COUNT */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          
          {/* Panel Total Voltage */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center">
            <h2 className="text-lg font-black text-[#333866] mb-4">Total Voltage</h2>
            <div className="flex-1 flex items-center justify-center py-6">
              <span className="text-5xl font-black text-[#333866] tracking-tighter">
                {Number(batteryData.total_voltage).toFixed(2)}<span className="text-2xl text-slate-400 ml-1">V</span>
              </span>
            </div>
            <p className="text-sm font-bold text-slate-400">Pack Output Voltage</p>
          </div>

          {/* Panel Current */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center">
            <h2 className="text-lg font-black text-[#333866] mb-4">Pack Current</h2>
            <div className="flex-1 flex items-center justify-center py-6">
              <span className="text-5xl font-black text-[#333866] tracking-tighter">
                {Number(batteryData.current).toFixed(2)}<span className="text-2xl text-slate-400 ml-1">A</span>
              </span>
            </div>
            <p className="text-sm font-bold text-slate-400">Real-time Current Load</p>
          </div>

          {/* Panel Cycle Count */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center">
            <h2 className="text-lg font-black text-[#333866] mb-4">Cycle Count</h2>
            <div className="flex-1 flex items-center justify-center py-6">
              <span className="text-5xl font-black text-[#333866] tracking-tighter">
                {batteryData.cycle_count}<span className="text-2xl text-slate-400 ml-1">x</span>
              </span>
            </div>
            <p className="text-sm font-bold text-slate-400">Total Charge Cycles</p>
          </div>

        </div>

      </main>
    </div>
  );
}