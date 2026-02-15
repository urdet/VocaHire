import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'; // Router here
import './index.css'
import AppRoutes from './routes/routes.jsx'
import { AuthProvider } from './routes/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
    <Router>
      <AppRoutes />
    </Router></AuthProvider>
  </StrictMode>,
)