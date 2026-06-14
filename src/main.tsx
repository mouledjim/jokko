import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient } from '@/lib/queryClient'
import { queryPersister } from '@/lib/persister'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { AuthProvider } from '@/providers/AuthProvider'
import { ToastProvider } from '@/providers/ToastProvider'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { AppRouter } from '@/routes/AppRouter'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: queryPersister,
          maxAge: 24 * 60 * 60 * 1000,
          buster: 'v1',
          dehydrateOptions: {
            shouldDehydrateQuery: (q) => q.state.status === 'success',
          },
        }}
      >
        <ThemeProvider>
          <BrowserRouter>
            <AuthProvider>
              <ToastProvider>
                <AppRouter />
              </ToastProvider>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </PersistQueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
