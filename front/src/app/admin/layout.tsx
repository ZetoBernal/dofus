import Link from "next/link";
import { logout } from "./actions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 w-full flex flex-col">
      <div className="border-b border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
        <div className="max-w-4xl mx-auto px-6 h-11 flex items-center justify-between text-sm">
          <Link href="/admin" className="font-medium text-amber-800 dark:text-amber-400">
            Panel de admin
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="text-amber-700 hover:text-amber-900 dark:text-amber-500 dark:hover:text-amber-300 cursor-pointer"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
