import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { ApiProvider } from './contexts/ApiContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Agencies from './pages/Agencies';
import Families from './pages/Families';
import Inventory from './pages/Inventory';
import PackingLists from './pages/PackingLists';
import WeeklyRequirements from './pages/WeeklyRequirements';
import Volunteers from './pages/Volunteers';
import Orders from './pages/Orders';
import Communications from './pages/Communications';
import ProtectedRoute from './components/ProtectedRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ApiProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="agencies" element={<Agencies />} />
                <Route path="families" element={<Families />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="packing-lists" element={<PackingLists />} />
                <Route path="weekly-requirements" element={<WeeklyRequirements />} />
                <Route path="volunteers" element={<Volunteers />} />
                <Route path="orders" element={<Orders />} />
                <Route path="communications" element={<Communications />} />
              </Route>
            </Routes>
          </Router>
        </ApiProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;