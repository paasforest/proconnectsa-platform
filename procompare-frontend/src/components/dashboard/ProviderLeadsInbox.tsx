"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Loader2,
  Sparkles,
  MessageCircle,
  CheckCircle2,
  Lock,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-simple";
import { useAuth } from "@/components/AuthProvider";
import UnlockLeadModal, {
  type CustomerDetails,
} from "@/components/leads/UnlockLeadModal";

export type ForMeDisplayStatus = "new" | "active" | "done" | "expired";

export interface ForMeLeadRow {
  assignment_id: string;
  lead_id: string;
  title: string;
  category_name: string | null;
  city: string | null;
  distance_km: number | null;
  credits_required: number;
  display_status: ForMeDisplayStatus;
  created_at: string;
  unlocked: boolean;
  cta_hint: string;
}

type InboxTab = "new" | "active" | "done";

function tabMatches(row: ForMeLeadRow, tab: InboxTab): boolean {
  if (tab === "new") return row.display_status === "new";
  if (tab === "active") return row.display_status === "active";
  return row.display_status === "done" || row.display_status === "expired";
}

function statusBadgeClass(s: ForMeDisplayStatus): string {
  switch (s) {
    case "new":
      return "bg-amber-100 text-amber-900";
    case "active":
      return "bg-blue-100 text-blue-800";
    case "done":
      return "bg-emerald-100 text-emerald-900";
    case "expired":
      return "bg-gray-200 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function ProviderLeadsInbox() {
  const { token } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<InboxTab>("new");
  const [rows, setRows] = useState<ForMeLeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [unlockAssignmentId, setUnlockAssignmentId] = useState<string | null>(
    null
  );
  const [unlockCreditsRequired, setUnlockCreditsRequired] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      apiClient.setToken(token);
      const merged: ForMeLeadRow[] = [];
      let page = 1;
      // Follow pagination until exhausted (cap pages for safety)
      for (let i = 0; i < 20; i++) {
        const data = (await apiClient.get(
          `/api/leads/for-me/?page=${page}&page_size=100`
        )) as {
          results?: ForMeLeadRow[];
          next?: string | null;
        };
        const batch = Array.isArray(data?.results) ? data.results : [];
        merged.push(...batch);
        if (!data?.next || batch.length === 0) break;
        page += 1;
      }
      setRows(merged);
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message?: string }).message)
          : "Could not load leads";
      setError(msg);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () => rows.filter((r) => tabMatches(r, tab)),
    [rows, tab]
  );

  const counts = useMemo(() => {
    let n = 0,
      a = 0,
      d = 0;
    for (const r of rows) {
      if (r.display_status === "new") n++;
      else if (r.display_status === "active") a++;
      else if (r.display_status === "done" || r.display_status === "expired") d++;
    }
    return { new: n, active: a, done: d };
  }, [rows]);

  const goCta = (row: ForMeLeadRow) => {
    if (row.display_status === "new" && !row.unlocked) {
      setUnlockAssignmentId(row.assignment_id);
      setUnlockCreditsRequired(row.credits_required);
      setUnlockOpen(true);
      return;
    }
    if (row.display_status === "new") {
      router.push("/dashboard/leads-dashboard");
      return;
    }
    if (row.display_status === "active") {
      router.push("/dashboard/my-leads");
      return;
    }
    router.push("/dashboard/my-leads");
  };

  const handleUnlocked = (_d: CustomerDetails) => {
    if (unlockAssignmentId) {
      setRows((prev) =>
        prev.map((r) =>
          r.assignment_id === unlockAssignmentId
            ? {
                ...r,
                display_status: "active",
                unlocked: true,
                cta_hint: "Continue with this lead",
              }
            : r
        )
      );
    }
    setToast("Lead unlocked! Contact the customer now.");
    window.dispatchEvent(new Event("proconnect-wallet-refresh"));
    setTimeout(() => setToast(null), 5000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-600 mt-1">
            New matches, active conversations, and completed leads — same data as
            the marketplace, organised for quick action.
          </p>
        </div>
        <button
          type="button"
          onClick={() => load()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6">
        {(
          [
            ["new", "New", counts.new],
            ["active", "Active", counts.active],
            ["done", "Done", counts.done],
          ] as const
        ).map(([key, label, c]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors ${
              tab === key
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {label}
            <span className="ml-1.5 text-xs font-normal text-gray-500">({c})</span>
          </button>
        ))}
      </div>

      {unlockAssignmentId && (
        <UnlockLeadModal
          assignmentId={unlockAssignmentId}
          creditsRequired={unlockCreditsRequired}
          isOpen={unlockOpen}
          onClose={() => {
            setUnlockOpen(false);
            setUnlockAssignmentId(null);
          }}
          onUnlocked={handleUnlocked}
        />
      )}

      {toast && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-sm">
          {toast}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading && rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="h-10 w-10 animate-spin mb-3" />
          <p>Loading your leads…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Sparkles className="h-10 w-10 text-blue-400 mx-auto mb-3" />
          <p className="text-gray-900 font-medium">Nothing in this tab yet</p>
          <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
            {tab === "new" &&
              "When we route new jobs to you, they appear here before you unlock contact details."}
            {tab === "active" &&
              "After you unlock a lead, follow up from My purchased leads or Chat."}
            {tab === "done" &&
              "Won, lost, expired, and closed leads show up here for your records."}
          </p>
          <button
            type="button"
            onClick={() => router.push("/dashboard/leads-dashboard")}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Browse marketplace
          </button>
        </div>
      ) : (
        <ul className="space-y-4">
          {filtered.map((row) => (
            <li
              key={row.assignment_id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${statusBadgeClass(
                        row.display_status
                      )}`}
                    >
                      {row.display_status}
                    </span>
                    {row.category_name && (
                      <span className="text-xs text-gray-500">{row.category_name}</span>
                    )}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 truncate">
                    {row.title}
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                    {row.city && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4 shrink-0" />
                        {row.city}
                      </span>
                    )}
                    {row.distance_km != null && (
                      <span>{row.distance_km} km away</span>
                    )}
                    <span>
                      {row.display_status === "new" && !row.unlocked ? (
                        <span className="inline-flex items-center gap-1 text-amber-800">
                          <Lock className="h-4 w-4" />
                          {row.credits_required} credits to unlock
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          Logged {new Date(row.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </span>
                  </div>
                  {row.cta_hint && (
                    <p className="mt-3 text-sm text-gray-600">{row.cta_hint}</p>
                  )}
                </div>
                <div className="flex flex-col sm:items-end gap-2">
                  <button
                    type="button"
                    onClick={() => goCta(row)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    {row.display_status === "new" && !row.unlocked && (
                      <>
                        <Lock className="h-4 w-4" />
                        Unlock
                      </>
                    )}
                    {row.display_status === "new" && row.unlocked && (
                      <>
                        <MessageCircle className="h-4 w-4" />
                        Open
                      </>
                    )}
                    {row.display_status === "active" && (
                      <>
                        <MessageCircle className="h-4 w-4" />
                        Open
                      </>
                    )}
                    {(row.display_status === "done" || row.display_status === "expired") && (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        View
                      </>
                    )}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
