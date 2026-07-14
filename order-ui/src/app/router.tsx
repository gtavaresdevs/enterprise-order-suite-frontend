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
import InventoryPage from '@/pages/Inventory';
import AnalyticsPage from '@/pages/Analytics';
import ProfilePage from '@/pages/Profile';
import NotificationsPage from '@/pages/Notifications';
import PreferencesPage from '@/pages/Preferences';
import SettingsPage from '@/pages/Settings';

// ── Standalone Pages ────────────────────────────────────────
import StorefrontPage from '@/pages/Storefront';
import KDSPage from '@/pages/Kds';

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

  // Standalone Routes (Outside Admin Shell)
  {
    path: '/storefront',
    element: <StorefrontPage />,
  },
  {
    path: '/checkout',
    element: <Navigate to="/storefront" replace />,
  },
  {
    path: '/kds',
    element: <KDSPage />,
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
            path: '/inventory',
            element: <InventoryPage />,
          },
          {
            path: '/analytics',
            element: <AnalyticsPage />,
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
      // Redirects for unbuilt or legacy-mapped paths
      {
        path: '/security',
        element: <Navigate to="/settings" replace />,
      },
    ],
  },

  // Fallbacks & Redirects
  {
    path: '/',
    element: <Navigate to="/home" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);