import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Storefront from './pages/Storefront';
import ListingDetail from './pages/ListingDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import BecomeSeller from './pages/BecomeSeller';
import SellerDashboard from './pages/SellerDashboard';
import PostListing from './pages/PostListing';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/store/:slug" element={<Storefront />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/become-seller" element={<ProtectedRoute><BecomeSeller /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
        <Route path="/post-listing" element={<ProtectedRoute><PostListing /></ProtectedRoute>} />
      </Routes>
    </>
  );
}
