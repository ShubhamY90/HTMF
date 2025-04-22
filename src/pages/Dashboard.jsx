// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { fetchUserProfile, updateUserProfile } from "../context/firebase";

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  // Local editing state for extra details
  const [mobileNumber, setMobileNumber] = useState("");
  const [githubId, setGithubId] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      fetchUserProfile(currentUser.uid)
        .then((data) => {
          setProfile(data);
          setMobileNumber(data.mobileNumber || "");
          setGithubId(data.githubId || "");
          setExperienceLevel(data.experienceLevel || "");
          setSkills(data.skills || []);
        })
        .catch((error) => console.error("Error fetching profile:", error))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleUpdate = async () => {
    setUpdateMessage("");
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setUpdateMessage("User not authenticated.");
      return;
    }
    const updates = {
      mobileNumber,
      githubId,
      experienceLevel,
      skills,
    };
    try {
      await updateUserProfile(currentUser.uid, updates);
      setUpdateMessage("Profile updated successfully!");
      // Optionally refresh profile data:
      const updatedProfile = await fetchUserProfile(currentUser.uid);
      setProfile(updatedProfile);
    } catch (error) {
      setUpdateMessage(`Update error: ${error.message}`);
    }
  };

  const handleAddSkill = () => {
    const trimmedSkill = newSkill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const calculateCompleteness = () => {
    if (!profile) return 0;
    const extraFields = ["mobileNumber", "githubId", "experienceLevel", "skills"];
    let filled = 0;
    extraFields.forEach((field) => {
      if (field === "skills") {
        if (skills.length > 0) filled++;
      } else if (profile[field] && String(profile[field]).trim() !== "") {
        filled++;
      }
    });
    return (filled / extraFields.length) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-white">
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-4xl mx-auto bg-gray-600 p-8 rounded-2xl shadow-xl text-white">
        <h1 className="text-4xl font-extrabold text-center mb-8">Your Dashboard</h1>

        {/* Profile Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-lg">
          <div>
            <strong>Name:</strong> {profile?.name || "N/A"}
          </div>
          <div>
            <strong>College:</strong> {profile?.collegeName || "N/A"}
          </div>
          <div>
            <strong>Email:</strong> {profile?.email || "N/A"}
          </div>
        </div>

        {/* Editable Fields */}
        <div className="space-y-6">
          <div>
            <label className="block mb-1 font-semibold text-gray-300">Mobile Number</label>
            <input
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a9d8f] bg-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-300">GitHub ID</label>
            <input
              type="text"
              value={githubId}
              onChange={(e) => setGithubId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a9d8f] bg-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-300">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a9d8f] bg-gray-700 text-white"
            >
              <option value="">Select level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="professional">Professional</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-300">Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((skill, idx) => (
                <div
                  key={idx}
                  className="bg-gray-600 text-sm px-3 py-1 rounded-full flex items-center"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-2 text-red-400 hover:text-red-600 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                className="flex-grow px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a9d8f] bg-gray-700 text-white"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Update Button */}
        <div className="mt-8">
          <button
            onClick={handleUpdate}
            className="w-full bg-[#580191] text-white py-3 rounded-xl font-semibold text-lg hover:bg-[#d65a41] transition"
          >
            Update Profile
          </button>
          {updateMessage && (
            <p className="mt-3 text-center text-sm text-gray-300">
              {updateMessage}
            </p>
          )}
        </div>

        {/* Profile Completeness */}
        <div className="mt-10">
          <p className="font-semibold text-gray-300 mb-1">
            Profile Completeness: {calculateCompleteness().toFixed(0)}%
          </p>
          <div className="w-full bg-gray-600 h-5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-5 text-xs font-bold text-white flex items-center justify-center"
              style={{ width: `${calculateCompleteness()}%` }}
            >
              {calculateCompleteness().toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
