import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import FindProSyncClientPage from "./sync-client"

export default async function FindProSyncPage() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role

  if (!session || !["admin", "support"].includes(role)) {
    redirect("/admin")
  }

  return <FindProSyncClientPage />
}

