import { redirect } from "next/navigation";

// The middleware handles auth-based redirects for "/" → "/dashboard" or "/login".
// This fallback ensures the route always redirects even without middleware.
export const dynamic = "force-dynamic";

export default function Home() {
  redirect("/login");
}
