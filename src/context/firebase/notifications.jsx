// src/context/firebase/notifications.js
import {
  doc,
  collection,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./config";

/**
 * Sends a join request notification to the recipient's subcollection.
 */
export const sendJoinRequest = async (
  teamId, hackathonId, senderId, senderName, recipientId
) => {
  try {
    const notifRef = await addDoc(
      collection(db, "users1", recipientId, "notifs"),
      {
        type: "join_request",
        teamId,
        hackathonId,
        senderId,
        senderName,
        recipientId,
        status: "pending",
        createdAt: serverTimestamp(),
        message: `${senderName} requested to join your team.`,
      }
    );
    return notifRef.id;
  } catch (error) {
    console.error("Failed to send join request notification:", error);
    throw error;
  }
};

/**
 * Updates the join request notification status.
 */
export const updateJoinRequestStatus = async (recipientId, notificationId, newStatus) => {
  if (!newStatus) {
    throw new Error("updateJoinRequestStatus: newStatus is undefined or empty");
  }
  const notifRef = doc(db, "users1", recipientId, "notifs", notificationId);
  await updateDoc(notifRef, { status: newStatus });
};

/**
 * Sends a contact message notification to all admins' notifs subcollections.
 * `ADMIN_IDS` must be defined/imported elsewhere.
 */
export const sendContactNotification = async (formData, ADMIN_IDS) => {
  try {
    const notificationData = {
      type: 'contact_message',
      senderName: formData.name,
      senderEmail: formData.email,
      senderId: formData.senderId || null,
      message: formData.message,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    const promises = ADMIN_IDS.map(adminId => 
      addDoc(collection(db, "users1", adminId, "notifs"), notificationData)
    );

    const results = await Promise.all(promises);
    return results.map(ref => ref.id);
  } catch (error) {
    console.error("Error sending contact notification:", error);
    throw error;
  }
};

/**
 * Sends a reply to a contact message notification.
 */
export const sendContactReply = async (recipientId, notificationId, replyMessage) => {
  const notifRef = doc(db, "users1", recipientId, "notifs", notificationId);
  await updateDoc(notifRef, { reply: replyMessage, status: 'replied' });
};

/**
 * Sends a team deletion notification to all members' notifs subcollections.
 */
export const sendTeamDeletionNotification = async (memberUids, leaderName, teamName, hackathonTitle) => {
  const promises = memberUids.map(uid => 
    addDoc(collection(db, "users1", uid, "notifs"), {
      type: "team-deleted",
      status: "pending",
      message: `The team leader ${leaderName} has deleted the team "${teamName}" for the hackathon "${hackathonTitle}".`,
      createdAt: serverTimestamp(),
    })
  );

  await Promise.all(promises);
};
