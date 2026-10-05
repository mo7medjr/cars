import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Public pages
import Home from './pages/public/Home';
import Fleet from './pages/public/Fleet';
import BookCar from './pages/public/BookCar';
import BookingSuccess from './pages/public/BookingSuccess';
import TrackBooking from './pages/public/TrackBooking';
import About from './pages/public/About';
import Sales from './pages/public/Sales';
import SellYourCar from './pages/public/SellYourCar';
import Showroom from './pages/public/Showroom';
import NotFound from './pages/NotFound';

// Admin pages
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import AdminCars from './pages/admin/Cars';
import AdminCustomers from './pages/admin/Customers';
import AdminReservations from './pages/admin/Reservations';
import AdminContracts from './pages/admin/Contracts';
import StaffManagement from './pages/admin/StaffManagement';
import CalendarView from './pages/admin/Calendar';
import BackupPage from './pages/admin/Backup';
import SettingsPage from './pages/admin/Settings';
import SalesManager from './pages/admin/SalesManager';
import ConsignmentManager from './pages/admin/ConsignmentManager';

// Layout
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

import './index.css';

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <Router>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: "'Cairo', sans-serif",
              direction: 'rtl',
              borderRadius: '12px',
              padding: '14px 20px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/fleet" element={<Fleet />} />
            <Route path="/book/:carId" element={<BookCar />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route path="/track" element={<TrackBooking />} />
            <Route path="/about" element={<About />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/sell-your-car" element={<SellYourCar />} />
          </Route>

          {/* Standalone public routes (no layout) */}
          <Route path="/showroom" element={<Showroom />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/cars" element={<AdminCars />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/reservations" element={<AdminReservations />} />
            <Route path="/admin/contracts" element={<AdminContracts />} />
            <Route path="/admin/calendar" element={<CalendarView />} />
            <Route path="/admin/staff" element={<StaffManagement />} />
            <Route path="/admin/backup" element={<BackupPage />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
            <Route path="/admin/sales" element={<SalesManager />} />
            <Route path="/admin/consignment" element={<ConsignmentManager />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
