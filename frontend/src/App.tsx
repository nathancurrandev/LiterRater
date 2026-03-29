import { lazy, ReactNode, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import AppHeader from '@/components/AppHeader';
import CookieConsentBanner from '@/components/CookieConsentBanner';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Lazy page imports
const HomePage = lazy(() => import('@/pages/HomePage'));
const ActivityFeedPage = lazy(() => import('@/pages/ActivityFeedPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const BookSearchPage = lazy(() => import('@/pages/BookSearchPage'));
const BookDetailPage = lazy(() => import('@/pages/BookDetailPage'));
const AuthorDetailPage = lazy(() => import('@/pages/AuthorDetailPage'));
const ListDetailPage = lazy(() => import('@/pages/ListDetailPage'));
const UserProfilePage = lazy(() => import('@/pages/UserProfilePage'));
const ReadingDiaryPage = lazy(() => import('@/pages/ReadingDiaryPage'));
const AccountSettingsPage = lazy(() => import('@/pages/AccountSettingsPage'));
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Admin lazy imports
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));
const AdminBooksPage = lazy(() => import('@/pages/admin/AdminBooksPage'));
const AdminAuthorsPage = lazy(() => import('@/pages/admin/AdminAuthorsPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));

// ProtectedRoute: redirects to /login if the user is not authenticated.
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading…</div>;
  }

  if (currentUser === null) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// AdminRoute: redirects to / if the user is not an admin.
function AdminRoute({ children }: { children: ReactNode }) {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading…</div>;
  }

  if (currentUser === null || currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Layout wrapper for non-admin pages (shows AppHeader).
function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <div className="flex-1">{children}</div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <Routes>
        {/* Public routes with AppHeader */}
        <Route
          path="/"
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          }
        />
        <Route
          path="/feed"
          element={
            <MainLayout>
              <ProtectedRoute>
                <ActivityFeedPage />
              </ProtectedRoute>
            </MainLayout>
          }
        />
        <Route
          path="/login"
          element={
            <MainLayout>
              <LoginPage />
            </MainLayout>
          }
        />
        <Route
          path="/register"
          element={
            <MainLayout>
              <RegisterPage />
            </MainLayout>
          }
        />
        <Route
          path="/books"
          element={
            <MainLayout>
              <BookSearchPage />
            </MainLayout>
          }
        />
        <Route
          path="/books/:id"
          element={
            <MainLayout>
              <BookDetailPage />
            </MainLayout>
          }
        />
        <Route
          path="/authors/:id"
          element={
            <MainLayout>
              <AuthorDetailPage />
            </MainLayout>
          }
        />
        <Route
          path="/lists/:id"
          element={
            <MainLayout>
              <ListDetailPage />
            </MainLayout>
          }
        />
        <Route
          path="/users/:id"
          element={
            <MainLayout>
              <UserProfilePage />
            </MainLayout>
          }
        />
        <Route
          path="/diary"
          element={
            <MainLayout>
              <ProtectedRoute>
                <ReadingDiaryPage />
              </ProtectedRoute>
            </MainLayout>
          }
        />
        <Route
          path="/account"
          element={
            <MainLayout>
              <ProtectedRoute>
                <AccountSettingsPage />
              </ProtectedRoute>
            </MainLayout>
          }
        />
        <Route
          path="/privacy"
          element={
            <MainLayout>
              <PrivacyPolicyPage />
            </MainLayout>
          }
        />

        {/* Admin routes — no AppHeader, protected by AdminRoute */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="books" element={<AdminBooksPage />} />
          <Route path="authors" element={<AdminAuthorsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>

        {/* 404 catch-all */}
        <Route
          path="*"
          element={
            <MainLayout>
              <NotFoundPage />
            </MainLayout>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <AppRoutes />
          <CookieConsentBanner />
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
