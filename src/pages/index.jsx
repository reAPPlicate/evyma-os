import Layout from "./Layout.jsx";
import Home from "./Home";
import Auth from "./Auth";
import Goals from "./Goals";
import Habits from "./Habits";
import ProtectedRoute, { PublicRoute } from "../components/ProtectedRoute";
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';

export default function Pages() {
    return (
        <Router>
            <Routes>
                {/* Public routes */}
                <Route path="/auth" element={
                    <PublicRoute>
                        <Auth />
                    </PublicRoute>
                } />

                {/* Protected routes */}
                <Route path="/" element={
                    <ProtectedRoute>
                        <Layout>
                            <Home />
                        </Layout>
                    </ProtectedRoute>
                } />
                <Route path="/home" element={
                    <ProtectedRoute>
                        <Layout>
                            <Home />
                        </Layout>
                    </ProtectedRoute>
                } />
                <Route path="/goals" element={
                    <ProtectedRoute>
                        <Goals />
                    </ProtectedRoute>
                } />
                <Route path="/habits" element={
                    <ProtectedRoute>
                        <Habits />
                    </ProtectedRoute>
                } />

                {/* TODO: Add more routes here as we build them */}
                {/* <Route path="/onboarding" element={<Onboarding />} /> */}
                {/* <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} /> */}
                {/* <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> */}
                {/* <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} /> */}
            </Routes>
        </Router>
    );
}