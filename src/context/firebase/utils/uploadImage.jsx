import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadHackathonImage = async (imageFile) => {
  if (!imageFile) return null;

  const storage = getStorage();
  const normalizedFileName = imageFile.name.replace(/\s+/g, "_");
  const fileRef = ref(storage, `hackathonImages/${Date.now()}_${normalizedFileName}`);

  await uploadBytes(fileRef, imageFile);
  return await getDownloadURL(fileRef);
};
