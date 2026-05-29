import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { RequireAuth, RequireRole } from './components/routing/RouteGuards';
import { AdminLayout, OwnerLayout, PublicLayout, UserLayout } from './components/layout';

import LandingPage from './pages/public/LandingPage';
import CarsPage from './pages/public/CarsPage';
import CarDetailPage from './pages/public/CarDetailPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import NotFoundPage from './pages/public/NotFoundPage';

import ExplorePage from './pages/renter/ExplorePage';
import RentalRequestsPage from './pages/renter/RentalRequestsPage';
import ContractsPage from './pages/renter/ContractsPage';
import PaymentsPage from './pages/renter/PaymentsPage';
import InspectionsPage from './pages/renter/InspectionsPage';
import ReviewsPage from './pages/renter/ReviewsPage';
import NotificationsPage from './pages/renter/NotificationsPage';

import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import OwnerVehiclesPage from './pages/owner/OwnerVehiclesPage';
import OwnerVehicleFormPage from './pages/owner/OwnerVehicleFormPage';
import OwnerRentalRequestsPage from './pages/owner/OwnerRentalRequestsPage';
import OwnerContractsPage from './pages/owner/OwnerContractsPage';
import OwnerTrackingPage from './pages/owner/OwnerTrackingPage';
import OwnerDisputesPage from './pages/owner/OwnerDisputesPage';
import OwnerRevenuePage from './pages/owner/OwnerRevenuePage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminVehiclesPage from './pages/admin/AdminVehiclesPage';
import AdminRentalsPage from './pages/admin/AdminRentalsPage';
import AdminContractsPage from './pages/admin/AdminContractsPage';
import AdminDisputesPage from './pages/admin/AdminDisputesPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminStatisticsPage from './pages/admin/AdminStatisticsPage';
import AdminSystemLogsPage from './pages/admin/AdminSystemLogsPage';
import { ROLES } from './constants/roles';

function LegacyVehicleRedirect() {
  const { vehicleId } = useParams();
  return <Navigate to={`/cars/${vehicleId}`} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/cars" element={<CarsPage />} />
              <Route path="/cars/:id" element={<CarDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route
              path="/app"
              element={
                <RequireAuth>
                  <UserLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="explore" replace />} />
              <Route path="explore" element={<ExplorePage />} />
              <Route path="cars/:id" element={<CarDetailPage backTo="/app/explore" navigateAfterRequest="/app/rental-requests" />} />
              <Route path="rental-requests" element={<RentalRequestsPage />} />
              <Route path="contracts" element={<ContractsPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="inspections" element={<InspectionsPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            <Route
              path="/owner"
              element={
                <RequireAuth>
                  <OwnerLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<OwnerDashboardPage />} />
              <Route path="vehicles" element={<OwnerVehiclesPage />} />
              <Route path="vehicles/new" element={<OwnerVehicleFormPage />} />
              <Route path="vehicles/:id/edit" element={<OwnerVehicleFormPage />} />
              <Route path="rental-requests" element={<OwnerRentalRequestsPage />} />
              <Route path="contracts" element={<OwnerContractsPage />} />
              <Route path="tracking" element={<OwnerTrackingPage />} />
              <Route path="disputes" element={<OwnerDisputesPage />} />
              <Route path="revenue" element={<OwnerRevenuePage />} />
            </Route>

            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <RequireRole roles={[ROLES.ADMIN]}>
                    <AdminLayout />
                  </RequireRole>
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="vehicles" element={<AdminVehiclesPage />} />
              <Route path="rentals" element={<AdminRentalsPage />} />
              <Route path="contracts" element={<AdminContractsPage />} />
              <Route path="disputes" element={<AdminDisputesPage />} />
              <Route path="payments" element={<AdminPaymentsPage />} />
              <Route path="statistics" element={<AdminStatisticsPage />} />
              <Route path="system-logs" element={<AdminSystemLogsPage />} />
            </Route>

            {/* Legacy routes for backward compatibility */}
            <Route path="/vehicles" element={<Navigate to="/cars" replace />} />
            <Route path="/vehicles/:vehicleId" element={<LegacyVehicleRedirect />} />
            <Route path="/my-rentals" element={<Navigate to="/app/rental-requests" replace />} />
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
