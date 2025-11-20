import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import CategorySelection from './components/CategorySelection';
import NewsDashboard from './components/NewsDashboard';

export default function App() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/select-categories" element={user ? <CategorySelection /> : <Navigate to="/" />} />
            <Route path="/dashboard" element={user ? <NewsDashboard /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}
