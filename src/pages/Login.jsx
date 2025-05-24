// src/pages/Login.jsx
import React, { useState } from "react";
import { FaUser, FaLock, FaUniversity } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { signUpUser, loginUser } from "../context/firebase/auth";

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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    <div>
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-[850px] h-[500px] rounded-lg overflow-hidden shadow-[0_0_20px_#7e22ce] border-2 border-purple-700 flex bg-black">
          {isSignup ? (
            <>
              {/* Left Signup Panel with Image */}
              <motion.div
                className="w-1/2"
                variants={leftSideVariants}
                initial="initial"
                whileHover="hover"
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div className="h-full bg-gradient-to-tr from-[#2f0347] to-red-700 relative flex flex-col items-start justify-center pl-6">
                  <img
                    src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbHF4bWFnaDdoMXQ0ZGR3bnE0OXd4aWNsdWdtcWVwZDlpaXR5azRzeCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MOWPkhRAUbR7i/giphy.gif"
                    alt="Signup visual"
                    className="absolute top-0 left-0 w-full h-full object-cover opacity-10"
                  />
                  <h2 className="text-4xl font-extrabold text-white mb-3 z-10">Get Started!</h2>
                  <p className="text-gray-200 max-w-xs z-10">
                    Build your profile and connect with brilliant hackers across campuses.
                  </p>
                  <motion.p
                    variants={extraTextVariants}
                    className="text-gray-200 max-w-xs mt-2 z-10"
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    Join events, build teams, and hack your way to greatness.
                  </motion.p>
                </div>
              </motion.div>

              {/* Right Signup Form */}
              <div className="w-1/2 bg-black flex flex-col justify-center px-10">
                <h2 className="text-3xl text-white font-bold mb-3">Create Account</h2>
                <form onSubmit={handleSignup}>
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
                  <button
                    type="submit"
                    className="w-[300px] py-2 bg-gradient-to-r from-[#2f0347] to-red-700 text-white rounded font-semibold hover:opacity-90 transition"
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
              {/* Left Login Form */}
              <div className="w-1/2 bg-black flex flex-col justify-center px-10">
                <h2 className="text-3xl text-white font-bold mb-3">Welcome Back</h2>
                <form onSubmit={handleLogin}>
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
                  <button
                    type="submit"
                    className="w-[300px] py-2 bg-gradient-to-r from-[#2f0347] to-red-700 text-white rounded font-semibold hover:opacity-90 transition"
                  >
                    Login
                  </button>
                </form>
                {message && <p className="mt-4 text-left text-sm text-white">{message}</p>}
                <p className="mt-4 text-gray-400 text-sm">
                  Don’t have an account?{" "}
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

              {/* Right Login Panel with Image */}
              <motion.div
                className="w-1/2"
                variants={rightSideVariants}
                initial="initial"
                whileHover="hover"
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div className="h-full bg-gradient-to-tr from-[#2f0347] to-red-700 relative flex flex-col items-end justify-center pr-6">
                  <img
                    src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmdhaDQxemN2d204MmE1dTFvNDdzNnJ1ZHljd3BmY3psb2xiOGVmOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/HuGCwDXj4nQnS/giphy.gif"
                    alt="Login visual"
                    className="absolute top-0 left-0 w-full h-full object-cover opacity-10"
                  />
                  <h2 className="text-4xl font-extrabold text-white mb-3 z-10">Team Up Fast!</h2>
                  <p className="text-gray-200 max-w-xs z-10">
                    Find ideal teammates for your next hackathon based on skills and interests.
                  </p>
                  <motion.p
                    variants={extraTextVariants}
                    className="text-gray-200 max-w-xs mt-2 z-10"
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    Work together, win together. Build projects that shine.
                  </motion.p>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>

      <a
        href="https://github.com/ShubhamY90/HTMF.git"
        className="text-black text-2xl font-medium underline hover:text-green-500 transition my-4 flex justify-center"
      >
        Repository Link (GitHub)
      </a>
    </div>
  );
}

export default Login;
