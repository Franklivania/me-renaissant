import AppRouter from "./router/router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 3
    }
  }
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  )
}

export default App
