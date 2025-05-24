// src/context/firebase.jsx
import { initializeApp } from "firebase/app";
import { 
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  runTransaction,
  arrayUnion,
  deleteDoc,
  deleteField,
  arrayRemove
} from "firebase/firestore";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";

import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App and services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const ADMIN_UID = import.meta.env.VITE_ADMIN_UID;

export { app, db, auth, storage };

//////////////////////////
// Authentication & User Profiles
//////////////////////////

/**
 * Sign up a new user with Firebase Authentication and store extra profile details
 * in Firestore ("users1" collection). Also sends a verification email.
 */
export const signUpUser = async ({ name, collegeName, email, password }) => {
  if (!email.endsWith("@nsut.ac.in")) {
    throw new Error("Please use your @nsut.ac.in email address.");
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await sendEmailVerification(user);
  await setDoc(doc(db, "users1", user.uid), {
    name,
    collegeName,
    email,
    role: "member", // default role
    createdAt: serverTimestamp(),
    mobileNumber: "",
    githubId: "",
    experienceLevel: "",
    skills: [],
    uid: user.uid,  // Save uid for query purposes
  });
  return user;
};

/**
 * Log in an existing user using Firebase Authentication and fetch their profile
 * from Firestore ("users1" collection) after verifying their email.
 */
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  if (!user.emailVerified) {
    await signOut(auth);
    throw new Error("Please verify your email before logging in.");
  }
  const profileDocSnap = await getDoc(doc(db, "users1", user.uid));
  if (!profileDocSnap.exists()) {
    throw new Error("User profile data not found in Firestore.");
  }
  const profileData = profileDocSnap.data();
  return { uid: user.uid, ...profileData };
};

/**
 * Log out the current user.
 */
export const logoutUser = async () => {
  await signOut(auth);
};

/**
 * Fetch the profile data for a user by UID from Firestore ("users1" collection).
 */
export const fetchUserProfile = async (uid) => {
  const docSnap = await getDoc(doc(db, "users1", uid));
  if (!docSnap.exists()) {
    throw new Error("User profile not found");
  }
  return docSnap.data();
};

/**
 * Update the profile document in Firestore ("users1") for the specified UID.
 */
export const updateUserProfile = async (uid, updatedData) => {
  const userRef = doc(db, "users1", uid);
  await updateDoc(userRef, updatedData);
};

//////////////////////////
// Hackathon & Team Functions
//////////////////////////

/**
 * Add a new hackathon document to Firestore ("hackathons" collection).
 */
