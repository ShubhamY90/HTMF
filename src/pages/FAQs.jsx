// src/pages/FAQs.jsx
import React, { useState } from 'react';
import { sendContactNotification } from '../context/firebase';

const FAQs = () => {
  // State to manage the contact form.
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  // Handle form field changes.
  const handleInputChange = (e) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  // Handle form submission.
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendContactNotification(contactForm);
      setSubmitted(true);
      // Optionally, clear the form:
      setContactForm({ name: '', email: '', message: '' });
    } catch (error) {
      console.error("Error sending contact form:", error);
      alert("There was an error sending your message. Please try again.");
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-100">
      <div className="container mx-auto px-4 py-12">
        {/* FAQ Section */}
        <h1 className="text-4xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-semibold mb-2">What is Hackathon Teammate Finder?</h2>
            <p className="text-gray-700">
              Hackathon Teammate Finder is a platform that helps you find teammates for hackathons,
              join teams, or create your own team for the event.
            </p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-semibold mb-2">How do I join a team?</h2>
            <p className="text-gray-700">
              After signing in, you can browse available hackathons and teams and send a join request
              to a team leader or join using a unique team code.
            </p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-semibold mb-2">Can I create my own team?</h2>
            <p className="text-gray-700">
              Yes! You can create your own team and invite others using your unique team code.
            </p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-semibold mb-2">How do join requests work?</h2>
            <p className="text-gray-700">
              When you request to join a team, the team leader receives a notification and can approve or decline your request.
            </p>
          </div>
          {/* Add more FAQ items as needed */}
        </div>

        {/* Contact Facility Section Below FAQs */}
        <div className="mt-12 bg-white p-8 rounded shadow text-center">
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-gray-700 mb-6">
            If you need further help or have additional questions, please fill out the form below.
          </p>

          {submitted ? (
            <div className="text-green-600 font-semibold">
              Thank you for contacting us. We have received your message.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
              <div>
                <input
                  type="text"
                  name="name"
                  value={contactForm.name}
                  onChange={handleInputChange}
                  placeholder="Your Name"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-200"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleInputChange}
                  placeholder="Your Email"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-200"
                  required
                />
              </div>
              <div>
                <textarea
                  name="message"
                  value={contactForm.message}
                  onChange={handleInputChange}
                  placeholder="Your Message"
                  rows="4"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-200"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-3 px-6 bg-green-500 text-white font-semibold rounded hover:bg-green-600 transition"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FAQs;
