import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CheckIn from './pages/CheckIn';
import ActiveVehicles from './pages/ActiveVehicles';
import Checkout from './pages/Checkout';
import History from './pages/History';
import Revenue from './pages/Revenue';
import RatePlans from './pages/RatePlans';
import Slots from './pages/Slots';
import Settings from './pages/Settings';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/check-in" element={<CheckIn />} />
                <Route path="/active" element={<ActiveVehicles />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/history" element={<History />} />
                <Route path="/revenue" element={<Revenue />} />
                <Route path="/rate-plans" element={<RatePlans />} />
                <Route path="/slots" element={<Slots />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
