"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { runScan, getScanStatus } from "../lib/api";

export default function Sidebar() {
  const pathname = usePathname();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const handleScan = async () => {
    setScanning(true);
    setScanResult(null);
    try {
      const result = await runScan();
      if (result.ok) {
        setScanResult(`Found ${result.digestCount} signals!`);
        // Reload the page to show new digests
        window.location.reload();
      } else {
        setScanResult(result.errors?.[0] || "Scan failed");
      }
    } catch (err: any) {
      setScanResult("Scan error: " + err.message);
    } finally {
      setScanning(false);
    }
  };

  const navItems = [
    { href: "/", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" },
    { href: "/settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  ];

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">
          <span className="text-teal-400">Trend</span>Claw
        </h1>
        <p className="text-xs text-gray-500 mt-1">AI-Powered Sales Intelligence</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === item.href
                ? "bg-teal-500/10 text-teal-400"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d={item.icon}
              />
            </svg>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Scan Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleScan}
          disabled={scanning}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
            scanning
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-teal-500 text-white hover:bg-teal-400 hover:shadow-lg hover:shadow-teal-500/25"
          }`}
        >
          {scanning ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Scanning...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Run Scan
            </>
          )}
        </button>
        {scanResult && (
          <p className={`text-xs mt-2 text-center ${scanResult.includes("error") || scanResult.includes("failed") ? "text-red-400" : "text-green-400"}`}>
            {scanResult}
          </p>
        )}
      </div>
    </aside>
  );
}
