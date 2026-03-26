import { readFile } from "fs/promises"
import path from "path"

type FindProSlugMap = Record<string, string>

const FINDPRO_BASE = "https://www.findpro.co.za/business"

function normalizeKey(value: string): string {
  return value.trim().toLowerCase()
}

export function generateFindProSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

async function loadFindProSlugMap(): Promise<FindProSlugMap> {
  try {
    const filePath = path.join(process.cwd(), "data", "findpro-slugs.json")
    const raw = await readFile(filePath, "utf-8")
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

async function checkFindProSlugExists(slug: string): Promise<boolean> {
  const url = `${FINDPRO_BASE}/${slug}`
  const timeoutMs = 3000
  const withTimeout = async (method: "HEAD" | "GET") => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      return await fetch(url, {
        method,
        redirect: "manual",
        signal: controller.signal,
        next: { revalidate: 60 * 60 * 24 },
      })
    } finally {
      clearTimeout(timer)
    }
  }

  try {
    // Cached for 24 hours per URL by Next.js fetch cache.
    const headRes = await withTimeout("HEAD")
    if (headRes.status === 200) return true

    // Some hosts do not support HEAD reliably; fallback to GET.
    const getRes = await withTimeout("GET")
    return getRes.status === 200
  } catch {
    // If FindPro is slow/unreachable, fail closed and hide the link.
    return false
  }
}

export async function getFindProListingUrl(input: {
  providerSlug?: string | null
  businessName: string
}): Promise<string | null> {
  const mapping = await loadFindProSlugMap()
  const providerSlug = input.providerSlug ? normalizeKey(input.providerSlug) : ""
  const generatedFromName = generateFindProSlug(input.businessName)

  // 1) explicit mapping by provider slug
  let candidate = providerSlug ? mapping[providerSlug] : undefined

  // 2) fallback: auto-generate from business name
  if (!candidate) {
    candidate = generatedFromName
  }

  if (!candidate) return null

  // 3/4) verify URL exists and cache validity for 24h
  const exists = await checkFindProSlugExists(candidate)
  if (!exists) return null

  return `${FINDPRO_BASE}/${candidate}`
}

