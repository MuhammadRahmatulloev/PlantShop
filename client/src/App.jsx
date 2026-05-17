import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import CartPage from './pages/CartPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import PlantDetailPage from './pages/PlantDetailPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'
import CreatePlantPage from './pages/CreatePlantPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage  from './pages/ResetPasswordPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />
        <Route path="/plants/:slug" element={<PlantDetailPage />} />

        {/* Только для авторизованных */}
        <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

        <Route path="*" element={<NotFoundPage />} />
        <Route path="/plants/create" element={<PrivateRoute><CreatePlantPage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App