export const addHackathonData = async ({
  title,
  description,
  date,
  location,
  type,        // ← added
  imageUrl,
  deadline
}) => {
  const docRef = await addDoc(collection(db, "hackathons"), {
    title,
    description,
    date,
    location,
    type: type || null,      // ← store type (or null if none)
    imageUrl: imageUrl || null,
    deadline: deadline || null,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};
/**
 * Fetch all hackathons from the "hackathons" collection.
 * @returns {Promise<Array>} Array of hackathon objects (each containing its id and data).
 */
export const fetchHackathons = async () => {
  const querySnapshot = await getDocs(collection(db, "hackathons"));
  const hackathons = [];
  querySnapshot.forEach((docSnapshot) => {
    hackathons.push({ id: docSnapshot.id, ...docSnapshot.data() });
  });
  return hackathons;
};

/**
 * Create a team for a hackathon.
 * - Checks if a team with the same teamName already exists for that hackathon.
 * - Accepts a custom team name and the creator's name.
 * - Generates a unique team code.
 * - Adds the creator as the first member.
 * - Updates the user's hackathon participation in "users1" document.
 *
 * @param {string} hackathonId - The hackathon identifier.
 * @param {string} userId - The current user's UID.
 * @param {string} teamName - The chosen team name.
 * @param {string} creatorName - The name of the team creator.
 * @returns {Promise<string>} - The created team document ID.
 */
export const createTeam = async (hackathonId, userId, teamName, creatorName) => {
  // Check for duplicate team name within the same hackathon.
  const teamsQuery = query(
    collection(db, "teams"),
    where("hackathonId", "==", hackathonId),
    where("teamName", "==", teamName)
  );
  const querySnapshot = await getDocs(teamsQuery);
  if (!querySnapshot.empty) {
    throw new Error("A team with this name already exists. Please choose a different name.");
  }

  try {
    const teamData = {
      hackathonId,
      createdBy: userId,
      createdByName: creatorName, // Store the creator's name
      teamName,                   // Save the chosen team name
      members: [userId],
      maxMembers: 4,              // Adjust as needed.
      teamCode: Math.random().toString(36).substring(2, 8).toUpperCase(), // A unique, user-friendly code
      createdAt: serverTimestamp(),
    };

    const teamDocRef = await addDoc(collection(db, "teams"), teamData);

    // Update the user's participation for the hackathon in "users1" document.
    const userRef = doc(db, "users1", userId);
    await updateDoc(userRef, {
      [`hackathonParticipation.${hackathonId}`]: {
        teamId: teamDocRef.id,
        joinedAt: serverTimestamp(),
      },
    });

    return teamDocRef.id;
  } catch (error) {
    console.error("Error creating team: ", error);
    throw error;
  }
};

//////////////////////////
// Join Request & Notification Functions
//////////////////////////

/**
 * Sends a join request notification from a requester to the team leader.
 *
 * @param {string} teamId - The team document ID.
 * @param {string} hackathonId - The hackathon ID.
 * @param {string} senderId - The join requester's UID.
 * @param {string} senderName - The join requester's name.
 * @param {string} recipientId - The team leader’s UID.
 * @returns {Promise<string>} - The created notification document ID.
 */
export const sendJoinRequest = async (teamId, hackathonId, senderId, senderName, recipientId) => {
  try {
    const notificationData = {
      type: 'join_request',
      teamId,
      hackathonId,
      senderId,
      senderName,
      recipientId,
      status: 'pending', // pending, approved, declined
      createdAt: serverTimestamp(),
      message: `${senderName} requested to join your team.`,
    };

    const docRef = await addDoc(collection(db, "notifications"), notificationData);
    return docRef.id;
  } catch (error) {
    console.error("Error sending join request:", error);
    throw error;
  }
};

/**
 * Update the status of a join request (notification).
 *
 * @param {string} notificationId - The notification document ID.
 * @param {string} newStatus - 'approved' or 'declined'
 */
export const updateJoinRequestStatus = async (notificationId, newStatus) => {
  try {
    const notifRef = doc(db, "notifications", notificationId);
    await updateDoc(notifRef, { status: newStatus });
  } catch (error) {
    console.error("Error updating join request status:", error);
    throw error;
  }
};

//////////////////////////
// Join, Leave, and Team Functions
//////////////////////////

/**
 * Join an existing team by its ID.
 * Uses a transaction to ensure that the team is not over capacity and then updates both the team document and the user's document.
 * Now, it also checks if the user is already part of a team for the hackathon.
 *
 * @param {string} teamId - The team document ID.
 * @param {string} hackathonId - The hackathon ID.
 * @param {string} userId - The user's UID.
 */
const __joinTeam = async (teamId, hackathonId, userId) => {
  const teamRef = doc(db, "teams", teamId);
  const userRef = doc(db, "users1", userId);

  await runTransaction(db, async (transaction) => {
    const teamDoc = await transaction.get(teamRef);
    if (!teamDoc.exists()) throw new Error("Team does not exist!");
    const data = teamDoc.data();
    if (data.members.length >= data.maxMembers) throw new Error("Team full!");

    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists()) throw new Error("User not found!");
    const userData = userDoc.data();
    if (userData.hackathonParticipation?.[hackathonId]) {
      throw new Error("Already on a team.");
    }

    transaction.update(teamRef, { members: arrayUnion(userId) });
    transaction.update(userRef, {
      [`hackathonParticipation.${hackathonId}`]: {
        teamId,
        joinedAt: serverTimestamp(),
      },
    });
  });
};

/**
 * Fetch teams for a given hackathon that still have available member spots.
 *
 * @param {string} hackathonId - The hackathon identifier.
 * @returns {Promise<Array>} - An array of joinable team objects.
 */
export const getJoinableTeamsForHackathon = async (hackathonId) => {
  try {
    const teamsQuerySnapshot = await getDocs(
      query(
        collection(db, "teams"),
        where("hackathonId", "==", hackathonId)
      )
    );
    const teams = [];
    teamsQuerySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (data.members.length < data.maxMembers) {
        teams.push({ id: docSnapshot.id, ...data });
      }
    });
    return teams;
  } catch (error) {
    console.error("Error fetching joinable teams: ", error);
    throw error;
  }
};

