// src/pages/HackathonsPage.jsx
import React, { useState, useEffect } from 'react';
import { fetchHackathons } from '../context/firebase';

const HackathonsPage = () => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadHackathons = async () => {
      try {
        const data = await fetchHackathons();
        setHackathons(data);
      } catch (error) {
        console.error("Error fetching hackathons:", error);
      } finally {
        setLoading(false);
      }
    };
    loadHackathons();
  }, []);

  // Split hackathons by deadline
  const now = new Date();
  const upcomingHackathons = hackathons.filter((h) => h.deadline && new Date(h.deadline) >= now);
  const pastHackathons = hackathons.filter((h) => h.deadline && new Date(h.deadline) < now);

  // Returns the first 10 words of text and appends an inline link if truncated
  const getPreview = (text, hackathon) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= 10) return text;
    return (
      <>
        {words.slice(0, 10).join(" ")}
        <span
          className="text-sm text-blue-300 cursor-pointer ml-1"
          onClick={() => openModal(hackathon)}
        >
          … know more
        </span>
      </>
    );
  };

  const openModal = (hackathon) => {
    setSelectedHackathon(hackathon);
    setModalVisible(true);
  };

  const closeModal = () => {
    // Smoothly transition out then clear state.
    setModalVisible(false);
    // Delay clearing the selected hackathon to allow animation finish (300ms)
    setTimeout(() => setSelectedHackathon(null), 300);
  };

  const handleJoin = (hackathon) => {
    // Replace this with your join logic.
    alert(`You've joined ${hackathon.title}!`);
  };

  if (loading) {
    return (
      <section className="p-8 bg-white">
        <div className="container mx-auto">
          <p className="text-center">Loading hackathons...</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="hackathons" className="p-8" style={{ backgroundColor: 'white' }}>
        <div className="container mx-auto">
          {/* Upcoming Hackathons */}
          <h2 className="text-4xl font-bold text-center mb-8" style={{ color: '#3a0ca3' }}>
            Upcoming Hackathons
          </h2>
          {upcomingHackathons.length === 0 ? (
            <p className="text-center text-white">No upcoming hackathons.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingHackathons.map((hackathon) => (
                <div
                  key={hackathon.id}
                  className="p-6 rounded-lg shadow-lg flex flex-col"
                  style={{ backgroundColor: '#560bad', color: '#ffffff' }}
                >
                  <h3 className="text-2xl font-semibold mb-2">{hackathon.title}</h3>
                  <p className="mb-2">
                    {getPreview(hackathon.description, hackathon)}
                  </p>
                  {hackathon.location && (
                    <p className="mb-2">
                      <strong>Location:</strong> {hackathon.location}
                    </p>
                  )}
                  {hackathon.deadline && (
                    <p className="mb-4">
                      <strong>Deadline:</strong> {new Date(hackathon.deadline).toLocaleString()}
                    </p>
                  )}
                  <button
                    onClick={() => handleJoin(hackathon)}
                    className="mt-auto px-4 py-2 rounded transition hover:opacity-90"
                    style={{ backgroundColor: '#7209b7', color: '#ffffff' }}
                  >
                    Join Hackathon
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="my-12">
            <hr className="border-t-2 border-gray-300" />
          </div>

          {/* Past Hackathons */}
          <h2 className="text-4xl font-bold text-center mb-8" style={{ color: '#3a0ca3' }}>
            Past Hackathons
          </h2>
          {pastHackathons.length === 0 ? (
            <p className="text-center text-white">No past hackathons.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastHackathons.map((hackathon) => (
                <div
                  key={hackathon.id}
                  className="p-6 rounded-lg shadow-lg flex flex-col"
                  style={{ backgroundColor: '#2A9D8F', color: '#ffffff' }}
                >
                  <h3 className="text-2xl font-semibold mb-2">{hackathon.title}</h3>
                  <p className="mb-2">
                    {getPreview(hackathon.description, hackathon)}
                  </p>
                  {hackathon.location && (
                    <p className="mb-2">
                      <strong>Location:</strong> {hackathon.location}
                    </p>
                  )}
                  {hackathon.deadline && (
                    <p className="mb-4">
                      <strong>Deadline:</strong> {new Date(hackathon.deadline).toLocaleString()}
                    </p>
                  )}
                  {/* No join button for past hackathons */}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal for Full Hackathon Details */}
      {selectedHackathon && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
            modalVisible ? "opacity-90 visible" : "opacity-0 invisible"
          }`}
        >
          <div className="relative w-11/12 max-w-2xl p-6 rounded-lg bg-white bg-opacity-80 backdrop-blur-sm text-black">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-xl text-gray-700 hover:text-gray-900"
            >
              &times;
            </button>
            <h2 className="text-3xl font-bold mb-4">{selectedHackathon.title}</h2>
            <p className="mb-4">{selectedHackathon.description}</p>
            {selectedHackathon.location && (
              <p className="mb-2">
                <strong>Location:</strong> {selectedHackathon.location}
              </p>
            )}
            {selectedHackathon.deadline && (
              <p className="mb-4">
                <strong>Deadline:</strong> {new Date(selectedHackathon.deadline).toLocaleString()}
              </p>
            )}
            {selectedHackathon.imageUrl && (
              <img
                src={selectedHackathon.imageUrl}
                alt={selectedHackathon.title}
                className="w-full rounded mb-4"
              />
            )}
            {selectedHackathon.createdAt && (
              <p className="text-sm text-gray-600">
                Added on:{" "}
                {new Date(selectedHackathon.createdAt.seconds * 1000).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default HackathonsPage;
