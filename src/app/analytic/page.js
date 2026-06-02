"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { supabase } from "@/utils/supabase";

export default function Analytic() {
  const router = useRouter();

  // ==========================================
  // STATE UNTUK PEMILIHAN BATERAI & WAKTU
  // ==========================================
  const [historyData, setHistoryData] = useState([]);
  
  // State Filter Baru
  const [filterType, setFilterType] = useState("custom_limit");
  const [customLimit, setCustomLimit] = useState(500); 
  const [specificDate, setSpecificDate] = useState("");
  const [specificMonth, setSpecificMonth] = useState("");

  const [batteryIds, setBatteryIds] = useState([]);
  const [selectedBatteryId, setSelectedBatteryId] = useState("");

  // ==========================================
  // EFFECT 1: MENGAMBIL DAFTAR ID BATERAI UNIK
  // ==========================================
  useEffect(() => {
    const fetchBatteryIds = async () => {
      const { data, error } = await supabase
        .from('battery_logs')
        .select('battery_id')
        .order('timestamp', { ascending: false })
        .limit(2000); 

      if (data && !error) {
        const uniqueIds = [...new Set(data.map(item => item.battery_id).filter(Boolean))];
        setBatteryIds(uniqueIds);
        
        if (uniqueIds.length > 0) {
          setSelectedBatteryId(uniqueIds[0]);
        }
      }
    };
    fetchBatteryIds();
  }, []);

  // ==========================================
  // EFFECT 2: FETCH DATA GRAFIK BERDASARKAN ID & FILTER
  // ==========================================
  useEffect(() => {
    if (!selectedBatteryId) return;

    const fetchHistoryData = async () => {
      let query = supabase
        .from('battery_logs') 
        .select('*')
        .eq('battery_id', selectedBatteryId) 
        .order('timestamp', { ascending: false });

      // 1. Logika Kueri Berdasarkan Filter
      if (filterType === "custom_limit") {
        query = query.limit(customLimit > 0 ? customLimit : 1);

      } else if (filterType === "today") {
        const start = new Date();
        start.setHours(0, 0, 0, 0); 
        query = query.gte('timestamp', start.toISOString()).limit(5000);

      } else if (filterType === "week") {
        const start = new Date();
        start.setDate(start.getDate() - 7);
        query = query.gte('timestamp', start.toISOString()).limit(20000);

      } else if (filterType === "specific_month" && specificMonth) {
        const start = new Date(`${specificMonth}-01T00:00:00`);
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);
        query = query.gte('timestamp', start.toISOString()).lte('timestamp', end.toISOString()).limit(50000);

      } else if (filterType === "specific_date" && specificDate) {
        const start = new Date(`${specificDate}T00:00:00`);
        const end = new Date(`${specificDate}T23:59:59`);
        query = query.gte('timestamp', start.toISOString()).lte('timestamp', end.toISOString()).limit(5000);
      } else if (filterType === "specific_date" || filterType === "specific_month") {
        query = query.limit(0); 
      }

      const { data, error } = await query;

      if (data && !error) {
        const reversedData = data.reverse();
        const grouped = {};
        
        // 2. Downsampling / Grouping
        reversedData.forEach(item => {
          const d = new Date(item.timestamp);
          let key;
          
          if (filterType === "week" || filterType === "specific_month") {
            key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; 
          } else if (filterType === "today" || filterType === "specific_date") {
            key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}-${Math.floor(d.getMinutes() / 10)}`; 
          } else {
            key = item.timestamp;
          }
          grouped[key] = item; 
        });
        
        const downsampledData = Object.values(grouped);
        
        // --- BLOK PADDING DAHULU DIHAPUS DARI SINI ---
        
        // 3. Formatting akhir (langsung map dari downsampledData)
        const formattedData = downsampledData.map((item) => {
          const dateObj = new Date(item.timestamp);
          const unixTimeMs = dateObj.getTime(); 
          let tooltipTimeString = dateObj.toLocaleString("id-ID", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(',', '');

          const temp1 = item.temperature_1 ?? 0;
          const temp2 = item.temperature_2 ?? 0;
          const temp3 = item.temperature_3 ?? 0;
          const temp4 = item.temperature_4 ?? 0;
          const temp5 = item.temperature_5 ?? 0;
          const temp6 = item.temperature_6 ?? 0;
          const avgTemperature = (temp1 + temp2 + temp3 + temp4 + temp5 + temp6) / 6;

          return {
            time: unixTimeMs,             
            fullTime: tooltipTimeString,  
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
  }, [filterType, specificDate, specificMonth, selectedBatteryId, customLimit]); 

  const handleLogout = () => router.push("/");

  const formatXAxis = (tickItem) => {
    const dateObj = new Date(tickItem);
    if (filterType === "custom_limit" || filterType === "today" || filterType === "specific_date") {
      return dateObj.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });
    }
    return dateObj.toLocaleDateString("id-ID", { day: '2-digit', month: '2-digit' });
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const timeLabel = payload[0].payload.fullTime; 
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100">
          <p className="text-slate-500 font-bold mb-2">{`Time: ${timeLabel}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="font-black text-lg">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (tickItem) => {
    return typeof tickItem === 'number' ? tickItem.toFixed(1) : tickItem;
  };

  return (
    <div className="flex min-h-screen bg-[#f4f7fe] text-slate-800 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 border-r border-slate-100 sticky top-0 h-screen flex-shrink-0">
        <div className="p-8 flex items-center gap-3">
          <Image src="/logo-bh.png" alt="B-Hero Logo" width={36} height={36} className="object-contain" priority style={{ width: 'auto', height: 'auto' }}/>
          <span className="text-2xl font-black tracking-tight text-[#333866]">B-HERO</span>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-2">
          <Link href="/dashboard" className="flex items-center gap-4 text-slate-400 hover:text-[#333866] hover:bg-slate-50 px-5 py-3.5 rounded-2xl font-semibold transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>
            Dashboard
          </Link>
          <Link href="/analytic" className="flex items-center gap-4 bg-[#333866] text-white px-5 py-3.5 rounded-2xl font-bold transition-all shadow-md shadow-[#333866]/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 0 1 8.25-8.25.75.75 0 0 1 .75.75v6.75H18a.75.75 0 0 1 .75.75 8.25 8.25 0 0 1-16.5 0Z" clipRule="evenodd" /><path fillRule="evenodd" d="M12.75 3a.75.75 0 0 1 .75-.75 8.25 8.25 0 0 1 8.25 8.25.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 1-.75-.75V3Z" clipRule="evenodd" /></svg>
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

        <div className="p-6 mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 text-slate-400 hover:text-red-500 hover:bg-red-50 px-5 py-3.5 rounded-2xl font-bold transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>
            Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 md:p-10 overflow-y-auto">
        
        <header className="mb-8 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h1 className="text-[32px] font-extrabold text-[#333866] tracking-tight">Data Analytics</h1>
            <p className="text-slate-500 font-medium mt-1">Detailed historical trends of your Battery Pack.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            
            {/* DROPDOWN PEMILIH BATERAI */}
            <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-xl shadow-sm border border-slate-200 w-full sm:w-auto">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-emerald-500">
                <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
              </svg>
              <div className="flex flex-col flex-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Asset</span>
                <select
                  value={selectedBatteryId}
                  onChange={(e) => setSelectedBatteryId(e.target.value)}
                  className="bg-transparent font-bold text-[#333866] text-sm outline-none cursor-pointer border-none p-0 focus:ring-0 appearance-none pr-6 relative"
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23333866%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right center", backgroundSize: "8px" }}
                >
                  {batteryIds.length === 0 ? (
                    <option value="">Searching...</option>
                  ) : (
                    batteryIds.map(id => (
                      <option key={id} value={id}>{id}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* DROPDOWN FILTER WAKTU */}
            <div className="relative w-full sm:w-auto">
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-200 text-[#333866] px-5 py-3 pr-10 rounded-xl font-bold cursor-pointer hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
              >
                <option value="custom_limit">Last X Records</option>
                <option value="today">Today</option>
                <option value="week">Last Week</option>
                <option value="specific_month">Specific Month</option>
                <option value="specific_date">Specific Date</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            {/* KONDISIONAL: MUNCUL INPUT ANGKA JIKA CUSTOM LIMIT TERPILIH */}
            {filterType === "custom_limit" && (
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2.5 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                <span className="text-sm font-bold text-slate-400">Last</span>
                <input 
                  type="number"
                  min="1"
                  value={customLimit}
                  onChange={(e) => setCustomLimit(parseInt(e.target.value) || 0)}
                  className="w-16 bg-transparent text-[#333866] font-bold outline-none text-center"
                />
              </div>
            )}

            {/* KONDISIONAL: MUNCUL KALENDER JIKA SPECIFIC DATE TERPILIH */}
            {filterType === "specific_date" && (
              <input 
                type="date"
                value={specificDate}
                onChange={(e) => setSpecificDate(e.target.value)}
                className="bg-white border border-slate-200 text-[#333866] px-4 py-3 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
              />
            )}

            {/* KONDISIONAL: MUNCUL PICKER BULAN JIKA SPECIFIC MONTH TERPILIH */}
            {filterType === "specific_month" && (
              <input 
                type="month"
                value={specificMonth}
                onChange={(e) => setSpecificMonth(e.target.value)}
                className="bg-white border border-slate-200 text-[#333866] px-4 py-3 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
              />
            )}

          </div>
        </header>

        {/* CHART WIDGETS BAWAH */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-xl font-black text-[#333866] mb-6">Voltage History (V)</h2>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVoltage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6079ca" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6079ca" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} tickFormatter={formatXAxis} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                  <YAxis tickFormatter={formatYAxis} width={40} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="voltage" name="Pack Voltage" stroke="#6079ca" strokeWidth={4} fillOpacity={1} fill="url(#colorVoltage)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-xl font-black text-[#333866] mb-6">Current Flow (A)</h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} tickFormatter={formatXAxis} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10}/>
                  <YAxis tickFormatter={formatYAxis} width={40} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} domain={['auto', 'auto']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="current" name="Current" stroke="#10b981" strokeWidth={4} dot={{r: 4, fill: '#10b981'}} activeDot={{r: 8}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-xl font-black text-[#333866] mb-6">Avg Temperature (°C)</h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} tickFormatter={formatXAxis} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10}/>
                  <YAxis tickFormatter={formatYAxis} width={40} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} domain={['dataMin - 2', 'dataMax + 2']}/>
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="temp" name="Temperature" stroke="#f59e0b" strokeWidth={4} fillOpacity={1} fill="url(#colorTemp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-xl font-black text-[#333866] mb-6">State of Charge (%)</h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} tickFormatter={formatXAxis} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10}/>
                  <YAxis tickFormatter={formatYAxis} width={40} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} domain={[0, 100]}/>
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="soc" name="SoC" stroke="#3b82f6" strokeWidth={4} dot={{r: 4, fill: '#3b82f6'}} activeDot={{r: 8}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-xl font-black text-[#333866] mb-6">State of Health (%)</h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} tickFormatter={formatXAxis} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10}/>
                  <YAxis tickFormatter={formatYAxis} width={40} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} domain={['dataMin - 1', 'dataMax + 1']}/>
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