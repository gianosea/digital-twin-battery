"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import * as XLSX from "xlsx"; 
// Import koneksi Supabase
import { supabase } from "@/utils/supabase"; 

export default function Reports() {
  const router = useRouter();

  // State untuk menyimpan data laporan dari database
  const [reportsData, setReportsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi untuk menarik data dari Supabase
  useEffect(() => {
    const fetchReportsData = async () => {
      // Menarik 100 data terbaru dari database
      const { data, error } = await supabase
        .from('battery_logs') // Pastikan nama tabel benar
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100); 

      if (data && !error) {
        // Mapping data database ke format yang mudah dibaca tabel UI
        const formattedData = data.map(item => ({
          // Format tanggal dan waktu ke standar lokal (Indonesia)
          timestamp: new Date(item.timestamp).toLocaleString("id-ID", {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
          }),
          // Fallback ke UBP-KMJ-01 jika battery_id kosong
          battery_id: item.battery_id || "UBP-KMJ-01", 
          current: item.current ?? 0,
          soc: item.soc ?? 0,
          soh: item.soh ?? 0,
          temp_1: item.temperature_1 ?? 0,
          temp_2: item.temperature_2 ?? 0,
          temp_3: item.temperature_3 ?? 0,
          temp_4: item.temperature_4 ?? 0,
          temp_5: item.temperature_5 ?? 0,
          temp_6: item.temperature_6 ?? 0,
          c1: item.cell1_voltage ?? 0,
          c2: item.cell2_voltage ?? 0,
          c3: item.cell3_voltage ?? 0,
          c4: item.cell4_voltage ?? 0,
          c5: item.cell5_voltage ?? 0,
          c6: item.cell6_voltage ?? 0,
          c7: item.cell7_voltage ?? 0,
          c8: item.cell8_voltage ?? 0,
          c9: item.cell9_voltage ?? 0,
          c10: item.cell10_voltage ?? 0,
          c11: item.cell11_voltage ?? 0,
          c12: item.cell12_voltage ?? 0,
          c13: item.cell13_voltage ?? 0,
        }));
        
        setReportsData(formattedData);
      } else if (error) {
        console.error("Gagal menarik data laporan:", error.message);
      }
      setIsLoading(false);
    };

    fetchReportsData();
  }, []);

  const handleLogout = () => {
    router.push("/");
  };

  // Fungsi untuk mengekspor data ke Excel (.xlsx) dengan rapi
  const handleExportExcel = () => {
    if (reportsData.length === 0) return; // Jangan export jika data kosong

    // 1. Format ulang nama kunci (key) agar rapi saat dibaca di Excel
    const excelFormattedData = reportsData.map(row => ({
      "Timestamp": row.timestamp,
      "Asset ID": row.battery_id,
      "Pack Current (A)": row.current,
      "State of Charge (%)": row.soc,
      "State of Health (%)": row.soh,
      "Temp Region 1 (°C)": row.temp_1,
      "Temp Region 2 (°C)": row.temp_2,
      "Temp Region 3 (°C)": row.temp_3,
      "Temp Region 4 (°C)": row.temp_4,
      "Temp Region 5 (°C)": row.temp_5,
      "Temp Region 6 (°C)": row.temp_6,
      "Cell 1 (V)": row.c1,
      "Cell 2 (V)": row.c2,
      "Cell 3 (V)": row.c3,
      "Cell 4 (V)": row.c4,
      "Cell 5 (V)": row.c5,
      "Cell 6 (V)": row.c6,
      "Cell 7 (V)": row.c7,
      "Cell 8 (V)": row.c8,
      "Cell 9 (V)": row.c9,
      "Cell 10 (V)": row.c10,
      "Cell 11 (V)": row.c11,
      "Cell 12 (V)": row.c12,
      "Cell 13 (V)": row.c13,
    }));

    // 2. Ubah array JSON menjadi worksheet Excel
    const worksheet = XLSX.utils.json_to_sheet(excelFormattedData);
    
    // 3. Buat workbook baru dan masukkan worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Battery Data");
    
    // 4. Simpan dan unduh filenya
    XLSX.writeFile(workbook, "BHERO_13S_Battery_Report.xlsx");
  };

  return (
    <div className="flex min-h-screen bg-[#f4f7fe] text-slate-800 font-sans">
      
      {/* ========================================================= */}
      {/* SIDEBAR NAVIGASI KIRI */}
      {/* ========================================================= */}
      <aside className="w-64 bg-white flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 border-r border-slate-100 flex-shrink-0">
        
        <div className="p-8 flex items-center gap-3">
          <Image src="/logo-bh.png" alt="B-Hero Logo" width={36} height={36} className="object-contain" style={{ width: 'auto', height: 'auto' }} priority />
          <span className="text-2xl font-black tracking-tight text-[#333866]">B-HERO</span>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-2">
          {/* Dashboard (Inactive) */}
          <Link href="/dashboard" className="flex items-center gap-4 text-slate-400 hover:text-[#333866] hover:bg-slate-50 px-5 py-3.5 rounded-2xl font-semibold transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>
            Dashboard
          </Link>
          
          {/* Analytic (Inactive) */}
         <Link href="/analytic" className="flex items-center gap-4 text-slate-400 hover:text-[#333866] hover:bg-slate-50 px-5 py-3.5 rounded-2xl font-semibold transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
            </svg>
            Analytic
          </Link>

          {/* Reports (ACTIVE MENU SEKARANG) */}
          <Link href="/reports" className="flex items-center gap-4 bg-[#333866] text-white px-5 py-3.5 rounded-2xl font-bold transition-all shadow-md shadow-[#333866]/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />
              <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
            </svg>
            Reports
          </Link>

          <Link href="about" className="flex items-center gap-4 text-slate-400 hover:text-[#333866] hover:bg-slate-50 px-5 py-3.5 rounded-2xl font-semibold transition-all">
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

      {/* ========================================================= */}
      {/* KONTEN UTAMA REPORTS */}
      {/* ========================================================= */}
      <main className="flex-1 p-8 md:p-10 overflow-hidden flex flex-col">
        
        {/* Header dan Tombol Export */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[32px] font-extrabold text-[#333866] tracking-tight">Data Reports</h1>
            <p className="text-slate-500 font-medium mt-1">Exportable historical logs from your battery parameters.</p>
          </div>
          
          <button 
            onClick={handleExportExcel}
            disabled={isLoading || reportsData.length === 0}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-3 shadow-md shadow-emerald-500/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {isLoading ? 'Loading Data...' : 'Export to Excel'}
          </button>
        </header>

        {/* ========================================================= */}
        {/* TABEL DATA LENGKAP */}
        {/* ========================================================= */}
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex-1 overflow-hidden flex flex-col">
          
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-black text-[#333866]">Data Log Overview</h2>
          </div>

          {/* Wrapper Tabel dengan Overflow Scroll */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-semibold">
                Fetching data from Supabase...
              </div>
            ) : (
              <table className="w-full text-sm text-left whitespace-nowrap">
                
                {/* Header Tabel */}
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10 shadow-sm font-black">
                  <tr>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Battery ID</th>
                    <th className="px-6 py-4">Current (A)</th>
                    <th className="px-6 py-4 text-center border-l border-slate-200" colSpan={6}>Temperatures (°C)</th>
                    <th className="px-6 py-4 border-l border-slate-200">SoC (%)</th>
                    <th className="px-6 py-4">SoH (%)</th>
                    <th className="px-6 py-4 text-center border-l border-slate-200" colSpan={13}>Cell Voltages (V)</th>
                  </tr>
                  {/* Sub-header untuk kolom yang di-group */}
                  <tr className="border-b border-slate-200 bg-white">
                    <th className="px-6 py-3"></th>
                    <th className="px-6 py-3"></th>
                    <th className="px-6 py-3"></th>
                    {/* Temp */}
                    <th className="px-4 py-3 border-l border-slate-200 text-center">R1</th>
                    <th className="px-4 py-3 text-center">R2</th>
                    <th className="px-4 py-3 text-center">R3</th>
                    <th className="px-4 py-3 text-center">R4</th>
                    <th className="px-4 py-3 text-center">R5</th>
                    <th className="px-4 py-3 text-center">R6</th>
                    <th className="px-6 py-3 border-l border-slate-200"></th>
                    <th className="px-6 py-3"></th>
                    {/* Voltages */}
                    <th className="px-3 py-3 border-l border-slate-200">1</th>
                    <th className="px-3 py-3">2</th>
                    <th className="px-3 py-3">3</th>
                    <th className="px-3 py-3">4</th>
                    <th className="px-3 py-3">5</th>
                    <th className="px-3 py-3">6</th>
                    <th className="px-3 py-3">7</th>
                    <th className="px-3 py-3">8</th>
                    <th className="px-3 py-3">9</th>
                    <th className="px-3 py-3">10</th>
                    <th className="px-3 py-3">11</th>
                    <th className="px-3 py-3">12</th>
                    <th className="px-3 py-3">13</th>
                  </tr>
                </thead>

                {/* Isi Tabel */}
                <tbody className="divide-y divide-slate-100">
                  {reportsData.map((row, index) => (
                    <tr key={index} className="hover:bg-[#f8f9fa] transition-colors">
                      <td className="px-6 py-4 font-semibold text-[#333866]">{row.timestamp}</td>
                      <td className="px-6 py-4 font-mono text-slate-500">{row.battery_id}</td>
                      <td className="px-6 py-4 font-bold text-emerald-600">{Number(row.current).toFixed(1)}</td>
                      
                      {/* Temps */}
                      <td className={`px-4 py-4 text-center border-l border-slate-50 ${row.temp_1 > 40 ? 'text-red-500 font-bold' : ''}`}>{Number(row.temp_1).toFixed(1)}</td>
                      <td className={`px-4 py-4 text-center ${row.temp_2 > 40 ? 'text-red-500 font-bold' : ''}`}>{Number(row.temp_2).toFixed(1)}</td>
                      <td className={`px-4 py-4 text-center ${row.temp_3 > 40 ? 'text-red-500 font-bold' : ''}`}>{Number(row.temp_3).toFixed(1)}</td>
                      <td className={`px-4 py-4 text-center ${row.temp_4 > 40 ? 'text-red-500 font-bold' : ''}`}>{Number(row.temp_4).toFixed(1)}</td>
                      <td className={`px-4 py-4 text-center ${row.temp_5 > 40 ? 'text-red-500 font-bold' : ''}`}>{Number(row.temp_5).toFixed(1)}</td>
                      <td className={`px-4 py-4 text-center ${row.temp_6 > 40 ? 'text-red-500 font-bold' : ''}`}>{Number(row.temp_6).toFixed(1)}</td>

                      <td className="px-6 py-4 font-bold text-blue-600 border-l border-slate-50">{Number(row.soc).toFixed(0)}</td>
                      <td className="px-6 py-4 font-bold text-emerald-600">{Number(row.soh).toFixed(0)}</td>

                      {/* Cells */}
                      <td className={`px-3 py-4 border-l border-slate-50 ${row.c1 < 3.0 || row.c1 > 4.2 ? 'text-amber-500 font-bold' : ''}`}>{Number(row.c1).toFixed(2)}</td>
                      <td className={`px-3 py-4 ${row.c2 < 3.0 || row.c2 > 4.2 ? 'text-amber-500 font-bold' : ''}`}>{Number(row.c2).toFixed(2)}</td>
                      <td className={`px-3 py-4 ${row.c3 < 3.0 || row.c3 > 4.2 ? 'text-amber-500 font-bold' : ''}`}>{Number(row.c3).toFixed(2)}</td>
                      <td className={`px-3 py-4 ${row.c4 < 3.0 || row.c4 > 4.2 ? 'text-amber-500 font-bold' : ''}`}>{Number(row.c4).toFixed(2)}</td>
                      <td className={`px-3 py-4 ${row.c5 < 3.0 || row.c5 > 4.2 ? 'text-amber-500 font-bold' : ''}`}>{Number(row.c5).toFixed(2)}</td>
                      <td className={`px-3 py-4 ${row.c6 < 3.0 || row.c6 > 4.2 ? 'text-amber-500 font-bold' : ''}`}>{Number(row.c6).toFixed(2)}</td>
                      <td className={`px-3 py-4 ${row.c7 < 3.0 || row.c7 > 4.2 ? 'text-amber-500 font-bold' : ''}`}>{Number(row.c7).toFixed(2)}</td>
                      <td className={`px-3 py-4 ${row.c8 < 3.0 || row.c8 > 4.2 ? 'text-amber-500 font-bold' : ''}`}>{Number(row.c8).toFixed(2)}</td>
                      <td className={`px-3 py-4 ${row.c9 < 3.0 || row.c9 > 4.2 ? 'text-amber-500 font-bold' : ''}`}>{Number(row.c9).toFixed(2)}</td>
                      <td className={`px-3 py-4 ${row.c10 < 3.0 || row.c10 > 4.2 ? 'text-amber-500 font-bold' : ''}`}>{Number(row.c10).toFixed(2)}</td>
                      <td className={`px-3 py-4 ${row.c11 < 3.0 || row.c11 > 4.2 ? 'text-amber-500 font-bold' : ''}`}>{Number(row.c11).toFixed(2)}</td>
                      <td className={`px-3 py-4 ${row.c12 < 3.0 || row.c12 > 4.2 ? 'text-amber-500 font-bold' : ''}`}>{Number(row.c12).toFixed(2)}</td>
                      <td className={`px-3 py-4 ${row.c13 < 3.0 || row.c13 > 4.2 ? 'text-amber-500 font-bold' : ''}`}>{Number(row.c13).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="p-4 border-t border-slate-100 text-xs text-slate-400 text-center font-semibold flex justify-between items-center px-8">
            <span>{isLoading ? 'Loading logs...' : `Showing ${reportsData.length} recent log entries.`}</span>
            <span>Data synced via Supabase Realtime</span>
          </div>
        </div>

      </main>
    </div>
  );
}