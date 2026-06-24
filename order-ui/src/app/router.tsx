import { createBrowserRouter, Navigate } from 'react-router-dom';

// ── Layout Interfaces ───────────────────────────────────────
import { AppLayout } from '@/layouts/app-layout';
import { ProtectedLayout } from '@/layouts/protected-layout';

// ── Public Pages ────────────────────────────────────────────
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import ForgotPasswordPage from '@/pages/ForgotPassword';
import ResetPasswordPage from '@/pages/ResetPassword';

// ── Protected Pages ─────────────────────────────────────────
import HomePage from '@/pages/Home';
import OrdersPage from '@/pages/Orders';
import ProfilePage from '@/pages/Profile';
import NotificationsPage from '@/pages/Notifications';
import PreferencesPage from '@/pages/Preferences';
import SettingsPage from '@/pages/Settings';

export const router = createBrowserRouter([
  // Public Auth Routes
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },

  // Protected Application Routes
  {
    element: <ProtectedLayout />, // First Boundary: Authentication check
    children: [
      {
        element: <AppLayout />,   // Second Boundary: Application Shell (Sidebar + Header)
        children: [
          {
            path: '/home',
            element: <HomePage />,
          },
          {
            path: '/orders',
            element: <OrdersPage />,
          },
          {
            path: '/profile',
            element: <ProfilePage />,
          },
          {
            path: '/notifications',
            element: <NotificationsPage />,
          },
          {
            path: '/preferences',
            element: <PreferencesPage />,
          },
          {
            path: '/settings',
            element: <SettingsPage />,
          },
        ],
      },
      // Unbuilt nav stubs — redirect home
      {
        path: '/inventory',
        element: <Navigate to="/home" replace />,
      },
      {
        path: '/analytics',
        element: <Navigate to="/home" replace />,
      },
      {
        path: '/security',
        element: <Navigate to="/settings" replace />,
      },
    ],
  },

  // Fallbacks & Redirects
  {
    path: '/',
    // Redirecting to home enables ProtectedLayout to decide if they should see 
    // the dashboard or be bounced to login, rather than blindly forcing login.
    element: <Navigate to="/home" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);