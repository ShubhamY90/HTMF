// src/firebase/teams.js
import {
    doc,
    getDoc,
    getDocs,
    updateDoc,
    collection,
    query,
    where,
    addDoc,
    runTransaction,
    serverTimestamp,
    arrayUnion,
    deleteDoc,
    arrayRemove,
    deleteField,
    writeBatch
  } from "firebase/firestore";
  import { db } from "./config";
  
  export const createTeam = async (hackathonId, userId, teamName, creatorName) => {
    const teamsQuery = query(
      collection(db, "teams"),
      where("hackathonId", "==", hackathonId),
      where("teamName", "==", teamName)
    );
    const querySnapshot = await getDocs(teamsQuery);
    if (!querySnapshot.empty) {
      throw new Error("A team with this name already exists.");
    }
  
    const teamData = {
      hackathonId,
      createdBy: userId,
      createdByName: creatorName,
      teamName,
      members: [userId],
      maxMembers: 4,
      teamCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdAt: serverTimestamp(),
    };
  
    const teamDocRef = await addDoc(collection(db, "teams"), teamData);
    await updateDoc(doc(db, "users1", userId), {
      [`hackathonParticipation.${hackathonId}`]: {
        teamId: teamDocRef.id,
        joinedAt: serverTimestamp(),
      },
    });
  
    return teamDocRef.id;
  };
  
  export const getJoinableTeamsForHackathon = async (hackathonId) => {
    const teamsQuery = query(collection(db, "teams"), where("hackathonId", "==", hackathonId));
    const snapshot = await getDocs(teamsQuery);
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(team => team.members.length < team.maxMembers);
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

  export async function joinTeam(teamId, hackathonId, uid) {
    await __joinTeam(teamId, hackathonId, uid);
    const ref = doc(db, "hackathons", hackathonId, "users", uid);
    await deleteDoc(ref);
  }
  
  export const fetchUserHackathonParticipation = async (hackathonId, userId) => {
    const docSnap = await getDoc(doc(db, "users1", userId));
    if (!docSnap.exists()) throw new Error("User not found.");
    return docSnap.data().hackathonParticipation?.[hackathonId] || null;
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
  // Dummy notification function - replace with your actual implementation
const sendNotification = async (recipientId, message, type = "info") => {
  const notifRef = collection(db, "notifications");
  await addDoc(notifRef, {
    recipientId,
    message,
    type,
    status: "unread",
    createdAt: serverTimestamp(),
  });
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

  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) throw new Error("User does not exist");
      
      const teamDoc = await transaction.get(teamRef);
      if (!teamDoc.exists()) {
        // Team doesn't exist - just clear participation anyway
        transaction.update(userRef, {
          [`hackathonParticipation.${hackathonId}`]: deleteField(),
        });
        return;
      }

      const teamData = teamDoc.data();

      if (teamData.createdBy === userId) {
        throw new Error("Team creator cannot leave the team. Delete the team instead.");
      }

      // Remove user from team members array
      transaction.update(teamRef, {
        members: arrayRemove(userId),
      });

      // Remove user's participation in this hackathon (the entire entry)
      transaction.update(userRef, {
        [`hackathonParticipation.${hackathonId}`]: deleteField(),
      });
    });
  } catch (error) {
    console.error("Error leaving team: ", error);
    throw error;
  }
};

// Assume leaveTeam is imported here or defined above
// import { leaveTeam } from "./auth" or wherever


export const deleteTeam = async (teamId, hackathonId, userId, hackathonName) => {
  const teamRef = doc(db, "teams", teamId);

  try {
    const teamDoc = await getDoc(teamRef);
    if (!teamDoc.exists()) throw new Error("Team does not exist.");

    const teamData = teamDoc.data();
    if (teamData.createdBy !== userId) {
      throw new Error("Only the team creator can delete the team.");
    }

    const leaderName = teamData.createdByName || "Team Leader";
    const teamName = teamData.teamName || "Your Team";

    const usersRef = collection(db, "users1");
    const usersSnapshot = await getDocs(usersRef);
    const batch = writeBatch(db);

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      // If user has participated in this hackathon, delete the entire hackathonParticipation entry
      if (userData.hackathonParticipation?.[hackathonId]) {
        batch.update(userDoc.ref, {
          [`hackathonParticipation.${hackathonId}`]: deleteField(),
        });

        sendNotification(userDoc.id, `${leaderName} has deleted the Team "${teamName}" for the hackathon "${hackathonName}".`, "team_deleted");
      }
    }

    batch.delete(teamRef);
    await batch.commit();

  } catch (error) {
    console.error("Error deleting team: ", error);
    throw error;
  }
};

  
  
  
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