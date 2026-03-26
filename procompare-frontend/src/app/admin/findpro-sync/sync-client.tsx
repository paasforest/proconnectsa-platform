"use client"

import { useEffect, useMemo, useState } from "react"

type Mapping = Record<string, string>

export default function FindProSyncClientPage() {
  const [mappings, setMappings] = useState<Mapping>({})
  const [providerSlug, setProviderSlug] = useState("")
  const [findproSlug, setFindproSlug] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const rows = useMemo(
    () =>
      Object.entries(mappings)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([provider, findpro]) => ({ provider, findpro })),
    [mappings],
  )

  async function loadMappings() {
    setLoading(true)
    setMessage("")
    const res = await fetch("/api/admin/findpro-sync")
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setMessage(data?.detail || "Failed to load mappings")
      setLoading(false)
      return
    }
    setMappings(data.mappings || {})
    setLoading(false)
  }

  useEffect(() => {
    loadMappings()
  }, [])

  async function saveMapping() {
    if (!providerSlug.trim()) return
    setSaving(true)
    setMessage("")
    const res = await fetch("/api/admin/findpro-sync", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        providerSlug: providerSlug.trim().toLowerCase(),
        findproSlug: findproSlug.trim().toLowerCase(),
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setMessage(data?.detail || "Failed to save mapping")
      setSaving(false)
      return
    }
    setMappings(data.mappings || {})
    setProviderSlug("")
    setFindproSlug("")
    setMessage("Mapping saved")
    setSaving(false)
  }

  async function removeMapping(provider: string) {
    setSaving(true)
    setMessage("")
    const res = await fetch("/api/admin/findpro-sync", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        providerSlug: provider,
        findproSlug: "",
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setMessage(data?.detail || "Failed to remove mapping")
      setSaving(false)
      return
    }
    setMappings(data.mappings || {})
    setMessage("Mapping removed")
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">FindPro Sync</h1>
        <p className="text-sm text-gray-600 mb-6">
          Map ProConnectSA provider slugs to FindPro business slugs for cross-profile linking.
        </p>

        <div className="bg-white border rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Add / Edit Mapping</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              value={providerSlug}
              onChange={(e) => setProviderSlug(e.target.value)}
              placeholder="provider-slug"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              value={findproSlug}
              onChange={(e) => setFindproSlug(e.target.value)}
              placeholder="findpro-slug"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={saveMapping}
              disabled={saving || !providerSlug.trim()}
              className="rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm px-4 py-2"
            >
              {saving ? "Saving..." : "Save Mapping"}
            </button>
            <button
              type="button"
              onClick={loadMappings}
              disabled={loading}
              className="rounded-md border border-gray-300 hover:bg-gray-50 text-sm px-4 py-2"
            >
              Refresh
            </button>
            {message && <span className="text-sm text-gray-600">{message}</span>}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold text-gray-900 mb-4">Current Mappings</h2>
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-gray-500">No mappings yet.</p>
          ) : (
            <div className="space-y-2">
              {rows.map((row) => (
                <div key={row.provider} className="flex items-center justify-between gap-3 border rounded-md px-3 py-2">
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">{row.provider}</span>
                    <span className="text-gray-500 mx-2">→</span>
                    <span className="text-gray-700">{row.findpro}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMapping(row.provider)}
                    disabled={saving}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