/**
 * Join a team using its unique team code.
 * Searches for a team in the given hackathon that matches the teamCode and then
 * calls joinTeam to process the join.
 *
 * @param {string} teamCode - The unique team code.
 * @param {string} hackathonId - The hackathon identifier.
 * @param {string} userId - The user's UID.
 */
export const joinTeamUsingCode = async (teamCode, hackathonId, userId) => {
  try {
    const teamsQuerySnapshot = await getDocs(
      query(
        collection(db, "teams"),
        where("hackathonId", "==", hackathonId),
        where("teamCode", "==", teamCode)
      )
    );
    if (teamsQuerySnapshot.empty) {
      throw new Error("No team found with the provided code!");
    }
    // Assuming team codes are unique, take the first result.
    const teamDoc = teamsQuerySnapshot.docs[0];
    const data = teamDoc.data();
    if (data.members.length >= data.maxMembers) {
      throw new Error("Team is already full!");
    }
    await __joinTeam(teamDoc.id, hackathonId, userId);
  } catch (error) {
    console.error("Error joining team using code: ", error);
    throw error;
  }
};

/**
 * Fetch the user's participation details for a particular hackathon.
 * Returns the participation object (if exists) from the user's "hackathonParticipation" field.
 *
 * @param {string} hackathonId - The hackathon identifier.
 * @param {string} userId - The user's UID.
 * @returns {Promise<Object|null>} - Participation object or null.
 */
export const fetchUserHackathonParticipation = async (hackathonId, userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users1", userId));
    if (!userDoc.exists()) {
      throw new Error("User not found!");
    }
    const data = userDoc.data();
    return data.hackathonParticipation ? data.hackathonParticipation[hackathonId] : null;
  } catch (error) {
    console.error("Error fetching user hackathon participation: ", error);
    throw error;
  }
};

//////////////////////////
// Optional: Helper to Fetch Team Member Details
//////////////////////////

import { FieldPath } from "firebase/firestore";

/**
 * Fetch details for team members given an array of member UIDs.
 * This uses Firestore's document ID query to ensure that every user is fetched.
 *
 * @param {Array<string>} memberIds - Array of user UIDs.
 * @returns {Promise<Array>} - Array of user profile objects.
 */
export const fetchTeamMembers = async (memberIds) => {
  if (memberIds.length === 0) return [];
  // Query on the document ID rather than relying on a field called "uid"
  const q = query(
    collection(db, "users1"),
    where(FieldPath.documentId(), "in", memberIds)
  );
  const querySnapshot = await getDocs(q);
  const members = [];
  querySnapshot.forEach((docSnap) => {
    members.push({ uid: docSnap.id, ...docSnap.data() });
  });
  return members;
};

//////////////////////////
// Delete & Leave Team Functions
//////////////////////////

/**
 * Delete a team document.
 * Only the team creator can delete the team.
 * Also removes the team's participation record from the creator's document.
 *
 * @param {string} teamId - The team document ID.
 * @param {string} hackathonId - The hackathon ID.
 * @param {string} userId - The creator's UID.
 */
export const deleteTeam = async (teamId, hackathonId, userId) => {
  const teamRef = doc(db, "teams", teamId);
  const userRef = doc(db, "users1", userId);
  try {
    const teamDoc = await getDoc(teamRef);
    if (!teamDoc.exists()) {
      throw new Error("Team does not exist.");
    }
    const teamData = teamDoc.data();
    if (teamData.createdBy !== userId) {
      throw new Error("Only the team creator can delete the team.");
    }
    // Delete the team document.
    await deleteDoc(teamRef);
    // Remove the hackathon participation entry from the user's document.
    await updateDoc(userRef, {
      [`hackathonParticipation.${hackathonId}`]: deleteField()
    });
  } catch (error) {
    console.error("Error deleting team: ", error);
    throw error;
  }
};

