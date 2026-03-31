"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, RefreshCw, Users, Mail, Phone, MapPin, Building, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { apiClient } from "@/lib/api-simple";
import UserDetailModal from "./UserDetailModal";

type ProviderRow = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  city?: string | null;
  suburb?: string | null;
  created_at?: string;
  provider_profile?: {
    business_name?: string | null;
    verification_status?: string | null;
    subscription_tier?: string | null;
    credit_balance?: string | null;
    business_phone?: string | null;
    business_email?: string | null;
  };
};

export default function ProvidersManagement() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [search, setSearch] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadProviders = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      apiClient.setToken(token);
      // Uses ProviderProfile as source of truth (every signed-up pro has a profile row).
      const res: any = await apiClient.get("/api/auth/admin/providers/");
      const list = Array.isArray(res?.users) ? res.users : Array.isArray(res) ? res : [];
      setProviders(list);
    } catch (e: any) {
      const detail = e?.response?.data?.error || e?.response?.data?.detail;
      setError(detail || e?.message || "Failed to load providers");
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadProviders();
    }
  }, [token]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return providers;
    return providers.filter((p) => {
      const business = (p.provider_profile?.business_name || "").toLowerCase();
      const email = (p.email || "").toLowerCase();
      const name = `${p.first_name || ""} ${p.last_name || ""}`.trim().toLowerCase();
      const phone = (p.phone || "").toLowerCase();
      const location = `${p.suburb || ""} ${p.city || ""}`.trim().toLowerCase();
      const bizPhone = (p.provider_profile?.business_phone || "").toLowerCase();
      const bizEmail = (p.provider_profile?.business_email || "").toLowerCase();
      return (
        business.includes(q) ||
        email.includes(q) ||
        name.includes(q) ||
        phone.includes(q) ||
        location.includes(q) ||
        bizPhone.includes(q) ||
        bizEmail.includes(q)
      );
    });
  }, [providers, search]);

  const totals = useMemo(() => {
    const total = providers.length;
    const verified = providers.filter((p) => (p.provider_profile?.verification_status || "").toLowerCase() === "verified").length;
    return { total, verified };
  }, [providers]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Providers</h1>
          <p className="text-gray-600 mt-1">
            Total: <span className="font-semibold text-gray-900">{totals.total}</span> • Verified:{" "}
            <span className="font-semibold text-gray-900">{totals.verified}</span>
          </p>
        </div>
        <button
          onClick={loadProviders}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search business, email, name, phone, city..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Provider List ({filtered.length})
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No providers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filtered.map((p) => {
                  const business = p.provider_profile?.business_name || "—";
                  const fullName = `${p.first_name || ""} ${p.last_name || ""}`.trim() || "—";
                  const verification = (p.provider_profile?.verification_status || "—").toString();
                  const tier = (p.provider_profile?.subscription_tier || "—").toString().replaceAll("_", " ");
                  const location = [p.suburb, p.city].filter(Boolean).join(", ") || "—";
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="truncate max-w-[320px]" title={business}>
                            {business}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-[360px]" title={fullName}>
                          {fullName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="truncate max-w-[320px]" title={p.email}>
                            {p.email}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 flex items-center gap-2 mt-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{p.phone || "—"}</span>
                        </div>
                        {(p.provider_profile?.business_phone || p.provider_profile?.business_email) ? (
                          <div className="text-xs text-gray-500 mt-1">
                            <span className="font-medium text-gray-600">Business: </span>
                            {p.provider_profile?.business_phone || "—"}
                            <span className="mx-1">·</span>
                            {p.provider_profile?.business_email || "—"}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="truncate max-w-[260px]" title={location}>
                            {location}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-gray-400" />
                          <span className="capitalize">{verification}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 capitalize">{tier}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedEmail(p.email)}
                          className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedEmail && (
        <UserDetailModal
          email={selectedEmail}
          onClose={() => {
            setSelectedEmail(null);
            loadProviders();
          }}
        />
      )}
    </div>
  );
}

