import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { useActor } from "./hooks/useActor";
import { useSession } from "./hooks/useSession";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminPage } from "./pages/AdminPage";
import { AuthorityDashboard } from "./pages/AuthorityDashboard";
import { LoginPage } from "./pages/LoginPage";
import { TeacherDashboard } from "./pages/TeacherDashboard";

export default function App() {
  const { session, setSession, clearSession } = useSession();
  const { isFetching: actorLoading } = useActor();

  if (actorLoading) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        data-ocid="app.loading_state"
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
        <Toaster />
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <LoginPage onLogin={setSession} />
        <Toaster />
      </>
    );
  }

  const role = session.role;

  return (
    <>
      {"superAdmin" in role && (
        <AdminPage session={session} onLogout={clearSession} />
      )}
      {"teacher" in role && (
        <TeacherDashboard session={session} onLogout={clearSession} />
      )}
      {"authority" in role && (
        <AuthorityDashboard session={session} onLogout={clearSession} />
      )}
      {"adminStaff" in role && (
        <AdminDashboard session={session} onLogout={clearSession} />
      )}
      <Toaster />
    </>
  );
}
