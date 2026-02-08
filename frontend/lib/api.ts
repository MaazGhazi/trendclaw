const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:18800";
const USER_ID = "demo-user";

function headers(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-user-id": USER_ID,
  };
}

// --- Digests ---
export async function getDigestsLatest() {
  const res = await fetch(`${API_BASE}/api/digests/latest`, {
    headers: headers(),
    cache: "no-store",
  });
  return res.json();
}

export async function getDigests(date?: string) {
  const url = date
    ? `${API_BASE}/api/digests?date=${date}`
    : `${API_BASE}/api/digests`;
  const res = await fetch(url, { headers: headers(), cache: "no-store" });
  return res.json();
}

// --- Scan ---
export async function runScan() {
  const res = await fetch(`${API_BASE}/api/scan`, {
    method: "POST",
    headers: headers(),
  });
  return res.json();
}

export async function getScanStatus() {
  const res = await fetch(`${API_BASE}/api/scan/status`, {
    headers: headers(),
    cache: "no-store",
  });
  return res.json();
}

// --- Clients ---
export async function getClients() {
  const res = await fetch(`${API_BASE}/api/clients`, {
    headers: headers(),
    cache: "no-store",
  });
  return res.json();
}

export async function addClient(name: string, domain: string) {
  const res = await fetch(`${API_BASE}/api/clients`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ name, domain }),
  });
  return res.json();
}

export async function deleteClient(id: number) {
  const res = await fetch(`${API_BASE}/api/clients/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  return res.json();
}

// --- Keywords ---
export async function getKeywords() {
  const res = await fetch(`${API_BASE}/api/keywords`, {
    headers: headers(),
    cache: "no-store",
  });
  return res.json();
}

export async function addKeyword(keyword: string) {
  const res = await fetch(`${API_BASE}/api/keywords`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ keyword }),
  });
  return res.json();
}

export async function deleteKeyword(id: number) {
  const res = await fetch(`${API_BASE}/api/keywords/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  return res.json();
}
