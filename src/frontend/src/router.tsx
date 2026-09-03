import { createRootRoute, createRoute, createRouter, createHashHistory, Outlet, Link } from "@tanstack/react-router";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { HomePage } from "./pages/HomePage";
import { AnalysisPage } from "./pages/AnalysisPage";
import { ResultPage } from "./pages/ResultPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ExpertLoginPage } from "./pages/ExpertLoginPage";
import { ExpertRegisterPage } from "./pages/ExpertRegisterPage";
import { ExpertDashboardPage } from "./pages/ExpertDashboardPage";
import { ExpertReviewPage } from "./pages/ExpertReviewPage";
import { ExpertVerifiedDataPage } from "./pages/ExpertVerifiedDataPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { ShieldAlert, Lock } from "lucide-react";
import { Button } from "./components/ui/button";

function RequireRoleGuard({ allowedRoles, children }: { allowedRoles: string[]; children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-xs text-muted-foreground font-semibold">Verifying RBAC Permissions...</p>
        </div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full bg-card border border-destructive/40 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-fadeUp">
          <div className="h-16 w-16 bg-destructive/15 rounded-full flex items-center justify-center mx-auto text-destructive">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-2xl text-foreground">403 Access Forbidden</h2>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Your account ({user ? user.role : "Unauthenticated"}) does not have permission to view this resource. Requires role: <strong>{allowedRoles.join(" or ")}</strong>.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Link to="/login">
              <Button size="sm" variant="outline" className="text-xs">User Login</Button>
            </Link>
            <Link to="/expert/login">
              <Button size="sm" variant="outline" className="text-xs border-accent text-accent">Expert Login</Button>
            </Link>
            <Link to="/">
              <Button size="sm" className="text-xs">Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

import { Toaster } from "./components/ui/sonner";

const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <Outlet />
      <Toaster position="top-right" />
    </AuthProvider>
  ),
});

const publicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const analysisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analysis",
  component: AnalysisPage,
});

const resultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/result/$testId",
  component: ResultPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

const expertLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/expert/login",
  component: ExpertLoginPage,
});

const expertRegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/expert/register",
  component: ExpertRegisterPage,
});

const expertDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/expert/dashboard",
  component: () => (
    <RequireRoleGuard allowedRoles={["EXPERT", "ADMIN"]}>
      <ExpertDashboardPage />
    </RequireRoleGuard>
  ),
});

const expertReviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/expert/review/$testId",
  component: () => (
    <RequireRoleGuard allowedRoles={["EXPERT", "ADMIN"]}>
      <ExpertReviewPage />
    </RequireRoleGuard>
  ),
});

const expertVerifiedDataRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/expert/verified-data",
  component: () => (
    <RequireRoleGuard allowedRoles={["EXPERT", "ADMIN"]}>
      <ExpertVerifiedDataPage />
    </RequireRoleGuard>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => (
    <RequireRoleGuard allowedRoles={["ADMIN"]}>
      <AdminDashboardPage />
    </RequireRoleGuard>
  ),
});

const routeTree = rootRoute.addChildren([
  publicRoute,
  analysisRoute,
  resultRoute,
  loginRoute,
  registerRoute,
  expertLoginRoute,
  expertRegisterRoute,
  expertDashboardRoute,
  expertReviewRoute,
  expertVerifiedDataRoute,
  adminRoute,
]);

export const router = createRouter({
  routeTree,
  history: createHashHistory(),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
