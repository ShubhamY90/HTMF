// src/firebase/user.js
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./config";

export const fetchUserProfile = async (uid) => {
  const docSnap = await getDoc(doc(db, "users1", uid));
  if (!docSnap.exists()) {
    throw new Error("User profile not found");
  }
  return docSnap.data();
};

export const updateUserProfile = async (uid, updatedData) => {
  const userRef = doc(db, "users1", uid);
  await updateDoc(userRef, updatedData);
};
