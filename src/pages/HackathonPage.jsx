// src/pages/HackathonPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../context/firebase';
import {
  fetchUserHackathonParticipation,
  createTeam,
  getJoinableTeamsForHackathon,
  joinTeam,           // Direct join (if you choose to allow it)
  sendJoinRequest,    // Request-based join: sends a notification to team leader
  deleteTeam,
  leaveTeam,
  fetchTeamMembers    // Helper to fetch team member profiles (ensure it's exported in firebase.jsx)
} from "../context/firebase";

const HackathonPage = () => {
  const { hackathonId } = useParams();

  // Local state variables
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Auth state from Firebase Auth.
  const [currentUser, setCurrentUser] = useState(null);
  
  // Team participation and full team document
  const [userTeam, setUserTeam] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]); // Array of user profiles for team members
  
  // State for join options and input fields.
  const [showJoinOptions, setShowJoinOptions] = useState(false);
  const [joinableTeams, setJoinableTeams] = useState([]);
  const [joinCode, setJoinCode] = useState("");
  const [teamName, setTeamName] = useState(""); // For new team creation

  // Subscribe to auth state changes.
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  // Fetch hackathon details.
  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        const hackathonDoc = await getDoc(doc(db, 'hackathons', hackathonId));
        if (hackathonDoc.exists()) {
          setHackathon({ id: hackathonDoc.id, ...hackathonDoc.data() });
        } else {
          setError('Hackathon not found.');
        }
      } catch (err) {
        setError('Failed to fetch hackathon data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHackathon();
  }, [hackathonId]);

  // Check if the user has already joined a team for this hackathon.
  useEffect(() => {
    const checkParticipation = async () => {
      if (currentUser && hackathonId) {
        try {
          const participation = await fetchUserHackathonParticipation(hackathonId, currentUser.uid);
          if (participation) {
            setUserTeam(participation);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    checkParticipation();
  }, [currentUser, hackathonId]);

  // Fetch the full team document if the user has joined a team.
  useEffect(() => {
    const fetchTeamData = async () => {
      if (userTeam && userTeam.teamId) {
        try {
          const teamDoc = await getDoc(doc(db, 'teams', userTeam.teamId));
          if (teamDoc.exists()) {
            setTeamData(teamDoc.data());
          } else {
            setTeamData(null);
          }
        } catch (err) {
          console.error("Error fetching team data:", err);
        }
      } else {
        setTeamData(null);
      }
    };
    fetchTeamData();
  }, [userTeam]);

  // Fetch team member profiles using teamData.members.
  useEffect(() => {
    const fetchMembers = async () => {
      if (teamData && teamData.members && teamData.members.length > 0) {
        try {
          const members = await fetchTeamMembers(teamData.members);
          setTeamMembers(members);
        } catch (err) {
          console.error("Error fetching team members:", err);
        }
      } else {
        setTeamMembers([]);
      }
    };
    fetchMembers();
  }, [teamData]);

  // Format Firestore timestamp for display.
  const formatCreatedAt = (timestamp) => {
    const dateObj = new Date(timestamp.seconds * 1000);
    const options = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Kolkata',
      timeZoneName: 'short',
    };
    return dateObj.toLocaleString('en-GB', options).replace(',', ' at');
  };

  // Handle team creation with team name and creator's name.
  const handleCreateTeam = async () => {
    if (!currentUser) return;
    if (!teamName.trim()) {
      alert("Please enter a team name.");
      return;
    }
    try {
      const creatorName = currentUser.displayName || currentUser.email;
      await createTeam(hackathonId, currentUser.uid, teamName, creatorName);
      const participation = await fetchUserHackathonParticipation(hackathonId, currentUser.uid);
      setUserTeam(participation);
      setTeamName(""); // Reset the input field.
    } catch (err) {
      console.error(err);
      alert("Error creating team: " + err.message);
    }
  };

  // Handle direct join (if enabled).
  const handleJoinTeam = async (team) => {
    if (!currentUser) return;
    try {
      await joinTeam(team.id, hackathonId, currentUser.uid);
      const participation = await fetchUserHackathonParticipation(hackathonId, currentUser.uid);
      setUserTeam(participation);
    } catch (err) {
      console.error(err);
      alert("Error joining team: " + err.message);
    }
  };

  // Send a join request notification to team leader.
  const handleRequestJoin = async (team) => {
    if (!currentUser) return;
    try {
      const senderName = currentUser.displayName || currentUser.email;
      await sendJoinRequest(team.id, hackathonId, currentUser.uid, senderName, team.createdBy);
      alert("Join request sent.");
    } catch (err) {
      console.error(err);
      alert("Error sending join request: " + err.message);
    }
  };

  // Handle join by team code.
  const handleJoinTeamByCode = async (code) => {
    if (!currentUser) return;
    try {
      await joinTeamUsingCode(code, hackathonId, currentUser.uid);
      const participation = await fetchUserHackathonParticipation(hackathonId, currentUser.uid);
      setUserTeam(participation);
    } catch (err) {
      console.error(err);
      alert("Error joining team with code: " + err.message);
    }
  };

  // Fetch joinable teams for this hackathon.
  const fetchJoinableTeams = async () => {
    try {
      const teams = await getJoinableTeamsForHackathon(hackathonId);
      setJoinableTeams(teams);
    } catch (err) {
      console.error(err);
      alert("Error fetching teams: " + err.message);
    }
  };

  useEffect(() => {
    if (showJoinOptions) {
      fetchJoinableTeams();
    }
  }, [showJoinOptions, hackathonId]);

  // Delete team (only for the team creator).
  const handleDeleteTeam = async () => {
    if (!currentUser) return;
    if (!window.confirm("Are you sure you want to delete your team? This action cannot be undone.")) {
      return;
    }
    try {
      await deleteTeam(userTeam.teamId, hackathonId, currentUser.uid);
      setUserTeam(null);
      setTeamData(null);
      setTeamMembers([]);
      alert("Team deleted successfully.");
    } catch (err) {
      console.error(err);
      alert("Error deleting team: " + err.message);
    }
  };

  // Leave team (for non-creators).
  const handleLeaveTeam = async () => {
    if (!currentUser) return;
    if (!window.confirm("Are you sure you want to leave your team?")) {
      return;
    }
    try {
      await leaveTeam(userTeam.teamId, hackathonId, currentUser.uid);
      setUserTeam(null);
      setTeamData(null);
      setTeamMembers([]);
      alert("You have left the team.");
    } catch (err) {
      console.error(err);
      alert("Error leaving team: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Loading hackathon details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-4xl font-bold text-center mb-8">{hackathon.title}</h1>
        {hackathon.imageUrl && (
          <img
            src={hackathon.imageUrl}
            alt={hackathon.title}
            className="w-full rounded mb-6"
          />
        )}
        <p className="mb-4">{hackathon.description}</p>
        <p className="mb-2"><strong>Location:</strong> {hackathon.location}</p>
        {hackathon.deadline && (
          <p className="mb-2">
            <strong>Deadline:</strong> {new Date(hackathon.deadline).toLocaleString()}
          </p>
        )}
        {hackathon.createdAt && (
          <p className="mb-2 text-sm text-gray-500">
            <strong>Created:</strong> {formatCreatedAt(hackathon.createdAt)}
          </p>
        )}

        {/* Team Management Section */}
        {currentUser && !userTeam ? (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Join Hackathon</h2>
            <div className="flex flex-col space-y-4 mb-4">
              <div className="flex items-center space-x-2">
                <input 
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter your team name"
                  className="p-2 border rounded"
                />
                <button 
                  onClick={handleCreateTeam}
                  className="py-2 px-4 bg-green-600 text-white rounded hover:opacity-90"
                >
                  Create Team
                </button>
              </div>
              <button 
                onClick={() => setShowJoinOptions(!showJoinOptions)}
                className="py-2 px-4 bg-blue-600 text-white rounded hover:opacity-90"
              >
                Join Team
              </button>
            </div>
            {showJoinOptions && (
              <>
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">Available Teams</h3>
                  {joinableTeams.length > 0 ? (
                    <ul>
                      {joinableTeams.map(team => (
                        <li key={team.id} className="mb-2 flex items-center justify-between">
                          <span>
                            Team Name: {team.teamName} | Leader: {team.createdByName} (Members: {team.members.length}/{team.maxMembers})
                          </span>
                          <div className="space-x-2">
                            <button 
                              onClick={() => handleRequestJoin(team)}
                              className="py-1 px-3 bg-yellow-600 text-white rounded hover:opacity-90"
                            >
                              Request to Join
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No teams available for joining.</p>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Join Using Team Code</h3>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      placeholder="Enter team code"
                      className="p-2 border rounded"
                    />
                    <button 
                      onClick={() => handleJoinTeamByCode(joinCode)}
                      className="py-2 px-4 bg-purple-600 text-white rounded hover:opacity-90"
                    >
                      Join via Code
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : currentUser && userTeam ? (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Your Team Details</h2>
            {teamData && (
              <>
                <p><strong>Team Name:</strong> {teamData.teamName}</p>
                <p><strong>Team Code:</strong> {teamData.teamCode}</p>
                <p><strong>Team Leader:</strong> {teamData.createdByName}</p>
              </>
            )}
            {teamMembers.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xl font-semibold">Team Members</h3>
                <ul className="list-disc ml-6">
                  {teamMembers.map(member => (
                    <li key={member.uid}>{member.name}</li>
                  ))}
                </ul>
              </div>
            )}
            {teamData && teamData.createdBy === currentUser.uid ? (
              <button 
                onClick={handleDeleteTeam}
                className="mt-4 py-2 px-4 bg-red-600 text-white rounded hover:opacity-90"
              >
                Delete Team
              </button>
            ) : (
              <button 
                onClick={handleLeaveTeam}
                className="mt-4 py-2 px-4 bg-red-600 text-white rounded hover:opacity-90"
              >
                Leave Team
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default HackathonPage;