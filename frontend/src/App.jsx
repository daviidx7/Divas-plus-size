import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import Catalog from './pages/Catalog.jsx';
import ProductPage from './pages/ProductPage.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderConfirmed from './pages/OrderConfirmed.jsx';

import AdminLogin from './pages/admin/Login.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import Products from './pages/admin/Products.jsx';
import ProductForm from './pages/admin/ProductForm.jsx';
import Orders from './pages/admin/Orders.jsx';
import Categories from './pages/admin/Categories.jsx';

function LojaLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Loja */}
      <Route path="/" element={<LojaLayout><Home /></LojaLayout>} />
      <Route path="/catalogo" element={<LojaLayout><Catalog /></LojaLayout>} />
      <Route path="/produto/:id" element={<LojaLayout><ProductPage /></LojaLayout>} />
      <Route path="/carrinho" element={<LojaLayout><Cart /></LojaLayout>} />
      <Route path="/checkout" element={<LojaLayout><Checkout /></LojaLayout>} />
      <Route path="/pedido-confirmado" element={<LojaLayout><OrderConfirmed /></LojaLayout>} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="produtos" element={<Products />} />
        <Route path="produtos/novo" element={<ProductForm />} />
        <Route path="produtos/:id" element={<ProductForm />} />
        <Route path="categorias" element={<Categories />} />
        <Route path="pedidos" element={<Orders />} />
      </Route>
    </Routes>
  );
}
