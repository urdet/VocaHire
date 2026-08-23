import ProtectedRoute from './ProtectedRoute';
import Main from '../pages/Dashboard';
import Port from '../port';
import Test from '../pages/Test';
import { Routes, Route } from 'react-router-dom';
import AudioRecorder from '../pages/AudioRecorder';
import LandingPage from '../pages/LandingPage';
export default function AppRoutes() {
  return (
    <Routes>
        <Route path="/" element={<LandingPage />} />
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
        <Route
            path="/session-management"
            element={
            <ProtectedRoute>
                <Main />
            </ProtectedRoute>
            }
        />
        <Route
            path="/candidate-management"
            element={
            <ProtectedRoute>
                <Main />
            </ProtectedRoute>
            }
        />
        <Route
            path="/audio-recorder/:id"
            element={
            <ProtectedRoute>
                <AudioRecorder />
            </ProtectedRoute>
            }
        />
    </Routes>
)};
