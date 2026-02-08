"use client";

import { useEffect, useState } from "react";
import {
  getClients,
  addClient,
  deleteClient,
  getKeywords,
  addKeyword,
  deleteKeyword,
} from "../../lib/api";

interface Client {
  id: number;
  name: string;
  domain: string | null;
}

interface Keyword {
  id: number;
  keyword: string;
}

export default function SettingsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [clientName, setClientName] = useState("");
  const [clientDomain, setClientDomain] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [c, k] = await Promise.all([getClients(), getKeywords()]);
    setClients(c);
    setKeywords(k);
  }

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleAddClient(e: React.FormEvent) {
    e.preventDefault();
    if (!clientName.trim()) return;
    try {
      const result = await addClient(clientName.trim(), clientDomain.trim());
      if (result.error) {
        showToast(result.error, "error");
      } else {
        setClients((prev) => [result, ...prev]);
        setClientName("");
        setClientDomain("");
        showToast("Client added!");
      }
    } catch {
      showToast("Failed to add client", "error");
    }
  }

  async function handleDeleteClient(id: number) {
    await deleteClient(id);
    setClients((prev) => prev.filter((c) => c.id !== id));
    showToast("Client removed");
  }

  async function handleAddKeyword(e: React.FormEvent) {
    e.preventDefault();
    if (!keywordInput.trim()) return;
    try {
      const result = await addKeyword(keywordInput.trim());
      if (result.error) {
        showToast(result.error, "error");
      } else {
        setKeywords((prev) => [result, ...prev]);
        setKeywordInput("");
        showToast("Keyword added!");
      }
    } catch {
      showToast("Failed to add keyword", "error");
    }
  }

  async function handleDeleteKeyword(id: number) {
    await deleteKeyword(id);
    setKeywords((prev) => prev.filter((k) => k.id !== id));
    showToast("Keyword removed");
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-all ${
            toast.type === "success"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your tracked companies and keywords</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Clients Section */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Companies</h2>
          <form onSubmit={handleAddClient} className="mb-4 space-y-2">
            <input
              type="text"
              placeholder="Company name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 text-sm"
            />
            <input
              type="text"
              placeholder="Domain (optional)"
              value={clientDomain}
              onChange={(e) => setClientDomain(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 text-sm"
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-400 transition-colors"
            >
              Add Company
            </button>
          </form>

          <div className="space-y-2">
            {clients.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-white">{client.name}</p>
                  {client.domain && (
                    <p className="text-xs text-gray-500">{client.domain}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteClient(client.id)}
                  className="text-gray-500 hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {clients.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No companies added yet</p>
            )}
          </div>
        </div>

        {/* Keywords Section */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Trend Keywords</h2>
          <form onSubmit={handleAddKeyword} className="mb-4 space-y-2">
            <input
              type="text"
              placeholder="Enter keyword"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 text-sm"
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-400 transition-colors"
            >
              Add Keyword
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <span
                key={kw.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-full text-sm text-gray-300"
              >
                {kw.keyword}
                <button
                  onClick={() => handleDeleteKeyword(kw.id)}
                  className="text-gray-500 hover:text-red-400 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
            {keywords.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4 w-full">No keywords added yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
