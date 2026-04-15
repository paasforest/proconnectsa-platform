"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Loader2, X, Phone, Mail, Wallet as WalletIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-simple";
import { useAuth } from "@/components/AuthProvider";

export interface CustomerDetails {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  job_details: string;
  credits_charged: number;
  wallet_balance_remaining: number;
}

type ModalPhase = "confirm" | "details" | "insufficient" | "expired";

interface UnlockLeadModalProps {
  assignmentId: string;
  creditsRequired: number;
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: (details: CustomerDetails) => void;
}

export default function UnlockLeadModal({
  assignmentId,
  creditsRequired,
  isOpen,
  onClose,
  onUnlocked,
}: UnlockLeadModalProps) {
  const { token } = useAuth();
  const router = useRouter();
  const [phase, setPhase] = useState<ModalPhase>("confirm");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [details, setDetails] = useState<CustomerDetails | null>(null);
  const [shortageRequired, setShortageRequired] = useState<number | null>(null);

  const loadBalance = useCallback(async () => {
    if (!token) return;
    try {
      apiClient.setToken(token);
      const res = (await apiClient.getCreditBalance()) as {
        credits?: number;
      };
      setBalance(typeof res.credits === "number" ? res.credits : 0);
    } catch {
      setBalance(null);
    }
  }, [token]);

  useEffect(() => {
    if (!isOpen) return;
    setPhase("confirm");
    setDetails(null);
    setShortageRequired(null);
    setLoading(false);
    loadBalance();
  }, [isOpen, assignmentId, loadBalance]);

  const handleConfirm = async () => {
    if (!token) return;
    setLoading(true);
    try {
      apiClient.setToken(token);
      const res = (await apiClient.post(
        `/api/leads/${assignmentId}/unlock/`,
        {}
      )) as CustomerDetails & { unlocked?: boolean };

      const d: CustomerDetails = {
        customer_name: res.customer_name ?? "",
        customer_phone: res.customer_phone ?? "",
        customer_email: res.customer_email ?? "",
        job_details: res.job_details ?? "",
        credits_charged: res.credits_charged ?? 0,
        wallet_balance_remaining: res.wallet_balance_remaining ?? 0,
      };
      setDetails(d);
      setPhase("details");
      onUnlocked(d);
    } catch (e: unknown) {
      const err = e as {
        response?: {
          status?: number;
          data?: { error?: string; required?: number; balance?: number };
        };
      };
      const httpStatus = err.response?.status;
      const data = err.response?.data;
      const code = data?.error;

      if (httpStatus === 402 || code === "insufficient_credits") {
        const req = data?.required ?? creditsRequired;
        const bal = data?.balance ?? balance ?? 0;
        setShortageRequired(Math.max(0, req - bal));
        setPhase("insufficient");
      } else if (httpStatus === 410 || code === "lead_expired") {
        setPhase("expired");
      } else {
        setPhase("confirm");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {phase === "details" ? "Customer details" : "Unlock lead"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-5">
          {phase === "confirm" && (
            <>
              <p className="text-gray-700 text-base">
                Unlock this lead for{" "}
                <span className="font-semibold text-gray-900">
                  {creditsRequired} credits
                </span>
                ?
              </p>
              <p className="mt-3 text-sm text-gray-600">
                Your balance:{" "}
                <span className="font-medium text-gray-900">
                  {balance !== null ? `${balance} credits` : "—"}
                </span>
              </p>
              <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Confirm unlock"
                  )}
                </button>
              </div>
            </>
          )}

          {phase === "details" && details && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Credits charged: {details.credits_charged} · Balance:{" "}
                {details.wallet_balance_remaining}
              </p>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Name
                </p>
                <p className="text-gray-900 font-medium">{details.customer_name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Phone
                </p>
                <a
                  href={
                    details.customer_phone
                      ? `tel:${details.customer_phone.replace(/\s/g, "")}`
                      : undefined
                  }
                  className="inline-flex items-center gap-2 text-blue-600 font-medium"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  {details.customer_phone || "—"}
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Email
                </p>
                <a
                  href={
                    details.customer_email
                      ? `mailto:${details.customer_email}`
                      : undefined
                  }
                  className="inline-flex items-center gap-2 text-blue-600 font-medium break-all"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  {details.customer_email || "—"}
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Job details
                </p>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {details.job_details || "—"}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full mt-4 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          )}

          {phase === "insufficient" && (
            <>
              <div className="flex items-start gap-3">
                <WalletIcon className="h-8 w-8 text-amber-600 shrink-0" />
                <p className="text-gray-700">
                  You need{" "}
                  <span className="font-semibold">
                    {shortageRequired !== null && shortageRequired > 0
                      ? `${shortageRequired} more`
                      : "more"}
                  </span>{" "}
                  credits to unlock this lead.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push("/dashboard/wallet");
                }}
                className="w-full mt-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                Top up wallet
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full mt-2 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium"
              >
                Cancel
              </button>
            </>
          )}

          {phase === "expired" && (
            <>
              <p className="text-gray-700">
                This lead has expired and is no longer available.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push("/dashboard/leads");
                }}
                className="w-full mt-6 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800"
              >
                Back to leads
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
