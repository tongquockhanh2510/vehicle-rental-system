import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AdminProtectedRoute, OwnerProtectedRoute, ProtectedRoute, RequireRole } from './components/routing/RouteGuards';
import { AdminLayout, OwnerLayout, PublicLayout, RenterMinimalLayout, UserLayout } from './components/layout';

import LandingPage from './pages/public/LandingPage';
import CarsPage from './pages/public/CarsPage';
import CarDetailPage from './pages/public/CarDetailPage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import BecomeOwnerIntroPage from './pages/public/BecomeOwnerIntroPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import NotFoundPage from './pages/public/NotFoundPage';
import AIAssistantPage from './pages/public/AIAssistantPage';

import ExplorePage from './pages/renter/ExplorePage';
import RentalRequestsPage from './pages/renter/RentalRequestsPage';
import ContractsPage from './pages/renter/ContractsPage';
import PaymentsPage from './pages/renter/PaymentsPage';
import InspectionsPage from './pages/renter/InspectionsPage';
import ReviewsPage from './pages/renter/ReviewsPage';
import NotificationsPage from './pages/renter/NotificationsPage';
import ProfilePage from './pages/renter/ProfilePage';
import BecomeOwnerPage from './pages/renter/BecomeOwnerPage';
import OwnerApplicationStatusPage from './pages/renter/OwnerApplicationStatusPage';

import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import OwnerVehiclesPage from './pages/owner/OwnerVehiclesPage';
import OwnerVehicleFormPage from './pages/owner/OwnerVehicleFormPage';
import OwnerRentalRequestsPage from './pages/owner/OwnerRentalRequestsPage';
import OwnerContractsPage from './pages/owner/OwnerContractsPage';
import OwnerTrackingPage from './pages/owner/OwnerTrackingPage';
import OwnerDisputesPage from './pages/owner/OwnerDisputesPage';
import OwnerPaymentsPage from './pages/owner/OwnerPaymentsPage';
import OwnerRevenuePage from './pages/owner/OwnerRevenuePage';
import OwnerProfilePage from './pages/owner/OwnerProfilePage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminOwnerApplicationsPage from './pages/admin/AdminOwnerApplicationsPage';
import AdminVehiclesPage from './pages/admin/AdminVehiclesPage';
import AdminRentalsPage from './pages/admin/AdminRentalsPage';
import AdminContractsPage from './pages/admin/AdminContractsPage';
import AdminDisputesPage from './pages/admin/AdminDisputesPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminStatisticsPage from './pages/admin/AdminStatisticsPage';
import AdminSystemHealthPage from './pages/admin/AdminSystemHealthPage';
import AdminSystemLogsPage from './pages/admin/AdminSystemLogsPage';
import AdminArchitecturePage from './pages/admin/AdminArchitecturePage';
import AdminAIAgentPage from './pages/admin/AdminAIAgentPage';
import { ROLES } from './constants/roles';

function LegacyVehicleRedirect() {
  const { vehicleId } = useParams();
  return <Navigate to={`/vehicles/${vehicleId}`} replace />;
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/explore" element={<CarsPage />} />
              <Route path="/vehicles" element={<CarsPage />} />
              <Route path="/vehicles/:id" element={<CarDetailPage backTo="/vehicles" />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/become-owner" element={<BecomeOwnerIntroPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/ai-assistant" element={<AIAssistantPage />} />
            </Route>

            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <RequireRole roles={[ROLES.USER]}>
                    <UserLayout />
                  </RequireRole>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="explore" replace />} />
              <Route path="overview" element={<Navigate to="/app/explore" replace />} />
              <Route path="explore" element={<ExplorePage />} />
              <Route path="vehicles/:id" element={<CarDetailPage backTo="/app/explore" navigateAfterRequest="/app/requests" />} />
              <Route path="requests" element={<RentalRequestsPage />} />
              <Route path="contracts" element={<ContractsPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="inspections" element={<InspectionsPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />

              <Route path="cars/:id" element={<Navigate to="/app/explore" replace />} />
              <Route path="rental-requests" element={<Navigate to="/app/requests" replace />} />
            </Route>

            <Route
              path="/app/become-owner"
              element={
                <ProtectedRoute>
                  <RequireRole roles={[ROLES.USER]}>
                    <RenterMinimalLayout />
                  </RequireRole>
                </ProtectedRoute>
              }
            >
              <Route index element={<BecomeOwnerPage />} />
            </Route>

            <Route
              path="/app/owner-application-status"
              element={
                <ProtectedRoute>
                  <RequireRole roles={[ROLES.USER]}>
                    <RenterMinimalLayout />
                  </RequireRole>
                </ProtectedRoute>
              }
            >
              <Route index element={<OwnerApplicationStatusPage />} />
            </Route>

            <Route
              path="/owner"
              element={
                <ProtectedRoute>
                  <RequireRole roles={[ROLES.USER]}>
                    <OwnerProtectedRoute>
                      <OwnerLayout />
                    </OwnerProtectedRoute>
                  </RequireRole>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<OwnerDashboardPage />} />
              <Route path="vehicles" element={<OwnerVehiclesPage />} />
              <Route path="vehicles/new" element={<OwnerVehicleFormPage />} />
              <Route path="vehicles/:id/edit" element={<OwnerVehicleFormPage />} />
              <Route path="requests" element={<OwnerRentalRequestsPage />} />
              <Route path="contracts" element={<OwnerContractsPage />} />
              <Route path="payments" element={<OwnerPaymentsPage />} />
              <Route path="tracking" element={<OwnerTrackingPage />} />
              <Route path="disputes" element={<OwnerDisputesPage />} />
              <Route path="revenue" element={<OwnerRevenuePage />} />
              <Route path="profile" element={<OwnerProfilePage />} />

              <Route path="rental-requests" element={<Navigate to="/owner/requests" replace />} />
            </Route>

            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="owner-applications" element={<AdminOwnerApplicationsPage />} />
              <Route path="vehicles" element={<AdminVehiclesPage />} />
              <Route path="rentals" element={<AdminRentalsPage />} />
              <Route path="contracts" element={<AdminContractsPage />} />
              <Route path="disputes" element={<AdminDisputesPage />} />
              <Route path="payments" element={<AdminPaymentsPage />} />
              <Route path="statistics" element={<AdminStatisticsPage />} />
              <Route path="system-health" element={<AdminSystemHealthPage />} />
              <Route path="system-logs" element={<AdminSystemLogsPage />} />
              <Route path="architecture" element={<AdminArchitecturePage />} />
              <Route path="ai-agent" element={<AdminAIAgentPage />} />
            </Route>

            <Route path="/cars" element={<Navigate to="/vehicles" replace />} />
            <Route path="/cars/:vehicleId" element={<LegacyVehicleRedirect />} />
            <Route path="/my-rentals" element={<Navigate to="/app/requests" replace />} />
            <Route path="/my-contracts" element={<Navigate to="/app/contracts" replace />} />
            <Route path="/my-vehicles" element={<Navigate to="/owner/vehicles" replace />} />
            <Route path="/add-vehicle" element={<Navigate to="/owner/vehicles/new" replace />} />
            <Route path="/notifications" element={<Navigate to="/app/notifications" replace />} />
            <Route path="/disputes" element={<Navigate to="/owner/disputes" replace />} />
            <Route path="/statistics" element={<Navigate to="/admin/statistics" replace />} />

            <Route element={<PublicLayout />}>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
