// src/router/routes/index.tsx
import type { RouteObject } from 'react-router-dom';
import { MainLayout } from '../../core/layouts/MainLayout';
import DashboardPage from '../../core/pages/DashboardPage';
import LoginPage from '../../core/auth/pages/LoginPage';
import { comptabiliteRoutes } from '../../modules/comptabilite/routes';
import { importExportRoutes } from '../../modules/import-export/routes';
import CRMRoutes from '../../modules/crm/routes';
import { ProtectedRoute } from '../../core/auth/components/ProtectedRoute';
;

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
     
      {
        path: 'admin/users',
        element: (
          <ProtectedRoute requiredRole="admin">
            <div>
              <h1>Gestion des Utilisateurs</h1>
              <p>Interface à implémenter</p>
              <p>Accès réservé aux administrateurs</p>
            </div>
          </ProtectedRoute>
        ),
      },
     
      ...comptabiliteRoutes.map(route => ({
        ...route,
        element: (
          <ProtectedRoute requiredRole="comptable">
            {route.element}
          </ProtectedRoute>
        )
      })),
     
      ...importExportRoutes.map(route => ({
        ...route,
        element: (
          <ProtectedRoute requiredRole="commercial">
            {route.element}
          </ProtectedRoute>
        )
      })),
     
      {
        path: 'crm/*',
        element: (
          <ProtectedRoute requiredRole="commercial">
            <CRMRoutes />
          </ProtectedRoute>
        ), 
      },
    ],
  },
];