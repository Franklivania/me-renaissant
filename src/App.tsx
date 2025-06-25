import AppRouter from "./router/router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useProfileStore } from "@/store/useProfileStore"
import { useEffect } from "react"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 3
    }
  }
})

function App() {
  const { loadProfile, isOnboardingComplete } = useProfileStore();

  useEffect(() => {
    // Load existing profile on app start if onboarding is complete
    if (isOnboardingComplete) {
      loadProfile();
    }
  }, [isOnboardingComplete, loadProfile]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  )
}

export default App