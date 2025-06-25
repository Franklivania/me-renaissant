import ChatLayout from "@/layout/chat-layout";
import OnboardingLayout from "@/layout/onboarding-layout";
import GamesPage from "@/pages/chat/games/page";
import ChatPage from "@/pages/chat/page";
import LandingPage from "@/pages/landing-page";
import OnboardingPage from "@/pages/onboarding/page";
import RevealPage from "@/pages/reveal-page";
import { Suspense } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";


const routes = createBrowserRouter([
  {
    path: "",
    element: <LandingPage />
  },
  {
    path: "onboarding",
    element: (
      <Suspense>
        <OnboardingLayout>
          <OnboardingPage />
        </OnboardingLayout>
      </Suspense>
    )
  },
  {
    path: "reveal",
    element: (
      <Suspense>
        <RevealPage />
      </Suspense>
    )
  },
  {
    path: "chat",
    element: (
      <Suspense>
        <ChatLayout>
          <Outlet />
        </ChatLayout>
      </Suspense>
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