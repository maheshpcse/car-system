import { AuthProvider } from '@/core/auth/AuthProvider'
import { PreferencesProvider } from '@/core/preferences/PreferencesProvider'
import { ToastProvider } from '@/shared/feedback/ToastProvider'
import { ScrollRestoration } from '@/shared/scroll/ScrollRestoration'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { AppRoutes } from './routes'

export function App() {
  return (
    <ThemeProvider>
      <PreferencesProvider>
        <AuthProvider>
          <ToastProvider>
            <ScrollRestoration />
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </PreferencesProvider>
    </ThemeProvider>
  )
}
