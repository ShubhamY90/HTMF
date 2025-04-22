import React, { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addHackathonData } from "../context/firebase";

const AddHackathon = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // The hackathon scheduled date will be set automatically on form submit.
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState(''); // Deadline input for date and time
  const [type, setType] = useState(''); // New hackathon type field
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      // Set the hackathon date automatically (current timestamp)
      const hackathonDate = new Date().toISOString();

      let imageUrl = null;
      if (imageFile) {
        // Use Firebase Storage to upload the image
        const storage = getStorage();
        // Normalize file name to avoid issues with spaces
        const normalizedFileName = imageFile.name.replace(/\s+/g, "_");
        const fileRef = ref(storage, `hackathonImages/${Date.now()}_${normalizedFileName}`);
        await uploadBytes(fileRef, imageFile);
        imageUrl = await getDownloadURL(fileRef);
      }

      // Save hackathon data (including the auto-set "date", imageUrl, deadline, and type) to Firestore.
      await addHackathonData({
        title,
        description,
        date: hackathonDate,
        location,
        deadline,     // expected to be in a valid datetime-local format string
        type,         // hackathon type field
        imageUrl,     // will be null if no image was uploaded
      });
      
      setMessage("Hackathon added successfully!");
      // Clear the form fields.
      setTitle('');
      setDescription('');
      setLocation('');
      setDeadline('');
      setType('');
      setImageFile(null);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      console.error("Submission error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-[850px] p-10 rounded-lg overflow-hidden shadow-[0_0_20px_#7e22ce] border-2 border-purple-700 flex flex-col bg-black">
        <h2 className="text-4xl font-extrabold text-white mb-6 text-center">
          Add Hackathon
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Hackathon Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded bg-[#1f1f1f] text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-600"
            required
          />
          <textarea
            placeholder="Hackathon Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded bg-[#1f1f1f] text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-600"
            required
          />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-3 rounded bg-[#1f1f1f] text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-600"
            required
          />

          {/* Hackathon Type input */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-200">Hackathon Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-3 rounded bg-[#1f1f1f] text-gray-100 outline-none focus:ring-2 focus:ring-purple-600"
              required
            >
              <option value="" disabled>Select type</option>
              <option value="Web Development">Web Development</option>
              <option value="Game Development">Game Development</option>
              <option value="ML">Machine Learning</option>
              <option value="Data Science">Data Science</option>
              <option value="AI">Artificial Intelligence</option>
              <option value="Web3">Web3</option>
              <option value="Blockchain">Blockchain</option>
              <option value="IoT">IoT</option>
              <option value="Mobile">Mobile Development</option>
              <option value="Cloud">Cloud Computing</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Deadline input */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-200">Deadline (Date &amp; Time)</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full p-3 rounded bg-[#1f1f1f] text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>

          {/* Custom Image Upload Section */}
          <div className="w-full">
            {imageFile ? (
              <div className="flex items-center justify-between p-3 border-2 border-dashed border-gray-400 rounded bg-gray-100">
                <span className="text-gray-700 truncate">{imageFile.name}</span>
                <button
                  type="button"
                  onClick={() => setImageFile(null)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-400 p-4 rounded hover:border-gray-500">
                <span className="text-gray-500">Choose Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files[0] && setImageFile(e.target.files[0])
                  }
                  className="hidden"
                />
              </label>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded font-semibold hover:opacity-90 transition"
          >
            Add Hackathon
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-white">{message}</p>
        )}
      </div>
    </div>
  );
};

export default AddHackathon;
