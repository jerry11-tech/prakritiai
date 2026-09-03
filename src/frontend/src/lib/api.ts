const API_BASE = "http://127.0.0.1:8000/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

function setAuth(token: string) {
  localStorage.setItem("auth_token", token);
}

function clearAuth() {
  localStorage.removeItem("auth_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  const token = getToken();
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.detail || `Request failed (${res.status})`);
  }
  return data as T;
}

export type UserRole = "ADMIN" | "EXPERT" | "USER";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  specialization?: string;
  isActive?: boolean;
};

export const api = {
  // Public Auth
  registerUser: (name: string, email: string, password: string) =>
    request<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  loginUser: (email: string, password: string) =>
    request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  registerExpert: (name: string, email: string, password: string, specialization: string, professionalDetails: string) =>
    request<{ status: string; message: string; expertId: number }>("/expert/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, specialization, professional_details: professionalDetails }),
    }),

  loginExpert: (email: string, password: string) =>
    request<{ token: string; user: User }>("/expert/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request<{ user: User }>("/auth/me"),

  // Level 1: USER
  analyze: (answers: Record<string, string>, imageBase64?: string, imageReference?: string) =>
    request<any>("/prakriti/analyze", {
      method: "POST",
      body: JSON.stringify({ answers, image_base64: imageBase64, image_reference: imageReference }),
    }),

  getUserTest: (testId: string) => request<any>(`/prakriti/tests/${testId}`),
  listUserTests: () => request<{ tests: any[] }>("/prakriti/my-tests"),
  deleteUserAccount: () => request<{ status: string; message: string }>("/user/account", { method: "DELETE" }),

  // Level 2: EXPERT
  getExpertDashboard: () => request<any>("/expert/dashboard"),
  listExpertTests: (status?: string) => request<{ tests: any[] }>(`/expert/tests${status ? `?status=${status}` : ""}`),
  getExpertTestDetail: (testId: string) => request<any>(`/expert/tests/${testId}`),
  verifyTest: (testId: string, notes?: string) =>
    request<any>(`/expert/tests/${testId}/verify`, {
      method: "POST",
      body: JSON.stringify({ notes: notes || "" }),
    }),
  rejectTest: (testId: string, notes?: string) =>
    request<any>(`/expert/tests/${testId}/reject`, {
      method: "POST",
      body: JSON.stringify({ notes: notes || "" }),
    }),
  getVerifiedData: () => request<any>("/expert/verified-data"),
  downloadPdfReport: () =>
    fetch(`${API_BASE}/expert/reports/pdf`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then((r) => r.blob()),

  // Level 3: ADMIN
  listAdminUsers: () => request<{ users: any[] }>("/admin/users"),
  toggleUserStatus: (userId: number, isActive: boolean) =>
    request<any>(`/admin/users/${userId}/toggle-status`, {
      method: "POST",
      body: JSON.stringify({ is_active: isActive }),
    }),
  listAdminExperts: () => request<{ experts: any[] }>("/admin/experts"),
  approveExpert: (expertId: number) => request<any>(`/admin/experts/${expertId}/approve`, { method: "POST" }),
  rejectExpert: (expertId: number) => request<any>(`/admin/experts/${expertId}/reject`, { method: "POST" }),
  assignSpecialization: (expertId: number, specialization: string) =>
    request<any>(`/admin/experts/${expertId}/assign-specialization`, {
      method: "POST",
      body: JSON.stringify({ specialization }),
    }),
  getAdminResults: () => request<{ totalResults: number; results: any[] }>("/admin/results"),
  getAdminAuditLogs: (limit = 100) => request<{ total: number; logs: any[] }>(`/admin/audit-logs?limit=${limit}`),
  getAdminSettings: () => request<{ settings: any }>("/admin/settings"),
  updateAdminSettings: (settings: Record<string, any>) =>
    request<any>("/admin/settings", {
      method: "POST",
      body: JSON.stringify(settings),
    }),
  getResearchDashboard: () => request<any>("/research-dashboard"),
  syncExcel: () => request<any>("/sync-excel", { method: "POST" }),
  downloadExcel: () =>
    fetch(`${API_BASE}/download-excel`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then((r) => r.blob()),

  // Utilities
  clearAuth,
  getToken,
  setAuth,
};
