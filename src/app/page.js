"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // State baru untuk menyimpan pesan error
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Logika Login
    if (username === "admin" && password === "admin") {
      // Jika benar: hilangkan error dan pindah halaman
      setErrorMessage(""); 
      router.push("/dashboard"); 
    } else {
      // Jika salah: munculkan pesan error merah, JANGAN kasih tau passwordnya!
      setErrorMessage("Invalid login credentials.");
    }
  };

  return (
    <main
      className="relative flex min-h-screen w-full items-center justify-center"
      style={{ 
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center"
      }}
    >
      {/* Overlay Gelap */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.3)", zIndex: 0 }}></div>

      {/* Logo Telkom University */}
      <div style={{ position: "absolute", top: "24px", left: "24px", zIndex: 20 }}>
        <Image
          src="/logo.png"
          alt="Telkom University Logo"
          width={150}
          height={50}
          style={{ width: "150px", height: "auto" }}
          priority
        />
      </div>

      {/* Kartu Form Login */}
      <div 
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: "40px",
          padding: "40px",
          boxShadow: "0px 20px 40px rgba(0, 0, 0, 0.4)",
          width: "100%",
          maxWidth: "450px",
          position: "relative",
          zIndex: 10,
          margin: "0 16px"
        }}
      >
        
        {/* Logo BH */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <Image
            src="/logo-bh.png"
            alt="Logo BH"
            width={80}
            height={80}
            style={{ width: "80px", height: "80px", objectFit: "contain" }}
            priority
          />
        </div>

        {/* Teks Welcome */}
        <h1 style={{ textAlign: "center", fontSize: "2.25rem", fontWeight: "800", color: "#1e2759", margin: "0 0 8px 0" }}>
          Welcome!
        </h1>
        
        {/* ========================================================= */}
        {/* LOGIKA PERUBAHAN TEKS NOTIFIKASI ERROR                    */}
        {/* ========================================================= */}
        {errorMessage ? (
          // Jika ada error, tampilkan teks ini (Warna Merah)
          <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#ef4444", fontWeight: "600", marginBottom: "32px", padding: "0 8px" }}>
            {errorMessage}
          </p>
        ) : (
          // Jika tidak ada error, tampilkan teks instruksi asli (Warna Abu-abu)
          <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#475569", marginBottom: "32px", padding: "0 8px" }}>
            Enter the username and password according to the registered account.
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Input Username */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: "700", color: "#1e2759" }}>
              Username
            </label>
            <input
              type="text"
              placeholder="Input username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrorMessage(""); // Menghilangkan pesan error otomatis saat user mulai ngetik lagi
              }}
              style={{ 
                width: "100%", 
                borderRadius: "12px", 
                // Jika error, border input juga jadi merah!
                border: errorMessage ? "2px solid #ef4444" : "1px solid rgba(148, 163, 184, 0.6)", 
                backgroundColor: "transparent", 
                padding: "16px", 
                color: "#0f172a", 
                outline: "none" 
              }}
              required
            />
          </div>

          {/* Input Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: "700", color: "#1e2759" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Input Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage(""); // Menghilangkan pesan error otomatis saat user mulai ngetik lagi
                }}
                style={{ 
                  width: "100%", 
                  borderRadius: "12px", 
                  // Jika error, border input juga jadi merah!
                  border: errorMessage ? "2px solid #ef4444" : "1px solid rgba(148, 163, 184, 0.6)", 
                  backgroundColor: "transparent", 
                  padding: "16px", 
                  paddingRight: "48px", 
                  color: "#0f172a", 
                  outline: "none" 
                }}
                required
              />
              
              {/* Tombol Ikon Mata */}
              <span 
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", 
                  color: "rgba(30, 39, 89, 0.6)", display: "flex", alignItems: "center", cursor: "pointer" 
                }}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </span>
            </div>
          </div>

          {/* Button Login */}
          <button
            type="submit"
            style={{ marginTop: "16px", width: "100%", borderRadius: "9999px", backgroundColor: "#1e2759", padding: "16px", fontSize: "0.875rem", fontWeight: "700", color: "#ffffff", border: "none", cursor: "pointer", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
          >
            Login
          </button>
        </form>

      </div>
    </main>
  );
}