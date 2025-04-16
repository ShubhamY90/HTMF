// src/pages/NotificationsPage.jsx
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from '../context/firebase';
import { updateJoinRequestStatus, joinTeam, fetchUserProfile } from '../context/firebase';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null); // For the profile modal

  // Fetch notifications for the current user (as team leader)
  useEffect(() => {
    const fetchNotifications = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const q = query(
        collection(db, "notifications"),
        where("recipientId", "==", user.uid),
        where("status", "==", "pending")
      );
      const querySnapshot = await getDocs(q);
      const notifs = [];
      querySnapshot.forEach((docSnap) => {
        notifs.push({ id: docSnap.id, ...docSnap.data() });
      });
      setNotifications(notifs);
    };
    fetchNotifications();
  }, []);

  // Handler for approving a join request.
  const handleApprove = async (notif) => {
    try {
      // Attempt to join the team.
      await joinTeam(notif.teamId, notif.hackathonId, notif.senderId);
      await updateJoinRequestStatus(notif.id, 'approved');
      alert(`Approved ${notif.senderName}'s join request.`);
      setNotifications(notifications.filter(n => n.id !== notif.id));
    } catch (error) {
      if (error.message === "User already joined a team.") {
        alert("User has already joined another team.");
      } else {
        alert("Error approving join request: " + error.message);
      }
      // Optionally, update the notification to a declined status here.
      // await updateJoinRequestStatus(notif.id, 'declined');
    }
  };

  // Handler for declining a join request.
  const handleDecline = async (notif) => {
    try {
      await updateJoinRequestStatus(notif.id, 'declined');
      alert(`Declined ${notif.senderName}'s join request.`);
      setNotifications(notifications.filter(n => n.id !== notif.id));
    } catch (error) {
      console.error("Error declining join request:", error);
    }
  };

  // Handler for reviewing the sender's profile.
  const handleReviewProfile = async (notif) => {
    try {
      const profile = await fetchUserProfile(notif.senderId);
      setSelectedProfile(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      alert("Error fetching profile: " + error.message);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Notifications</h1>
      {notifications.length === 0 ? (
        <p>No notifications.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map(notif => (
            <li key={notif.id} className="p-4 border rounded">
              <p>{notif.message}</p>
              <p>
                <strong>Requester:</strong> {notif.senderName}
              </p>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => handleApprove(notif)}
                  className="py-1 px-3 bg-green-600 text-white rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDecline(notif)}
                  className="py-1 px-3 bg-red-600 text-white rounded"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleReviewProfile(notif)}
                  className="py-1 px-3 bg-blue-600 text-white rounded"
                >
                  Review Profile
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal to display user profile */}
      {selectedProfile && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
          <div className="bg-white bg-opacity-90 p-6 rounded shadow-xl max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">User Profile</h2>
            <p><strong>Name:</strong> {selectedProfile.name}</p>
            <p>
              <strong>Skills:</strong>{" "}
              {selectedProfile.skills && selectedProfile.skills.length > 0
                ? selectedProfile.skills.join(", ")
                : "N/A"}
            </p>
            <p><strong>GitHub ID:</strong> {selectedProfile.githubId || "N/A"}</p>
            <p><strong>Experience:</strong> {selectedProfile.experienceLevel || "N/A"}</p>
            <button
              onClick={() => setSelectedProfile(null)}
              className="mt-4 py-1 px-3 bg-blue-600 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
