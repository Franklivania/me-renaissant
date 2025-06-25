import ChatLayout from "@/layout/chat-layout";
import OnboardingLayout from "@/layout/onboarding-layout";
import GamesPage from "@/pages/chat/games/page";
import ChatPage from "@/pages/chat/page";
import LandingPage from "@/pages/landing-page";
import OnboardingPage from "@/pages/onboarding/page";
import RevealPage from "@/pages/reveal-page";
import { Suspense } from "react";
import { createBrowserRouter, Outlet, RouterProvider, Navigate } from "react-router-dom";
import { useProfileStore } from "@/store/useProfileStore";

// Protected route component that checks onboarding status
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isOnboardingComplete } = useProfileStore();
  
  if (!isOnboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
}

// Route that redirects to chat if already onboarded
function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { isOnboardingComplete } = useProfileStore();
  
  if (isOnboardingComplete) {
    return <Navigate to="/chat" replace />;
  }
  
  return <>{children}</>;
}

const routes = createBrowserRouter([
  {
    path: "",
    element: <LandingPage />
  },
  {
    path: "onboarding",
    element: (
      <OnboardingRoute>
        <Suspense>
          <OnboardingLayout>
            <OnboardingPage />
          </OnboardingLayout>
        </Suspense>
      </OnboardingRoute>
    )
  },
  {
    path: "reveal",
    element: (
      <ProtectedRoute>
        <Suspense>
          <RevealPage />
        </Suspense>
      </ProtectedRoute>
    )
  },
  {
    path: "chat",
    element: (
      <ProtectedRoute>
        <Suspense>
          <ChatLayout>
            <Outlet />
          </ChatLayout>
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <ChatPage />
      },
      {
        path: "games",
        element: <GamesPage />
      }
    ]
  }
])

export default function AppRouter() {
  return (
    <RouterProvider router={routes} />
  )
}