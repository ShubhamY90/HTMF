// src/pages/Login.jsx
import React, { useState } from "react";
import { FaUser, FaLock, FaUniversity } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { signUpUser, loginUser } from "../context/firebase";

const rightSideVariants = {
  initial: { clipPath: "polygon(5% 0, 100% 0, 100% 100%, 25% 100%)" },
  hover: { clipPath: "polygon(5% 0, 100% 0, 100% 100%, 5% 100%)" },
};

const leftSideVariants = {
  initial: { clipPath: "polygon(0 0, 75% 0, 95% 100%, 0 100%)" },
  hover: { clipPath: "polygon(0 0, 95% 0, 95% 100%, 0 100%)" },
};

const extraTextVariants = {
  initial: { opacity: 0 },
  hover: { opacity: 1 },
};

function Login() {
  const [isSignup, setIsSignup] = useState(false);

  // Login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Signup states
  const [name, setName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const userData = await loginUser(email, password);
      localStorage.setItem("userRole", userData.role);
      setMessage("Login successful!");
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      setMessage(`Login failed: ${error.message}`);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    if (signupPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    try {
      await signUpUser({
        name,
        collegeName,
        email: signupEmail,
        password: signupPassword,
      });
      setMessage("Signup successful! Please verify your email and then login.");
      setIsSignup(false);
    } catch (error) {
      console.error("Signup error:", error);
      setMessage(`Signup failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-[850px] h-[500px] rounded-lg overflow-hidden shadow-[0_0_20px_#7e22ce] border-2 border-purple-700 flex bg-black">
        {isSignup ? (
          <>
            {/* Animated Polygon on Left for Signup */}
            <motion.div
              className="w-1/2"
              variants={leftSideVariants}
              initial="initial"
              whileHover="hover"
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <div className="h-full bg-gradient-to-tr from-[#2f0347] to-purple-700 relative flex flex-col items-start justify-center pl-6">
                <h2 className="text-4xl font-extrabold text-white mb-3">JOIN US!</h2>
                <p className="text-gray-200 max-w-xs">
                  Welcome! Fill in your details to create an account.
                </p>
                <motion.p
                  variants={extraTextVariants}
                  className="text-gray-200 max-w-xs mt-2"
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  Enjoy the exclusive community features on our platform.
                </motion.p>
              </div>
            </motion.div>
            {/* Signup Form on Right */}
            <div className="w-1/2 bg-black flex flex-col justify-center px-10">
              <h2 className="text-3xl text-white font-bold mb-3">Sign Up</h2>
              <form onSubmit={handleSignup}>
                {/* Name Field */}
                <div className="relative mb-4">
                  <FaUser className="absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Name"
                    className="w-[300px] pl-9 pr-3 py-2 rounded bg-[#1f1f1f] text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-600"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                {/* College Name Field */}
                <div className="relative mb-4">
                  <FaUniversity className="absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="College Name"
                    className="w-[300px] pl-9 pr-3 py-2 rounded bg-[#1f1f1f] text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-600"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    required
                  />
                </div>
                {/* Email Field */}
                <div className="relative mb-4">
                  <FaUser className="absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-[300px] pl-9 pr-3 py-2 rounded bg-[#1f1f1f] text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-600"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
                {/* Password Field */}
                <div className="relative mb-4">
                  <FaLock className="absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-[300px] pl-9 pr-3 py-2 rounded bg-[#1f1f1f] text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-600"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>
                {/* Confirm Password Field */}
                <div className="relative mb-6">
                  <FaLock className="absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    className="w-[300px] pl-9 pr-3 py-2 rounded bg-[#1f1f1f] text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-600"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {/* Signup Button */}
                <button
                  type="submit"
                  className="w-[300px] py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded font-semibold hover:opacity-90 transition"
                >
                  Sign Up
                </button>
              </form>
              {message && <p className="mt-4 text-left text-sm text-white">{message}</p>}
              <p className="mt-4 text-gray-400 text-sm">
                Already have an account?{" "}
                <span
                  className="underline cursor-pointer"
                  onClick={() => {
                    setIsSignup(false);
                    setMessage("");
                  }}
                >
                  Login
                </span>
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Login Form on Left */}
            <div className="w-1/2 bg-black flex flex-col justify-center px-10">
              <h2 className="text-3xl text-white font-bold mb-3">Login</h2>
              <form onSubmit={handleLogin}>
                {/* Email Field */}
                <div className="relative mb-4">
                  <FaUser className="absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-[300px] pl-9 pr-3 py-2 rounded bg-[#1f1f1f] text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-600"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {/* Password Field */}
                <div className="relative mb-6">
                  <FaLock className="absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-[300px] pl-9 pr-3 py-2 rounded bg-[#1f1f1f] text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-600"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {/* Login Button */}
                <button
                  type="submit"
                  className="w-[300px] py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded font-semibold hover:opacity-90 transition"
                >
                  Login
                </button>
              </form>
              {message && <p className="mt-4 text-left text-sm text-white">{message}</p>}
              <p className="mt-4 text-gray-400 text-sm">
                Don't have an account?{" "}
                <span
                  className="underline cursor-pointer"
                  onClick={() => {
                    setIsSignup(true);
                    setMessage("");
                  }}
                >
                  Sign Up
                </span>
              </p>
            </div>
            {/* Animated Polygon on Right for Login */}
            <motion.div
              className="w-1/2"
              variants={rightSideVariants}
              initial="initial"
              whileHover="hover"
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <div className="h-full bg-gradient-to-tr from-[#2f0347] to-purple-700 relative flex flex-col items-end justify-center pr-6">
                <h2 className="text-4xl font-extrabold text-white mb-3">
                  WELCOME BACK!
                </h2>
                <p className="text-gray-200 max-w-xs">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
                  suscipit arcu non lobortis vulputate.
                </p>
                <motion.p
                  variants={extraTextVariants}
                  className="text-gray-200 max-w-xs mt-2"
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  Here’s more detailed information that appears upon hovering.
                </motion.p>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
