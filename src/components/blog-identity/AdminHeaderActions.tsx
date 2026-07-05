import { logoutAction } from "@/features/auth/actions/auth-actions";

export function AdminHeaderActions() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700"
      >
        Sair
      </button>
    </form>
  );
}
