"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function About() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/");
  };

  // Data Anggota Tim 
  const teamMembers = [
    { id: 1, name: "NICHOLAS SANDY KURNIAWAN", nickname: "NICHOLAS", img: "nicho.jpeg" },
    { id: 2, name: "SULTHAN SYAKIR ARYASATYA", nickname: "SYAKIR", img: "https://placehold.co/400x600/6079ca/ffffff?text=Syakir" },
    { id: 3, name: "DANNY TRI HARDIANTO", nickname: "DANNY", img: "https://placehold.co/400x600/333866/ffffff?text=Danny" },
    { id: 4, name: "NUR RAHMADINA", nickname: "DINA", img: "https://placehold.co/400x600/6079ca/ffffff?text=Dina" },
  ];

  return (
    <div className="flex min-h-screen bg-[#f4f7fe] text-slate-800 font-sans">
      
      {/* ========================================================= */}
      {/* SIDEBAR NAVIGASI KIRI - DIPERBARUI DENGAN STICKY & H-SCREEN */}
      {/* ========================================================= */}
      <aside className="w-64 bg-white flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 border-r border-slate-100 sticky top-0 h-screen flex-shrink-0">
        
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

        <nav className="flex-1 px-4 flex flex-col gap-2">
          {/* Dashboard */}
          <Link href="/dashboard" className="flex items-center gap-4 text-slate-400 hover:text-[#333866] hover:bg-slate-50 px-5 py-3.5 rounded-2xl font-semibold transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
            Dashboard
          </Link>
          
          {/* Analytic */}
          <Link href="/analytic" className="flex items-center gap-4 text-slate-400 hover:text-[#333866] hover:bg-slate-50 px-5 py-3.5 rounded-2xl font-semibold transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
            </svg>
            Analytic
          </Link>

          {/* Reports */}
          <Link href="/reports" className="flex items-center gap-4 text-slate-400 hover:text-[#333866] hover:bg-slate-50 px-5 py-3.5 rounded-2xl font-semibold transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            Reports
          </Link>

          {/* About Us (ACTIVE) */}
          <Link href="/about" className="flex items-center gap-4 bg-[#333866] text-white px-5 py-3.5 rounded-2xl font-bold transition-all shadow-md shadow-[#333866]/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" clipRule="evenodd" />
            </svg>
            About Us
          </Link>
        </nav>

        {/* TOMBOL LOG OUT - DITAMBAHKAN MT-AUTO */}
        <div className="p-6 mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 text-slate-400 hover:text-red-500 hover:bg-red-50 px-5 py-3.5 rounded-2xl font-bold transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
            Log Out
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* KONTEN UTAMA ABOUT US */}
      {/* ========================================================= */}
      <main className="flex-1 p-8 md:p-10 overflow-y-auto flex flex-col items-center">
        
        <header className="mb-10 w-full flex justify-center flex-shrink-0">
          <h1 className="text-[40px] font-black text-[#333866] tracking-tight uppercase">About B-HERO</h1>
        </header>

        {/* ========================================================= */}
        {/* PANEL PUTIH */}
        {/* ========================================================= */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-slate-100 p-12 md:p-16 mb-16 max-w-6xl w-full text-center flex flex-col items-center justify-center">
          
          <div className="max-w-3xl flex flex-col items-center gap-6">
            <h2 className="text-2xl font-bold text-[#333866] leading-tight">The Digital Twin of B-HERO battery pack is here for you!</h2>
            
            <div className="space-y-4 text-base text-slate-600 leading-relaxed">
              <p>
                Providing you information with precise battery parameter information. You can use this for visual aid and diagnostic purposes. So that you don't have to put yourself in risk to measure directly.
              </p>
              <p>
                Enjoy your B-HERO Digital Twin monitoring system without risk! We will prevent you and tell you if any anomaly happens, e.g. undervoltage and overheat of the battery pack!
              </p>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* OUR TEAM SECTION */}
        {/* ========================================================= */}
        <section className="w-full max-w-6xl flex flex-col items-center mb-12">
          <h3 className="text-center text-slate-400 font-bold text-sm uppercase tracking-[0.2em] mb-10">Our Team - Group 8</h3>
          
          <div className="w-full h-[600px] md:h-[420px] flex flex-col md:flex-row gap-3 md:gap-4 overflow-hidden">
            
            {teamMembers.map((member) => (
              <div 
                key={member.id} 
                className="relative flex-1 rounded-[1.5rem] overflow-hidden transition-all duration-500 ease-out hover:flex-[4] group cursor-pointer shadow-md"
              >
                {/* Foto Anggota */}
                <img 
                  src={member.img} 
                  alt={member.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                
                {/* Overlay Biru Inactive */}
                <div className="absolute inset-0 bg-[#333866]/80 group-hover:opacity-0 transition-opacity duration-500 z-10 flex items-start justify-start p-6">
                   <span className="text-white font-bold opacity-100 group-hover:opacity-0 whitespace-nowrap text-sm tracking-wider uppercase">
                     {member.nickname}
                   </span>
                </div>

                {/* Info Detail Active (saat Hover) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 md:p-8 z-20 pointer-events-none">
                  <h4 className="text-white font-black text-xl md:text-2xl md:-translate-y-4 group-hover:translate-y-0 transition-transform duration-500 whitespace-nowrap leading-tight">
                    {member.name}
                  </h4>
                  <p className="text-blue-300 text-xs md:text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 uppercase tracking-widest mt-2">
                    EE - Telkom University
                  </p>
                </div>
              </div>
            ))}
            
          </div>
        </section>

        {/* Footer info */}
        <footer className="mt-8 text-slate-400 text-sm font-bold flex justify-between px-2 flex-shrink-0 uppercase tracking-wider w-full max-w-7xl">
          <span>Supported by Dr. Marza Ihsan Marzuki, S.T., M.T.</span>
          <span>B-HERO SYSTEM v1.0</span>
        </footer>

      </main>
    </div>
  );
} 