// src/firebase/notifications.js
import {
  doc,
  collection,
  addDoc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  // add any others you actually use
} from "firebase/firestore";

import { db } from "./config";

export const sendJoinRequest = async (teamId, hackathonId, senderId, senderName, recipientId) => {
  const docRef = await addDoc(collection(db, "notifications"), {
    type: "join_request",
    teamId,
    hackathonId,
    senderId,
    senderName,
    recipientId,
    status: "pending",
    createdAt: serverTimestamp(),
    message: `${senderName} requested to join your team.`,
  });
  return docRef.id;
};

export const updateJoinRequestStatus = async (notificationId, newStatus) => {
  const notifRef = doc(db, "notifications", notificationId);
  await updateDoc(notifRef, { status: newStatus });
};

/**
 * Sends a contact message notification to all admins.
 *
 * @param {Object} formData - An object containing the contact form fields.
 *                          Expected to have { name, email, message, senderId }
 * @returns {Promise<string>} - The created notification document ID.
 */
export const sendContactNotification = async (formData) => {
  try {
    const notificationData = {
      type: 'contact_message',
      senderName: formData.name,
      senderEmail: formData.email,
      // Save senderId if provided (for logged in users); otherwise, omit or set to null.
      senderId: formData.senderId || null,
      message: formData.message,
      recipientIds: ADMIN_IDS, // Save the array of admin UIDs so that all admins receive this notification.
      status: 'pending',       // Status is pending reply.
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "notifications"), notificationData);
    return docRef.id;
  } catch (error) {
    console.error("Error sending contact notification:", error);
    throw error;
  }
};

/**
 * Allow an admin to send a reply to a contact message.
 *
 * @param {string} notificationId - The notification document ID.
 * @param {string} replyMessage - The admin's reply message.
 */
export const sendContactReply = async (notificationId, replyMessage) => {
  try {
    const notifRef = doc(db, "notifications", notificationId);
    await updateDoc(notifRef, { reply: replyMessage, status: 'replied' });
  } catch (error) {
    console.error("Error sending contact reply:", error);
    throw error;
  }
};


export const sendTeamDeletionNotification = async (memberUids, leaderName, teamName, hackathonTitle) => {
  const promises = memberUids.map(uid => {
    return addDoc(collection(db, "notifications"), {
      recipientId: uid,
      type: "team-deleted",
      message: `The team leader ${leaderName} has deleted the team "${teamName}" for the hackathon "${hackathonTitle}".`,
      timestamp: serverTimestamp(),
      read: false,
    });
  });

  await Promise.all(promises);
};