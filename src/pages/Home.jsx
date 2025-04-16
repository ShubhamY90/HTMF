// src/pages/HomePage.jsx
import React from "react";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#fffdf7] text-gray-800">
      {/* Header */}
      

      {/* Hero Section */}
      <section
        id="home"
        className="bg-cover bg-center"
        style={{ backgroundImage: "url('https://via.placeholder.com/1500x500')" }}
      >
        <div className="container mx-auto py-36 text-center">
          <h1 className="text-5xl font-bold text-gray-900 animate-pulse">
            Find Your Hackathon Team
          </h1>
          <p className="mt-4 text-xl text-gray-700">
            Connect with innovators and build your dream team today.
          </p>
          <a
            href="#about"
            className="mt-8 inline-block px-8 py-3 bg-white text-green-500 font-semibold rounded shadow-lg hover:bg-green-100 transition transform hover:-translate-y-1"
          >
            Get Started
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
              src="https://via.placeholder.com/600x400"
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
