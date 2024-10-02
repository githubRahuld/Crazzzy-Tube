import React, { useState } from "react";

const VideoDescription = ({ videoData }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Function to toggle the description view
  const toggleDescription = () => {
    setShowFullDescription((prev) => !prev);
  };

  // Limit the description length
  const maxLength = 100; // Set the max length you want to display
  const isLongDescription = videoData.description.length > maxLength;

  return (
    <div className="mt-4 border-t border-gray-300 flex items-start pt-4">
      <p
        className="text-gray-700 text-lg font-light leading-relaxed tracking-wide"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {showFullDescription
          ? videoData.description
          : `${videoData.description.substring(0, maxLength)}...`}
      </p>

      {/* Show "More" button if the description is long */}
      {isLongDescription && (
        <button
          onClick={toggleDescription}
          className="text-blue-500 hover:underline ml-2"
        >
          {showFullDescription ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
};

export default VideoDescription;
