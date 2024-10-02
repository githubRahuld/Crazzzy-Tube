import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Skeleten from "./Skeleten";
import { Link } from "react-router-dom";
import { FiMoreVertical } from "react-icons/fi";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import axios from "axios";

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
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const [menuOpen, setMenuOpen] = useState(false);
  const [deletedMsg, setDeletedMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const username = video?.owner?.username || video?.channel?.username;
  const avatar = video?.owner?.avatar || video?.channel?.avatar;

  const userData = useSelector((state) => state.auth.user);

  // Check if current route is dashboard and the user is the owner
  const isDashboardPage = location.pathname.startsWith("/users/dashboard");
  const isOwner = userData && userData.user._id === video?.channel?._id;

  const handleClick = () => {
    navigate(`/videos/${video._id}`);
  };

  // 3 dot button
  const handleMenuToggle = () => {
    setMenuOpen((prev) => !prev); // Toggle menu visibility
  };

  const handleDelete = async () => {
    setLoading(true);
    console.log("Delete video", video._id); // Add your delete video logic here

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this video?"
    );
    console.log(confirmDelete);

    if (confirmDelete) {
      await axios
        .delete(`${baseUrl}/api/v1/videos/${video._id}`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        })
        .then((res) => {
          alert(`${video.title} deleted Suncessfully`);
          console.log(res.data);
          setLoading(false);
          setDeletedMsg(`${video.title} sucessfully deleted`);
          window.location.reload();
        })
        .catch((err) => {
          setLoading(false);
          setDeletedMsg("Something went wrong, Please try again");
          console.log("Something went wrong, Please try again :", err);
        });
    }
    setMenuOpen(false);
  };
  return (
    <>
      {loading ? (
        <Skeleten />
      ) : (
        <>
          {deletedMsg && (
            <div className="text-red-600 border border-pink-50 p-3 rounded-lg bg-red-100 mb-2">
              {deletedMsg}
            </div>
          )}
          <div className="relative">
            {/* Video Thumbnail */}
            <img
              src={video?.thumbnail}
              alt={video?.title}
              onClick={handleClick}
              className="w-full h-48 object-cover"
            />
            {/* Video Duration */}
            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 rounded-sm">
              {formatDuration(video?.duration)}
            </span>

            {/* 3-dot menu button */}
            {isDashboardPage && isOwner && (
              <div className="absolute top-2 right-2">
                <button
                  onClick={handleMenuToggle}
                  className="text-white bg-black/70 p-1 rounded-full hover:bg-black/80"
                >
                  <FiMoreVertical size={20} />
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border">
                    <ul className="py-1">
                      <li
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 cursor-pointer"
                        onClick={handleDelete}
                      >
                        Delete Video
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
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
                {video?.title}
              </h3>

              {/* Channel Name */}
              <p className="text-sm text-gray-500">{username}</p>

              {/* Views and Timestamp */}
              <p className="text-xs text-gray-400">
                {video?.views} views • {getRelativeTime(video?.createdAt)}
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default VideoCard;
