// src/firebase/auth.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "./config";

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
    role: "member",
    createdAt: serverTimestamp(),
    mobileNumber: "",
    githubId: "",
    experienceLevel: "",
    skills: [],
    uid: user.uid,
  });
  return user;
};

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
  return { uid: user.uid, ...profileDocSnap.data() };
};

export const logoutUser = async () => signOut(auth);
export { db, auth };