import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminLoginForm from '@/components/admin/AdminLoginForm';

export default async function AdminPage() {
  // ALWAYS show admin login form for security
  // Admin access requires explicit authentication every time
  return <AdminLoginForm />;
}
