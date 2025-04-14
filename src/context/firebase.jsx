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

export { app, db, auth, storage };

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
 * Add a new hackathon document to Firestore ("hackathons" collection).
 */
export const addHackathonData = async ({ title, description, date, location, imageUrl, deadline }) => {
  const docRef = await addDoc(collection(db, "hackathons"), {
    title,
    description,
    date,
    location,
    imageUrl: imageUrl || null,
    deadline: deadline || null,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
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
