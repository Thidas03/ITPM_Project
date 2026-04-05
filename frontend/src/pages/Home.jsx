import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-teal-500 selection:text-white">
      {/* Navigation Bar */}
      <nav className="fixed w-full z-50 top-0 start-0 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4 sm:p-6">
          <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse group">
            <span className="self-center text-3xl font-extrabold whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500 tracking-tight group-hover:from-teal-300 group-hover:to-indigo-400 transition-all duration-300">
              STUEDU
            </span>
          </Link>
          <div className="flex md:order-2 space-x-3 md:space-x-4 rtl:space-x-reverse">
            <Link
              to="/login"
              className="text-gray-300 hover:text-white font-medium rounded-full text-sm px-5 py-2.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-700"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 font-medium rounded-full text-sm px-6 py-2.5 shadow-lg shadow-teal-500/20 transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-teal-500/50"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex items-center justify-center min-h-screen flex-col">
        {/* Decorative background blurs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 px-4 mx-auto max-w-screen-xl text-center">
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight leading-none text-white md:text-6xl lg:text-7xl">
            The smart peer <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-indigo-400 to-purple-500">
              tutoring platform
            </span>
          </h1>
          <p className="mb-10 text-lg font-normal text-gray-400 lg:text-xl sm:px-16 lg:px-48 max-w-3xl mx-auto">
            Connect with peers, book interactive sessions, and excel in your studies. Join a thriving community of learners and educators today.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-6">
            {/* These buttons are kept here as alternate entry points, per previous UI */}
            <Link
              to="/dashboard/tutor"
              className="inline-flex justify-center items-center py-3.5 px-8 text-base font-semibold text-center text-white rounded-full bg-gray-800 border border-gray-700 hover:bg-gray-700 focus:ring-4 focus:ring-gray-800 transition-all duration-300 shadow-xl"
            >
              Tutor Dashboard
            </Link>
            <Link
              to="/dashboard/student"
              className="inline-flex justify-center items-center py-3.5 px-8 text-base font-semibold text-center text-white rounded-full bg-gray-800 border border-gray-700 hover:bg-gray-700 focus:ring-4 focus:ring-gray-800 transition-all duration-300 shadow-xl"
            >
              Student Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
