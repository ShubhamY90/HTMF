import React, { useState, useEffect } from 'react';
import { fetchHackathons } from '../context/firebase/hackathon';
import { useNavigate } from 'react-router-dom';

const HackathonsPage = () => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  const navigate = useNavigate();

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

  const now = new Date();
  // apply base upcoming/past split
  const upcomingBase = hackathons.filter(h => h.deadline && new Date(h.deadline) >= now);
  const pastBase     = hackathons.filter(h => h.deadline && new Date(h.deadline) < now);

  // apply filters: type and date
  const applyFilters = (list) => {
    return list.filter(h => {
      const matchesType = filterType === 'All' || h.type === filterType;
      const matchesDate = !filterDate || new Date(h.deadline) >= new Date(filterDate);
      return matchesType && matchesDate;
    });
  };

  const upcomingHackathons = applyFilters(upcomingBase);
  const pastHackathons     = applyFilters(pastBase);

  const getPreview = (text, hackathon) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= 10) return text;
    return (
      <>
        {words.slice(0, 10).join(" ")}
        <span
          className="text-sm text-blue-300 cursor-pointer ml-1"
          onClick={() => {
            setSelectedHackathon(hackathon);
            setModalVisible(true);
          }}
        >… know more</span>
      </>
    );
  };

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedHackathon(null), 300);
  };

  const handleJoin = (hackathon) => {
    navigate(`/hackathon/${hackathon.id}`);
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
      <section id="hackathons" className="p-8 bg-white">
        <div className="container mx-auto">
          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="p-2 rounded border"
            >
              <option value="All">All Types</option>
              <option value="Web Development">Web Development</option>
              <option value="Game Development">Game Development</option>
              <option value="Machine Learning">Machine Learning</option>
              <option value="Data Science">Data Science</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Web3">Web3</option>
              <option value="Blockchain">Blockchain</option>
              <option value="IoT">IoT</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="Cloud Computing">Cloud Computing</option>
              <option value="Cybersecurity">Cybersecurity</option>
            </select>
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="p-2 rounded border"
            />
          </div>

          {/* Upcoming Hackathons */}
          <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">Upcoming Hackathons</h2>
          {upcomingHackathons.length === 0 ? (
            <p className="text-center text-gray-600">No upcoming hackathons.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingHackathons.map(hackathon => (
                <div key={hackathon.id} className="p-6 rounded-lg shadow-lg flex flex-col bg-purple-700 text-white">
                  <h3 className="text-2xl font-semibold mb-2">{hackathon.title}</h3>
                  <p className="mb-2">{getPreview(hackathon.description, hackathon)}</p>
                  {hackathon.location && <p className="mb-2"><strong>Location:</strong> {hackathon.location}</p>}
                  {hackathon.deadline && <p className="mb-4"><strong>Deadline:</strong> {new Date(hackathon.deadline).toLocaleString()}</p>}
                  <button
                    onClick={() => handleJoin(hackathon)}
                    className="mt-auto px-4 py-2 rounded bg-purple-900 hover:opacity-90 transition"
                  >Join Hackathon</button>
                </div>
              ))}
            </div>
          )}

          <div className="my-12"><hr className="border-t-2 border-gray-300" /></div>

          {/* Past Hackathons */}
          <h2 className="text-4xl font-bold text-center mb-8 text-teal-700">Past Hackathons</h2>
          {pastHackathons.length === 0 ? (
            <p className="text-center text-gray-600">No past hackathons.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastHackathons.map(hackathon => (
                <div key={hackathon.id} className="p-6 rounded-lg shadow-lg flex flex-col bg-teal-600 text-white">
                  <h3 className="text-2xl font-semibold mb-2">{hackathon.title}</h3>
                  <p className="mb-2">{getPreview(hackathon.description, hackathon)}</p>
                  {hackathon.location && <p className="mb-2"><strong>Location:</strong> {hackathon.location}</p>}
                  {hackathon.deadline && <p className="mb-4"><strong>Deadline:</strong> {new Date(hackathon.deadline).toLocaleString()}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal for Full Hackathon Details */}
      {selectedHackathon && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${modalVisible ? 'opacity-90 visible' : 'opacity-0 invisible'}`}>
          <div className="relative w-11/12 max-w-2xl p-6 rounded-lg bg-white bg-opacity-80 backdrop-blur-sm text-black">
            <button onClick={closeModal} className="absolute top-2 right-2 text-xl text-gray-700 hover:text-gray-900">&times;</button>
            <h2 className="text-3xl font-bold mb-4">{selectedHackathon.title}</h2>
            <p className="mb-4">{selectedHackathon.description}</p>
            {selectedHackathon.location && <p className="mb-2"><strong>Location:</strong> {selectedHackathon.location}</p>}
            {selectedHackathon.deadline && <p className="mb-4"><strong>Deadline:</strong> {new Date(selectedHackathon.deadline).toLocaleString()}</p>}
            {selectedHackathon.type && <p className="mb-2"><strong>Type:</strong> {selectedHackathon.type}</p>}
            {selectedHackathon.imageUrl && <img src={selectedHackathon.imageUrl} alt={selectedHackathon.title} className="w-full rounded mb-4" />}
          </div>
        </div>
      )}
    </>
  );
};

export default HackathonsPage;
