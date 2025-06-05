import React, { useState } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showEmailCopiedMessage, setShowEmailCopiedMessage] = useState(false);
  const contactEmail = "vellora@email.com";

  const handleContactClick = (e) => {
    e.preventDefault();
    setShowContactModal(true);
    setShowEmailCopiedMessage(false);
  };

  const handleCloseModal = () => {
    setShowContactModal(false);
  };

  const copyEmailToClipboard = () => {
    const el = document.createElement("textarea");
    el.value = contactEmail;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    setShowEmailCopiedMessage(true);
    setTimeout(() => setShowEmailCopiedMessage(false), 2000);
  };

  return (
    <footer className="bg-neutral-100 py-6 text-center shadow-inner mt-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-gray-700 font-body text-lg">
          © 2025 Vellora. All rights reserved.
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-4 sm:gap-6 font-headings text-lg">
          <Link
            to="/about-us"
            className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
          >
            About Us
          </Link>
          <button
            onClick={handleContactClick}
            className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
          >
            Contact
          </button>
          <Link
            to="/policy"
            className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
          >
            Privacy Policy
          </Link>
        </div>
      </div>

      {showContactModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl max-w-sm w-full mx-auto transform scale-95 animate-scale-up">
            <h3 className="font-headings text-xl sm:text-2xl font-bold text-gray-800 mb-4">
              Contact Us
            </h3>
            <p className="font-body text-gray-700 mb-4 text-base sm:text-lg">
              You can reach us at:
            </p>
            <p className="font-body text-blue-600 text-lg sm:text-xl font-semibold mb-6 break-words">
              {contactEmail}
            </p>
            {showEmailCopiedMessage && (
              <p className="text-green-600 font-body text-sm mb-3 animate-fade-in-out">
                Email copied to clipboard!
              </p>
            )}
            <div className="flex flex-col space-y-3">
              <Link
                href={`mailto:${contactEmail}`}
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200 font-medium font-body text-base sm:text-lg text-center"
                onClick={handleCloseModal}
              >
                Open Mail Client
              </Link>
              <button
                onClick={copyEmailToClipboard}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors duration-200 font-medium font-body text-base sm:text-lg"
              >
                Copy Email
              </button>
              <button
                onClick={handleCloseModal}
                className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors duration-200 font-medium font-body text-base sm:text-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
