import React, { useState, useEffect } from 'react';
import './index.css';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import About from './components/About/About';
import Features from './components/Features/Features';
import HowItWorks from './components/HowItWorks/HowItWorks';
import Benefits from './components/Benefits/Benefits';
import DashboardPreview from './components/DashboardPreview/DashboardPreview';
import CTASection from './components/CTASection/CTASection';
import Footer from './components/Footer/Footer';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('bl-theme');
    if (saved === 'dark') {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('bl-theme', next ? 'dark' : 'light');
  };

  return (
    <div className="App">
      <Navbar darkMode={darkMode} toggleDark={toggleDark} />
      <main>
        <Hero />
        <About />
        <Features />
        <HowItWorks />
        <Benefits />
        <DashboardPreview />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
