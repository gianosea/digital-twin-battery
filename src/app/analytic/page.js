"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
// Import komponen grafik dari Recharts
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { supabase } from "@/utils/supabase";

export default function Analytic() {
  const router = useRouter();

  // State untuk menyimpan data riwayat asli dari Supabase
  const [historyData, setHistoryData] = useState([]);
  
  // STATE BARU: Untuk menyimpan pilihan filter waktu aktif
  const [timeRange, setTimeRange] = useState("24H");

  useEffect(() => {
    const fetchHistoryData = async () => {
      // Kita naikkan limitnya menjadi 500 agar saat memilih 7D/30D datanya cukup mewakili
      let query = supabase
        .from('battery_logs') 
        .select('*')
        .order('timestamp', { ascending: false }) 
        .limit(500); 

      // ==========================================
      // LOGIKA FILTER WAKTU (24H, 7D, 30D)
      // ==========================================
      const now = new Date();
      let startDate = new Date();

      if (timeRange === "24H") {
        startDate.setHours(now.getHours() - 24);
      } else if (timeRange === "7D") {
        startDate.setDate(now.getDate() - 7);
      } else if (timeRange === "30D") {
        startDate.setDate(now.getDate() - 30);
      }

      // Terapkan filter ke Supabase
      query = query.gte('timestamp', startDate.toISOString());

      const { data, error } = await query;

      if (data && !error) {
        const reversedData = data.reverse();
        
        // ==========================================
        // LOGIKA PENANGANAN DATA GAP (KOSONG = NULL)
        // ==========================================
        const paddedData = [];
        const GAP_THRESHOLD_MS = 60 * 1000; // Batas toleransi tidak ada data: 1 Menit (60.000 ms)

        for (let i = 0; i < reversedData.length; i++) {
          const currentItem = reversedData[i];
          
          if (i > 0) {
            const prevItem = reversedData[i - 1];
            const currentMs = new Date(currentItem.timestamp).getTime();
            const prevMs = new Date(prevItem.timestamp).getTime();
            
            // Jika alat mati / tidak mengirim data lebih dari 1 menit
            if (currentMs - prevMs > GAP_THRESHOLD_MS) {
              // Suntikkan 1 titik dengan nilai "null" di tengah-tengah jeda
              // Ini akan menyuruh Recharts "memutus" garis grafik, bukan menjatuhkannya ke 0
              paddedData.push({
                timestamp: new Date((prevMs + currentMs) / 2).toISOString(), // Ambil waktu tengah
                total_voltage: null, current: null, soc: null, soh: null,
                temperature_1: null, temperature_2: null, temperature_3: null, 
                temperature_4: null, temperature_5: null, temperature_6: null
              });
            }
          }
          paddedData.push(currentItem);
        }

        // ==========================================
        // FORMAT DATA UNTUK RECHARTS
        // ==========================================
        const formattedData = paddedData.map((item) => {
          
          const dateObj = new Date(item.timestamp);
          let timeString = "";

          // FORMAT LABEL ADAPTIF: 
          if (timeRange === "24H") {
            timeString = dateObj.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });
          } else {
            timeString = dateObj.toLocaleString("id-ID", { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '');
          }

          // Cek apakah ini adalah titik "null" buatan kita untuk memutus garis
          if (item.total_voltage === null) {
            return {
              time: timeString,
              voltage: null, current: null, temp: null, soc: null, soh: null
            };
          }

          // Jika data normal, hitung seperti biasa
          const temp1 = item.temperature_1 ?? 0;
          const temp2 = item.temperature_2 ?? 0;
          const temp3 = item.temperature_3 ?? 0;
          const temp4 = item.temperature_4 ?? 0;
          const temp5 = item.temperature_5 ?? 0;
          const temp6 = item.temperature_6 ?? 0;
          const avgTemperature = (temp1 + temp2 + temp3 + temp4 + temp5 + temp6) / 6;

          return {
            time: timeString,
            voltage: item.total_voltage ?? 0,
            current: item.current ?? 0,
            temp: parseFloat(avgTemperature.toFixed(1)), 
            soc: item.soc ?? 0,
            soh: item.soh ?? 0
          };
        });

        setHistoryData(formattedData);
      } else if (error) {
        console.error("Gagal mengambil data analitik:", error.message);
      }
    };

    fetchHistoryData();
  }, [timeRange]); 

  const handleLogout = () => {
    router.push("/");
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100">
          <p className="text-slate-500 font-bold mb-2">{`Time: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="font-black text-lg">
              {entry.name}: {entry.value !== null ? entry.value : "No Data"}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex min-h-screen bg-[#f4f7fe] text-slate-800 font-sans">
      
      {/* SIDEBAR NAVIGASI KIRI */}
      <aside className="w-64 bg-white flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 border-r border-slate-100 flex-shrink-0">
        <div className="p-8 flex items-center gap-3">
          <Image src="/logo-bh.png" alt="B-Hero Logo" width={36} height={36} className="object-contain" priority style={{ width: 'auto', height: 'auto' }}/>
          <span className="text-2xl font-black tracking-tight text-[#333866]">B-HERO</span>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-2">
          <Link href="/dashboard" className="flex items-center gap-4 text-slate-400 hover:text-[#333866] hover:bg-slate-50 px-5 py-3.5 rounded-2xl font-semibold transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
            Dashboard
          </Link>
          
          <Link href="/analytic" className="flex items-center gap-4 bg-[#333866] text-white px-5 py-3.5 rounded-2xl font-bold transition-all shadow-md shadow-[#333866]/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 0 1 8.25-8.25.75.75 0 0 1 .75.75v6.75H18a.75.75 0 0 1 .75.75 8.25 8.25 0 0 1-16.5 0Z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M12.75 3a.75.75 0 0 1 .75-.75 8.25 8.25 0 0 1 8.25 8.25.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 1-.75-.75V3Z" clipRule="evenodd" />
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

        <div className="p-6">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 text-slate-400 hover:text-red-500 hover:bg-red-50 px-5 py-3.5 rounded-2xl font-bold transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>
            Log Out
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA ANALYTIC */}
      <main className="flex-1 p-8 md:p-10 overflow-y-auto">
        
        {/* HEADER DENGAN FILTER TOMBOL SEGMENTED */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[32px] font-extrabold text-[#333866] tracking-tight">Data Analytics</h1>
            <p className="text-slate-500 font-medium mt-1">Detailed historical trends of your 13S Battery Pack.</p>
          </div>
          
          {/* UI Tombol Filter */}
          <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
            <button 
              onClick={() => setTimeRange("24H")} 
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${timeRange === "24H" ? "bg-[#333866] text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
            >
              24H
            </button>
            <button 
              onClick={() => setTimeRange("7D")} 
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${timeRange === "7D" ? "bg-[#333866] text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
            >
              7D
            </button>
            <button 
              onClick={() => setTimeRange("30D")} 
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${timeRange === "30D" ? "bg-[#333866] text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
            >
              30D
            </button>
          </div>
        </header>

        {/* GRID GRAFIK UTAMA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 1. GRAFIK VOLTASE (Lebar Penuh 2 Kolom) */}
          <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-xl font-black text-[#333866] mb-6">Voltage History (V)</h2>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVoltage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6079ca" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6079ca" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="voltage" name="Pack Voltage" stroke="#6079ca" strokeWidth={4} fillOpacity={1} fill="url(#colorVoltage)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. GRAFIK ARUS */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-xl font-black text-[#333866] mb-6">Current Flow (A)</h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10}/>
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="current" name="Current" stroke="#10b981" strokeWidth={4} dot={{r: 4, fill: '#10b981'}} activeDot={{r: 8}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. GRAFIK SUHU */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-xl font-black text-[#333866] mb-6">Avg Temperature (°C)</h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10}/>
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} domain={['dataMin - 5', 'dataMax + 5']}/>
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="temp" name="Temperature" stroke="#f59e0b" strokeWidth={4} fillOpacity={1} fill="url(#colorTemp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. GRAFIK SOC */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-xl font-black text-[#333866] mb-6">State of Charge (%)</h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10}/>
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} domain={[0, 100]}/>
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="soc" name="SoC" stroke="#3b82f6" strokeWidth={4} dot={{r: 4, fill: '#3b82f6'}} activeDot={{r: 8}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 5. GRAFIK SOH */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-xl font-black text-[#333866] mb-6">State of Health (%)</h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10}/>
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} domain={['dataMin - 1', 'dataMax + 1']}/>
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="stepAfter" dataKey="soh" name="SoH" stroke="#333866" strokeWidth={4} dot={{r: 4, fill: '#333866'}} activeDot={{r: 8}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}