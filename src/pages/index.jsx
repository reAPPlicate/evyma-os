import Layout from "./Layout.jsx";

import Home from "./Home";

import Landing from "./Landing";

import Admin from "./Admin";

import Goals from "./Goals";

import Habits from "./Habits";

import Dashboard from "./Dashboard";

import Billing from "./Billing";

import Feed from "./Feed";

import Courses from "./Courses";

import Journal from "./Journal";

import Community from "./Community";

import Settings from "./Settings";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Landing: Landing,
    
    Admin: Admin,
    
    Goals: Goals,
    
    Habits: Habits,
    
    Dashboard: Dashboard,
    
    Billing: Billing,
    
    Feed: Feed,
    
    Courses: Courses,
    
    Journal: Journal,
    
    Community: Community,
    
    Settings: Settings,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Landing" element={<Landing />} />
                
                <Route path="/Admin" element={<Admin />} />
                
                <Route path="/Goals" element={<Goals />} />
                
                <Route path="/Habits" element={<Habits />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Billing" element={<Billing />} />
                
                <Route path="/Feed" element={<Feed />} />
                
                <Route path="/Courses" element={<Courses />} />
                
                <Route path="/Journal" element={<Journal />} />
                
                <Route path="/Community" element={<Community />} />
                
                <Route path="/Settings" element={<Settings />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}