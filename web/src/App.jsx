import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VehicleListPage from './pages/VehicleListPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import MyRentalsPage from './pages/MyRentalsPage';
import MyContractsPage from './pages/MyContractsPage';
import MyVehiclesPage from './pages/MyVehiclesPage';
import AddVehiclePage from './pages/AddVehiclePage';
import NotificationsPage from './pages/NotificationsPage';
import DisputesPage from './pages/DisputesPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/vehicles" element={<VehicleListPage />} />
          <Route path="/vehicles/:vehicleId" element={<VehicleDetailPage />} />
          
          <Route
            path="/my-rentals"
            element={
              <PrivateRoute>
                <MyRentalsPage />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/my-contracts"
            element={
              <PrivateRoute>
                <MyContractsPage />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/my-vehicles"
            element={
              <PrivateRoute>
                <MyVehiclesPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/add-vehicle"
            element={
              <PrivateRoute>
                <AddVehiclePage />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <NotificationsPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/disputes"
            element={
              <PrivateRoute>
                <DisputesPage />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
