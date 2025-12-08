import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import ErrorBoundary from "@/components/ErrorBoundary"
import AuthProvider from "@/components/AuthProvider"

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Pages />
        <Toaster />
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App 