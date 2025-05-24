// src/pages/HomePage.jsx
import React from "react";
import DecryptedText from '../components/DecryptedText.jsx';
import LetterGlitch from '../components/LetterGlitch';
import Squares from "../components/Squares.jsx";



const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#fffdf7] text-gray-800">
      {/* Header */}
      

      {/* Hero Section */}
      <section
        id="home"
        className="relative bg-cover bg-center opacity-90"
        style={{ backgroundImage: "url('https://images.squarespace-cdn.com/content/v1/5e6542d2ae16460bb741a9eb/1603318636443-A846ACUKNYUBA0RPLJ94/marvin-meyer-SYTO3xs06fU-unsplash.jpg?format=2500w')" }}
      >
        <div className="absolute inset-0 z-0">
        </div>
        <div className="relative z-10 container mx-auto py-36 text-center">
          <div className="text-4xl font-bold text-black">
            <DecryptedText
              text="Find Your Hackathon Team"
              speed={100}
              maxIterations={20}
              useOriginalCharsOnly={true}
              sequential= "true"
              animateOn="view"
              revealDirection="start"
            />          
          </div>
          <p className="mt-4 text-xl text-black">
            Connect with innovators and build your dream team today.
          </p>
          <a
            href="#about"
            className="mt-8 inline-block px-8 py-3 bg-white text-green-500 font-semibold rounded shadow-lg hover:bg-green-100 transition transform hover:-translate-y-1"
          >
            Get Started
          </a>
          <br />
          <br />
          <a href="https://github.com/ShubhamY90/HTMF.git"
            className="text-black text-2xl font-medium underline hover:text-green-500 transition my-4"
        >
            Repository Link (GitHub)
        </a>
        </div>
        
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Our Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded shadow hover:shadow-xl transition duration-300">
            <h3 className="text-2xl font-bold mb-4">Discover Talent</h3>
            <p>
              Browse profiles of talented hackers, designers, and innovators.
            </p>
          </div>
          <div className="bg-white p-6 rounded shadow hover:shadow-xl transition duration-300">
            <h3 className="text-2xl font-bold mb-4">Collaborate</h3>
            <p>
              Engage in real-time discussions and collaborate seamlessly.
            </p>
          </div>
          <div className="bg-white p-6 rounded shadow hover:shadow-xl transition duration-300">
            <h3 className="text-2xl font-bold mb-4">Join Events</h3>
            <p>
              Participate in hackathons and events tailored for you.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="container mx-auto py-12 bg-white rounded-lg shadow-lg px-8">
        <h2 className="text-3xl font-bold text-center mb-6">About Our Platform</h2>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <img
              src="https://www.vectara.com/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2Fp0pvmro2%2Fproduction%2Ff8e8372c86a4b8c2f58c00309e6fef63b065ff52-1792x1024.webp%3Frect%3D0%2C6%2C1792%2C1013%26w%3D1408%26h%3D796%26q%3D90%26fit%3Dcrop%26auto%3Dformat&w=1920&q=100"
              alt="About Us"
              className="rounded-lg shadow-md"
            />
          </div>
          <div className="md:w-1/2 text-lg text-gray-700">
            <p className="mb-4">
              We are dedicated to connecting you with the perfect hackathon team.
              Our platform makes it easy for innovators, designers, and developers to collaborate and bring great ideas to life.
            </p>
            <p className="mb-4">
              Discover talent, join events, and collaborate seamlessly—all in one place.
            </p>
            <a
              href="#"
              className="inline-block px-6 py-3 bg-green-500 text-white font-semibold rounded hover:bg-green-600 transition"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      
    </div>
  );
};

export default HomePage;
