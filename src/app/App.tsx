import { AuthProvider } from '@/core/auth/AuthProvider'
import { PreferencesProvider } from '@/core/preferences/PreferencesProvider'
import { CustomCursor } from '@/shared/cursor/CustomCursor'
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
            <CustomCursor />
          </ToastProvider>
        </AuthProvider>
      </PreferencesProvider>
    </ThemeProvider>
  )
}
