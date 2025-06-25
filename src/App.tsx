import AppRouter from "./router/router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useProfileStore } from "@/store/useProfileStore"
import { useChatStore } from "@/store/useChatStore"
import { useEffect } from "react"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 3,
      refetchOnWindowFocus: false
    }
  }
})

function App() {
  const { initializeProfile, isOnboardingComplete } = useProfileStore();
  const { initializeChat } = useChatStore();

  useEffect(() => {
    // Initialize profile and chat systems
    const initialize = async () => {
      await initializeProfile();
      
      if (isOnboardingComplete) {
        await initializeChat();
      }
    };

    initialize();
  }, [initializeProfile, initializeChat, isOnboardingComplete]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  )
}

export default App