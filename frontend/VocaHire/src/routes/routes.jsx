import ProtectedRoute from './ProtectedRoute';
import Main from '../pages/Dashboard';
import Port from '../port';
import Test from '../pages/Test';
import { Routes, Route } from 'react-router-dom';
export default function AppRoutes() {
  return (
    <Routes>
        <Route path="/" element={<ProtectedRoute>
                <Main />
            </ProtectedRoute>} />
        <Route path="/login" element={<Port />} />
        <Route path="/test" element={<Test />} />
        <Route
            path="/dashboard"
            element={
            <ProtectedRoute>
                <Main />
            </ProtectedRoute>
            }
        />
    </Routes>
)};
