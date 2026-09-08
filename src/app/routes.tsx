import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from '@/core/auth/AuthProvider'
import { AppShell } from '@/layout/AppShell'
import { AuthLayout } from '@/layout/AuthLayout'
import { PageLoader } from '@/shared/feedback/PageLoader'

/* Route-level code splitting ------------------------------------------------ */
const HomePage = lazy(() => import('@/features/home/HomePage'))
const CarsPage = lazy(() => import('@/features/cars/CarsPage'))
const CarDetailsPage = lazy(() => import('@/features/cars/CarDetailsPage'))
const CategoriesPage = lazy(() => import('@/features/cars/CategoriesPage'))
const ShowroomPage = lazy(() => import('@/features/showroom/ShowroomPage'))
const ConfiguratorPage = lazy(() => import('@/features/configurator/ConfiguratorPage'))
const ConfiguratorIndexPage = lazy(() => import('@/features/configurator/ConfiguratorIndexPage'))
const SavedBuildsPage = lazy(() => import('@/features/configurator/SavedBuildsPage'))
const ComparePage = lazy(() => import('@/features/compare/ComparePage'))
const FavoritesPage = lazy(() => import('@/features/favorites/FavoritesPage'))
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'))
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'))
const LegalPage = lazy(() => import('@/features/legal/LegalPage'))
const NotFoundPage = lazy(() => import('@/features/misc/NotFoundPage'))

const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const SignupPage = lazy(() => import('@/features/auth/SignupPage'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/ForgotPasswordPage'))
const DemoLoginPage = lazy(() => import('@/features/auth/DemoLoginPage'))

/** Redirects unauthenticated users to /login and remembers where they came from. */
function RequireAuth({ children }: { children: React.ReactElement }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

/** Keeps signed-in users out of the auth flow. */
function RedirectIfAuthed({ children }: { children: React.ReactElement }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/" replace />
  return children
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader fullscreen />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="cars" element={<CarsPage />} />
          <Route path="cars/:id" element={<CarDetailsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="configurator" element={<ConfiguratorIndexPage />} />
          <Route path="configurator/:id" element={<ConfiguratorPage />} />
          <Route path="compare" element={<ComparePage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route
            path="saved-builds"
            element={
              <RequireAuth>
                <SavedBuildsPage />
              </RequireAuth>
            }
          />
          <Route
            path="profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="privacy" element={<LegalPage kind="privacy" />} />
          <Route path="terms" element={<LegalPage kind="terms" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="showroom" element={<ShowroomPage />} />

        <Route element={<AuthLayout />}>
          <Route
            path="login"
            element={
              <RedirectIfAuthed>
                <LoginPage />
              </RedirectIfAuthed>
            }
          />
          <Route
            path="signup"
            element={
              <RedirectIfAuthed>
                <SignupPage />
              </RedirectIfAuthed>
            }
          />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="demo-login" element={<DemoLoginPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
