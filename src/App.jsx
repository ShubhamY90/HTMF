// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import Login from './pages/Login';
import HackathonsPage from './pages/Hackathons';
import HackathonPage from './pages/HackathonPage';
import AddHackathon from './pages/AddHackathon';
import Dashboard from './pages/Dashboard';
import NotificationsPage from './pages/NotificationsPage'; // New notifications page
import Header from './components/Header';
import Footer from './components/Footer';
import FAQs from './pages/FAQs';
import './App.css';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-20">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/hackathons" element={<HackathonsPage />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/hackathon/:hackathonId" element={<HackathonPage />} />
          <Route path="/add-hackathon" element={<AddHackathon />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
