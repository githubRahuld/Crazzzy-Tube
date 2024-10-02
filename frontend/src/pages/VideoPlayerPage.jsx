import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { FaRegHeart } from "react-icons/fa";
import { FcLike } from "react-icons/fc";
import { Button } from "@nextui-org/react";
import { Comment, Loading } from "../components";
import { Link } from "react-router-dom";
import VideoDescription from "../components/VideoDescription";

const VideoPlayerPage = () => {
  const { id } = useParams();
  const videoRef = useRef(null);
  const [videoData, setVideoData] = useState();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comment, setComment] = useState("");
  const [commentsData, setCommentsData] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [ownerId, setOwnerId] = useState();

  const handleLike = async () => {
    try {
      const res = await axios.post(
        `${baseUrl}/api/v1/likes/toggle/v/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        }
      );
      console.log("Like toggled:", res.data);

      // Check the response to know if the user has liked or unliked the video
      if (res.data.message === "Video liked") {
        setLikeCount((prevCount) => prevCount + 1); // Increment like count
        setHasLiked(true); // Update the state to reflect the like action
      } else {
        setLikeCount((prevCount) => prevCount - 1); // Decrement like count
        setHasLiked(false); // Update the state to reflect the unlike action
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const fetchVideoLikes = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/api/v1/videos/likes/${id}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("accessToken")}`,
            },
          }
        );
        setLikeCount(response.data.data[0].likeCount); // Store like count
        setHasLiked(response.data.data[0].hasLiked); // Store whether the user has liked the video
        console.log("Video like count:", response.data.data[0].likeCount);
      } catch (err) {
        console.log("Fetch error: ", err);
      }
    };
    fetchVideoLikes();

    const fetchCommentLikes = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/api/v1/comments/likes/${id}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("accessToken")}`,
            },
          }
        );
        setLikeCount(response.data.data[0].likeCount); // Store like count
        setHasLiked(response.data.data[0].hasLiked); // Store whether the user has liked the video
        console.log("Video like count:", response.data.data[0].likeCount);
      } catch (err) {
        console.log("Fetch error: ", err);
      }
    };
    fetchCommentLikes();
  }, [id]);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/v1/videos/${id}`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        });
        setVideoData(response.data.data[0]);
        setSubscriberCount(response.data.data[0].subscribersCount);
        setOwnerId(response.data.data[0].owner._id);
        console.log("video owner: ", response.data.data[0].owner.username);

        console.log("Video data:", response.data.data[0]);
      } catch (err) {
        console.log("Fetch error: ", err);
      }
    };
    fetchVideo();
  }, [id, baseUrl]);

  useEffect(() => {
    if (videoData && videoRef.current) {
      const player = videojs(videoRef.current, {
        controls: true,
        autoplay: false,
        preload: "auto",
      });

      return () => {
        if (player) {
          player.dispose(); // Clean up the player on component unmount
        }
      };
    }
  }, [videoData]);

  // video comment
  const handleComment = async () => {
    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/comments/${id}`,
        { content: comment },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        }
      );
      const newComment = response.data.data;
      // Add the new comment to the list without reloading
      setCommentsData((prevComments) => [newComment, ...prevComments]);

      // Clear the input field
      setComment("");

      console.log(response.data.data);
    } catch (err) {
      console.log("error: ", err);
      console.log("error while commenting");
    }
  };
  //fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      await axios
        .get(`${baseUrl}/api/v1/comments/${id}`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        })
        .then((res) => {
          setCommentsData(res.data.data);
          console.log(res.data.data);
          console.log(res.data.data[0].commentBy?.username);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    fetchComments();
  }, [id, comment]);

  //subscription toggle
  const handleSubscribe = async () => {
    await axios
      .post(
        `${baseUrl}/api/v1/subscriptions/u/${ownerId}`,
        { channelId: ownerId },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        }
      )
      .then((res) => {
        console.log(res.data);
        // Toggle subscription state
        if (res.data.message === "Channel Subscribed") {
          setIsSubscribed(true);
          setSubscriberCount((prevCount) => prevCount + 1);
        } else {
          setIsSubscribed(false);
          setSubscriberCount((prevCount) => prevCount - 1);
        }
      })
      .catch((err) => {
        console.log("Error while toggle subscription: ", err);
      });
  };

  //subscription status
  useEffect(() => {
    const getStatus = async () => {
      if (!ownerId) return; // If ownerId is not set, return early

      try {
        const res = await axios.get(
          `${baseUrl}/api/v1/subscriptions/status/${ownerId}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("accessToken")}`,
            },
          }
        );
        console.log(res);

        console.log(res.data);

        // Toggle subscription state
        if (res.data.isSubscribed) {
          setIsSubscribed(true);
        } else {
          setIsSubscribed(false);
        }
      } catch (err) {
        console.log("Error while getting subscription status: ", err);
      }
    };

    getStatus();
  }, [ownerId]);
  if (!videoData) {
    return <Loading />;
  }

  function timeAgo(date) {
    const now = new Date();
    const videoDate = new Date(date);
    const diffInSeconds = Math.floor((now - videoDate) / 1000);

    const timeIntervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1,
    };

    for (let interval in timeIntervals) {
      const elapsed = Math.floor(diffInSeconds / timeIntervals[interval]);
      if (elapsed > 1) {
        return `${elapsed} ${interval}s ago`;
      } else if (elapsed === 1) {
        return `1 ${interval} ago`;
      }
    }
    return "just now";
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3">
          <div className="relative pb-56.25 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="video-js vjs-default-skin w-full h-full rounded-lg"
              controls
              preload="auto"
              style={{ aspectRatio: "16/9" }}
            >
              <source src={videoData.videoFile} type="application/x-mpegURL" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="mt-4 flex items-start space-x-4">
            <Link to={`/users/dashboard/${videoData.owner.username}`}>
              <img
                src={
                  videoData.owner.avatar ||
                  "https://i.pravatar.cc/150?u=a04258114e29026702d"
                }
                alt={videoData.owner.username}
                className="w-16 h-16 rounded-full object-cover"
              />
            </Link>

            <div>
              <h1 className="text-2xl md:text-3xl font-semibold">
                {videoData.title}
              </h1>
              <div className="text-gray-600 text-2xl">
                <Link to={`/users/dashboard/${videoData.owner.username}`}>
                  <span className="font-medium block">
                    {videoData.owner.username}
                  </span>
                </Link>
                <span className="text-sm block">
                  Subscribers: {subscriberCount}
                </span>
              </div>
            </div>
            {/* Subscribe / Subscribed button */}
            <Button
              radius="full"
              onClick={handleSubscribe}
              className={`ml-4 mt-4 px-4 py-1 text-sm font-semibold  ${
                isSubscribed
                  ? "bg-gray-500 text-white"
                  : "bg-blue-500 text-white"
              }`}
            >
              {isSubscribed ? "Subscribed" : "Subscribe"}
            </Button>
          </div>

          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
              <div>
                {videoData.views} views • Uploaded{" "}
                {timeAgo(videoData.createdAt)}
              </div>
            </div>
            {/* Like button */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`hover:text-blue-500 text-2xl flex items-center space-x-2 ${
                  hasLiked ? "text-blue-500" : ""
                }`}
              >
                <span>{hasLiked ? <FcLike /> : <FaRegHeart />}</span>
                <span>{likeCount}</span>
              </button>
            </div>
          </div>
          {/* description  */}
         <VideoDescription videoData={videoData} />

          {/* Comment Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Comments</h2>
            <div className="mb-4 flex items-start space-x-4">
              <img
                src={videoData.owner.avatar}
                alt="User avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <input
                  type="text"
                  name="comment"
                  value={comment}
                  placeholder="Add a comment..."
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:border-blue-500"
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="mt-2 flex justify-end">
                  <Button onClick={handleComment} color="primary">
                    Comment
                  </Button>
                </div>
              </div>
            </div>

            {/* Example Comments */}
            <div className="space-y-4">
              {commentsData?.map((comment, idx) => (
                <div key={idx}>
                  <Comment
                    comment={comment}
                    createdAt={timeAgo(comment.createdAt)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerPage;
