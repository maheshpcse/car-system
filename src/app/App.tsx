import { AuthProvider } from '@/core/auth/AuthProvider'
import { PreferencesProvider } from '@/core/preferences/PreferencesProvider'
import { EmailAlertBridge } from '@/features/notifications/EmailAlertBridge'
import { NotificationsProvider } from '@/features/notifications/NotificationsProvider'
import { ToastProvider } from '@/shared/feedback/ToastProvider'
import { ScrollRestoration } from '@/shared/scroll/ScrollRestoration'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { AppRoutes } from './routes'

export function App() {
  return (
    <ThemeProvider>
      <PreferencesProvider>
        <AuthProvider>
          <NotificationsProvider>
            <ToastProvider>
              <EmailAlertBridge />
              <ScrollRestoration />
              <AppRoutes />
            </ToastProvider>
          </NotificationsProvider>
        </AuthProvider>
      </PreferencesProvider>
    </ThemeProvider>
  )
}
