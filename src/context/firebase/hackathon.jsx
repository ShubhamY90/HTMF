// src/firebase/hackathon.js
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

export const addHackathonData = async ({ title, description, date, location, type, imageUrl, deadline }) => {
  const docRef = await addDoc(collection(db, "hackathons"), {
    title,
    description,
    date,
    location,
    type: type || null,
    imageUrl: imageUrl || null,
    deadline: deadline || null,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const fetchHackathons = async () => {
  const querySnapshot = await getDocs(collection(db, "hackathons"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
