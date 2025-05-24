// src/pages/NotificationsPage.jsx
import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../context/firebase";
import { updateJoinRequestStatus } from "../context/firebase/notifications";
import { fetchUserProfile } from "../context/firebase/user";
import { joinTeam } from "../context/firebase/teams";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, "users1", user.uid, "notifs"));
      const querySnapshot = await getDocs(q);

      const notifs = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.type === "join_request") {
          if (data.status === "pending") {
            notifs.push({ id: docSnap.id, ...data });
          }
        } else {
          // For other notification types, show if not 'read'
          if (data.status !== "read") {
            notifs.push({ id: docSnap.id, ...data });
          }
        }
      });
      setNotifications(notifs);
    };

    fetchNotifications();
  }, []);

  const handleApprove = async (notif) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("User not authenticated");
        return;
      }
      const recipientId = user.uid;

      await joinTeam(notif.teamId, notif.hackathonId, notif.senderId);
      await updateJoinRequestStatus(recipientId, notif.id, "approved");
      alert(`Approved ${notif.senderName}'s join request.`);
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    } catch (error) {
      if (error.message === "User already joined a team.") {
        alert("User has already joined another team.");
      } else {
        alert("Error approving join request: " + error.message);
      }
    }
  };

  const handleDecline = async (notif) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("User not authenticated");
        return;
      }
      const recipientId = user.uid;

      await updateJoinRequestStatus(recipientId, notif.id, "declined");
      alert(`Declined ${notif.senderName}'s join request.`);
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    } catch (error) {
      console.error("Error declining join request:", error);
    }
  };

  const handleReviewProfile = async (notif) => {
    try {
      const profile = await fetchUserProfile(notif.senderId);
      setSelectedProfile(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      alert("Error fetching profile: " + error.message);
    }
  };

  const markAsRead = async (notifId) => {
    const user = auth.currentUser;
    if (!user) {
      alert("User not authenticated");
      return;
    }
    const notifRef = doc(db, "users1", user.uid, "notifs", notifId);
    await updateDoc(notifRef, { status: "read" });
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Notifications</h1>
      {notifications.length === 0 ? (
        <p>No notifications.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notif) => {
            let actionButtons = null;

            if (notif.type === "join_request") {
              actionButtons = (
                <>
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
                </>
              );
            } else if (notif.type === "team-deleted") {
              actionButtons = (
                <button
                  onClick={() => markAsRead(notif.id)}
                  className="py-1 px-3 bg-gray-600 text-white rounded"
                >
                  Mark as Read
                </button>
              );
            }

            return (
              <li key={notif.id} className="p-4 border rounded">
                <p>{notif.message}</p>
                {notif.senderName && (
                  <p>
                    <strong>Requester:</strong> {notif.senderName}
                  </p>
                )}
                <div className="mt-2 space-x-2">{actionButtons}</div>
              </li>
            );
          })}
        </ul>
      )}

      {selectedProfile && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
          <div className="bg-white bg-opacity-90 p-6 rounded shadow-xl max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">User Profile</h2>
            <p>
              <strong>Name:</strong> {selectedProfile.name}
            </p>
            <p>
              <strong>Skills:</strong>{" "}
              {selectedProfile.skills && selectedProfile.skills.length > 0
                ? selectedProfile.skills.join(", ")
                : "N/A"}
            </p>
            <p>
              <strong>GitHub ID:</strong> {selectedProfile.githubId || "N/A"}
            </p>
            <p>
              <strong>Experience:</strong>{" "}
              {selectedProfile.experienceLevel || "N/A"}
            </p>
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
