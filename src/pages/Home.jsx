import React from 'react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      

      {/* Hero Section */}
      <section
        id="home"
        className="bg-cover bg-center"
        style={{ backgroundImage: "url('https://via.placeholder.com/1500x500')" }}
      >
        <div className="container mx-auto py-36 text-center">
          <h1 className="text-5xl font-bold text-black">
            Find Your Hackathon Team
          </h1>
          <p className="mt-4 text-xl text-white">
            Connect with innovators and build your dream team today.
          </p>
          <button className="mt-8 px-8 py-3 bg-white text-green-500 font-semibold rounded hover:bg-gray-100 transition">
            Get Started
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Discover Talent</h2>
            <p>
              Browse profiles of talented hackers, designers, and innovators.
            </p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Collaborate</h2>
            <p>
              Engage in real-time discussions and collaborate across domains.
            </p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Join Events</h2>
            <p>
              Participate in hackathons and networking events tailored for you.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      
    </div>
  );
};

export default HomePage;
