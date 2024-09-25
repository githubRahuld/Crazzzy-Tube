import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { Loading, VideoCard } from "../components";

const Playlist = () => {
  const location = useLocation();
  const { playlist } = location.state || {};
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  console.log("Playlist: ", playlist);

  const [videoDetails, setVideoDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const videoData = await Promise.all(
          playlist.videos.map(async (videoId) => {
            console.log(videoId);

            const response = await axios.get(
              `${baseUrl}/api/v1/videos/${videoId}`,
              {
                headers: {
                  Authorization: `Bearer ${Cookies.get("accessToken")}`,
                },
              }
            );
            console.log(response.data.data[0]);
            setLoading(false);
            return response.data.data[0];
          })
        );
        setVideoDetails(videoData);
      } catch (error) {
        setLoading(false);
        console.log("Error fetching video details:", error);
      }
    };

    if (playlist && playlist.videos.length > 0) {
      fetchVideos();
    }
  }, [playlist]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-black dark:text-white mb-2">
            {playlist.name}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {playlist.videos.length} videos • Updated on{" "}
            {new Date(playlist.updatedAt).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {playlist.description}
          </p>
          {videoDetails.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {videoDetails.map((video, idx) => (
                <div key={idx}>
                  <VideoCard video={video} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <p className="text-lg text-gray-600 dark:text-gray-300">
                No videos in
                <span className="font-bold text-blue-500">
                  {" "}
                  {playlist.name}
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Playlist;
