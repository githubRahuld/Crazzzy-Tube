import React from "react";
import { useNavigate } from "react-router-dom";
import Skeleten from "./Skeleten";
import { Link } from "react-router-dom";

// Helper function to convert `createdAt` to relative time
const getRelativeTime = (createdAt) => {
  const now = new Date();
  const createdDate = new Date(createdAt);
  const diffMs = now - createdDate; // Difference in milliseconds
  const diffMins = Math.floor(diffMs / (1000 * 60)); // Convert to minutes

  if (diffMins < 60) {
    return `${diffMins} minutes ago`;
  } else if (diffMins < 1440) {
    // 60 * 24 minutes in a day
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} hours ago`;
  } else {
    const diffDays = Math.floor(diffMins / (60 * 24));
    return `${diffDays} days ago`;
  }
};

// Helper function to format `duration` in hours, minutes, and seconds
const formatDuration = (durationInSeconds) => {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = (durationInSeconds % 60).toFixed(2);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

const VideoCard = ({ video }) => {
  const navigate = useNavigate();
  const username = video.owner?.username || video.channel?.username;
  const avatar = video.owner?.avatar || video.channel?.avatar;
  console.log(username, avatar);

  const handleClick = () => {
    navigate(`/videos/${video._id}`);
  };
  return (
    <>
      {!video ? (
        <Skeleten />
      ) : (
        // Link to the video player page
        <div className="bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 w-90 font-sans cursor-pointer">
          <div className="relative">
            {/* Video Thumbnail */}
            <img
              src={video.thumbnail}
              alt={video.title}
              onClick={handleClick}
              className="w-full h-48 object-cover"
            />
            {/* Video Duration */}
            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 rounded-sm">
              {formatDuration(video.duration)} {/* Formatted duration */}
            </span>
          </div>

          {/* Video Info */}
          <div className="flex p-3">
            {/* Channel Icon */}
            <Link to={`/users/dashboard/${username}`}>
              <img
                src={avatar}
                alt={username}
                className="w-10 h-10 rounded-full mr-3"
              />
            </Link>
            <div className="flex items-start flex-col">
              {/* Video Title */}
              <h3 className="font-bold leading-tight text-gray-900 text-lg">
                {video.title}
              </h3>

              {/* Channel Name */}
              <p className="text-sm text-gray-500">{username}</p>
              {/* Views and Timestamp */}
              <p className="text-xs text-gray-400">
                {video.views} views • {getRelativeTime(video.createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoCard;
