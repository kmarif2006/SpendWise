import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import DisplayColabs from '../components/colabs/DisplayColabs';
import ColabForm from '../components/colabs/ColabAdd';
import Spinner from '../components/common/Spinner';

function Colab() {
  const [isAddColabOpen, setIsAddColabOpen] = useState(false);
  const { colabs, isLoading } = useSelector((state) => state.colabs);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Collaborations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your shared expenses with friends and family
          </p>
        </div>
        <button
          onClick={() => setIsAddColabOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg 
                     shadow-lg hover:shadow-xl transition duration-300 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>New Collaboration</span>
        </button>
      </div>

      {colabs?.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            No collaborations yet. Start by creating one!
          </div>
        </div>
      ) : (
        <DisplayColabs colabs={colabs} />
      )}

      {isAddColabOpen && (
        <ColabForm onClose={() => setIsAddColabOpen(false)} />
      )}
    </div>
  );
}

export default Colab;
