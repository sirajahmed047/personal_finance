import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t py-2">
      <div className="container mx-auto px-2">
        <div className="flex flex-col items-center">
          <p className="text-xs text-gray-500 mb-1">
            © {new Date().getFullYear()} Finance Dashboard
          </p>
          <div className="flex justify-center space-x-4">
            <button className="text-gray-500 hover:text-primary focus:outline-none" title="Privacy Policy">
              <span className="text-xs">🔒</span>
            </button>
            <button className="text-gray-500 hover:text-primary focus:outline-none" title="Terms of Service">
              <span className="text-xs">📜</span>
            </button>
            <button className="text-gray-500 hover:text-primary focus:outline-none" title="Contact">
              <span className="text-xs">✉️</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
