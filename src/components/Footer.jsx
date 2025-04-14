// Footer.jsx
import React from 'react';
import {
    FaTelegramPlane,
    FaDiscord,
    FaGithub,
    FaLinkedin,
    FaTwitter,
} from "react-icons/fa";
import { SiDevpost } from "react-icons/si";

export default function Footer() {
    return (
        <footer className="bg-[#FAF6E9] text-gray-700 mt-20">
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                <div>
                    <h2 className="text-3xl font-bold">
                        Great ideas need great teams.<br />
                        <span className="text-blue-500">Find your people</span>, spark innovation,<br />
                        and build the future <span className="text-orange-400">together</span>.
                    </h2>

                    <div className="flex space-x-4 mt-4 text-xl">
                        <a href="#"><FaTelegramPlane /></a>
                        <a href="#"><FaTwitter /></a>
                        <a href="#"><FaDiscord /></a>
                        <a href="#"><SiDevpost /></a>
                        <a href="#"><FaGithub /></a>
                        <a href="#"><FaLinkedin /></a>
                    </div>
                </div>

                <div>
                    <h4 className="uppercase font-semibold mb-2">Features</h4>
                    <ul className="space-y-2">
                        <li><a href="#">Skill Matching</a></li>
                        <li><a href="#">Team Recommendations</a></li>
                        <li><a href="#">Hackathons List</a></li>
                        <li><a href="#">Project Showcase</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="uppercase font-semibold mb-2">Community</h4>
                    <ul className="space-y-2">
                        <li><a href="#">Join Discord</a></li>
                        <li><a href="#">Find Teams</a></li>
                        <li><a href="#">Code of Conduct</a></li>
                        <li><a href="#">Contribute</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="uppercase font-semibold mb-2">Support</h4>
                    <ul className="space-y-2">
                        <li><a href="#">Contact Us</a></li>
                        <li><a href="#">FAQs</a></li>
                        <li><a href="#">Submit Feedback</a></li>
                        <li><a href="#">Status</a></li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-gray-300 mt-6 py-4 px-6 text-sm flex justify-between items-center flex-wrap">
                <span className="font-bold text-blue-600">TeammateFinder</span>
                <p className="text-gray-500">
                    ©️ All rights reserved 2025
                </p>
            </div>
        </footer>
    );
}