/**
 * Leave a team.
 * Removes the user from the team's members array and deletes the participation record.
 * Note: The team creator should delete the team instead of leaving.
 *
 * @param {string} teamId - The team document ID.
 * @param {string} hackathonId - The hackathon ID.
 * @param {string} userId - The UID of the user leaving the team.
 */



export const leaveTeam = async (teamId, hackathonId, userId) => {
  const teamRef = doc(db, "teams", teamId);
  const userRef = doc(db, "users1", userId);
  await runTransaction(db, async (transaction) => {
    const teamDoc = await transaction.get(teamRef);
    if (!teamDoc.exists()) {
      throw new Error("Team does not exist.");
    }
    // ...
  });
  try {
    await runTransaction(db, async (transaction) => {
      const teamDoc = await transaction.get(teamRef);
      if (!teamDoc.exists()) {
        throw new Error("Team does not exist.");
      }
      const teamData = teamDoc.data();
      if (teamData.createdBy === userId) {
        throw new Error("Team creator cannot leave the team. Delete the team instead.");
      }
      transaction.update(teamRef, {
        members: arrayRemove(userId)
      });
      transaction.update(userRef, {
        [`hackathonParticipation.${hackathonId}`]: deleteField()
      });
    });
  } catch (error) {
    console.error("Error leaving team: ", error);
    throw error;
  }
};



// In your src/context/firebase.jsx

// ... existing imports and initialization ...

// Read admin UIDs from environment variables (comma-separated)
const ADMIN_UIDS = import.meta.env.VITE_ADMIN_UIDS || "";
const ADMIN_IDS = ADMIN_UIDS.split(",").map(id => id.trim()).filter(Boolean);

//////////////////////////
// Join Request & Notification Functions (Updated)
//////////////////////////

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

/**
 * Mark yourself interested under hackathons/{hackathonId}/users/{uid}
 */
export async function expressInterest(hackathonId, uid, name) {
  const ref = doc(db, "hackathons", hackathonId, "users", uid);
  await setDoc(
    ref,
    { interested: true, name, ts: serverTimestamp() },
    { merge: true }
  );
}

/**
 * List everyone who clicked “Interested”
 */
export async function fetchInterestedUsers(hackathonId) {
  const col = collection(db, "hackathons", hackathonId, "users");
  const q = query(col, where("interested", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}

/**
 * Send a team‑invite notification
 */
export async function sendTeamInvite(hackathonId, teamId, uid, senderName) {
  const ref = doc(db, "hackathons", hackathonId, "users", uid);
  const inviteObj = { teamId, senderName, status: "pending" };
  await updateDoc(ref, { invites: arrayUnion(inviteObj) });

  // 2) write a notification record for UIs or Cloud Functions
  await addDoc(
    collection(db, "notifications"),
    {
      type:        "team_invite",
      hackathonId,
      teamId,
      recipientId: uid,
      senderName,
      status:      "pending",
      createdAt:   serverTimestamp(),
      message:     `${senderName} invited you to join team ${teamId}.`
    }
  );
}

/**
 * Fetch your pending invites
 */
export async function fetchUserInvites(hackathonId, uid) {
  const ref = doc(db, "hackathons", hackathonId, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().invites || [] : [];
}

/**
 * Accept or decline an invite (and on accept, auto‑join + clear interest)
 */
export async function respondToInvite(hackathonId, teamId, uid, status) {
  const ref = doc(db, "hackathons", hackathonId, "users", uid);

  // remove old pending
  await updateDoc(ref, {
    invites: arrayRemove({ teamId, senderName: "", status: "pending" })
  });

  // add updated status
  await updateDoc(ref, {
    invites: arrayUnion({ teamId, senderName: "", status })
  });

  if (status === "accepted") {
    await __joinTeam(teamId, hackathonId, uid);
    await updateDoc(ref, { interested: false });
  }
}

/**
 * Override joinTeam globally so it clears the interested flag too
 */
export async function joinTeam(teamId, hackathonId, uid) {
  await __joinTeam(teamId, hackathonId, uid);
  const ref = doc(db, "hackathons", hackathonId, "users", uid);
  await deleteDoc(ref);
}