import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import { Skeleten, VideoCard, Loading } from "../components";
import { useDispatch } from "react-redux";
import { logoutUser } from "../store/authSlice";
import { useOutletContext } from "react-router-dom"; // To access context from App


function Home() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const dispatch = useDispatch();

  const [error, setError] = useState();
  const [videosData, setVideosData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { searchTerm } = useOutletContext();
  


  useEffect(() => {
    const getAllVideos = () => {
      setLoading(true);
      axios
        .get(`${baseUrl}/api/v1/videos/v/all-videos`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`, // Add the access token
          },
        })
        .then((res) => {
          console.log(res.data.data);
          setVideosData(res.data.data);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          if (err.response.status === 411) {
            dispatch(logoutUser());
            navigate("/users/login");
          }
          console.log(err);
          setError(err);
        });
    };

    getAllVideos();
  }, []);

  // Filter videos based on searchTerm
  const filteredVideos = videosData.filter(
    (video) =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.channel.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="mt-4">
          {error && <h1>{error}</h1>}
          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredVideos.map((video, idx) => (
                <div key={idx}>
                  <VideoCard video={video} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <p className="text-lg text-gray-600 dark:text-gray-300">
                No videos found for
                <span className="font-bold text-blue-500"> "{searchTerm}"</span>
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Home;
