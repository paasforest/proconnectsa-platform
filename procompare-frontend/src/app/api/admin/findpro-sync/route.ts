import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { mkdir, readFile, writeFile } from "fs/promises"
import path from "path"

type FindProSlugMap = Record<string, string>

const DATA_DIR = path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "findpro-slugs.json")

async function readMap(): Promise<FindProSlugMap> {
  try {
    const raw = await readFile(DATA_FILE, "utf-8")
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

async function writeMap(data: FindProSlugMap) {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8")
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || !["admin", "support"].includes(role)) {
    return false
  }
  return true
}

export async function GET() {
  const allowed = await requireAdmin()
  if (!allowed) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 })
  }
  const mappings = await readMap()
  return NextResponse.json({ mappings })
}

export async function PUT(request: NextRequest) {
  const allowed = await requireAdmin()
  if (!allowed) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const providerSlug = String(body?.providerSlug || "").trim().toLowerCase()
  const findproSlug = String(body?.findproSlug || "").trim().toLowerCase()

  if (!providerSlug) {
    return NextResponse.json({ detail: "providerSlug is required" }, { status: 400 })
  }

  const mappings = await readMap()
  if (!findproSlug) {
    delete mappings[providerSlug]
  } else {
    mappings[providerSlug] = findproSlug
  }
  await writeMap(mappings)

  return NextResponse.json({ ok: true, mappings })
}

