import Layout from "./Layout.jsx";
import Home from "./Home";
import Goals from "./Goals";
import Habits from "./Habits";
import Dashboard from "./Dashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

export default function Pages() {
    return (
        <Router>
            <Routes>
                {/* Protected routes - Base44 handles auth redirects automatically */}
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
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />

                {/* TODO: Add more routes here as we build them */}
                {/* <Route path="/onboarding" element={<Onboarding />} /> */}
                {/* <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} /> */}
                {/* <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} /> */}
            </Routes>
        </Router>
    );
}