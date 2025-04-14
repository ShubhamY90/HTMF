// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import Login from './pages/Login';
import HackathonsPage from './pages/Hackathons';
import AddHackathon from './pages/AddHackathon';
import Dashboard from './pages/Dashboard';  // Import the Dashboard page
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/hackathons" element={<HackathonsPage />} />
          <Route path="/add-hackathon" element={<AddHackathon />} />
          <Route path="/dashboard" element={<Dashboard />} />  {/* New route */}
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
