import React from 'react';
import { FaFlask, FaStar } from 'react-icons/fa';
import { AiOutlineBug } from 'react-icons/ai';

const Beta = () => {
  return (
    <div className="max-w-4xl mx-auto bg-yellow-100 border border-yellow-300 rounded-lg p-6 shadow-lg h-96 flex items-center">
      <div className="flex items-center justify-between w-full text-yellow-800">
        {/* Left section: Icon + Text */}
        <div className="flex items-center space-x-4">
          <FaFlask className="text-5xl text-yellow-600" />
          <div>
            <p className="text-2xl font-semibold">
              This feature is currently in <span className="uppercase">Beta</span>
            </p>
            <p className="text-lg text-yellow-700">
              We’re still refining it — your feedback makes it better!
            </p>
          </div>
        </div>
        {/* Right section: Star + Bug icons */}
        <div className="flex space-x-4">
          <FaStar className="text-4xl text-yellow-500" />
          <AiOutlineBug className="text-4xl text-red-500" />
        </div>
      </div>
    </div>
  );
};
export default Beta;