import React, { useEffect, useState } from "react";
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import axios from "axios";
import Cookies from "js-cookie";

function Comment({ comment, createdAt }) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [likes, setLikes] = useState([]);
  const [isLiked, setIsLiked] = useState(false);

  // Handle like button click
  const handleLikeButton = async () => {
    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/likes/toggle/c/${comment._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        }
      );
      setIsLiked(!isLiked);
      console.log(response.data.data);
    } catch (err) {
      console.log("error: ", err);
      console.log("error while liking");
    }
  };

  useEffect(() => {
    const fetchLikesCount = async () => {
      await axios
        .get(`${baseUrl}/api/v1/comments/c/${comment._id}`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        })
        .then((res) => {
          setLikes(res.data.data[0]);
          console.log(res.data.data[0]);
        })
        .catch((err) => {
          console.log("err while liking Comment  :", err);
        });
    };
    fetchLikesCount();
  }, []);

  return (
    <>
      <div className="flex items-start space-x-4 ">
        <img
          src={comment.commentBy?.avatar}
          alt="User avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="bg-gray-100 p-3 rounded-lg ">
            <div className="font-semibold text-left">
              {comment.commentBy?.username}
            </div>
            <p className="text-sm text-gray-700 text-left">{comment.content}</p>
          </div>
          <div className="text-xs text-gray-500 mt-1 text-left">
            {createdAt}
          </div>

          {/* Like Button and Count */}
          <div className="mt-2 flex items-center space-x-2">
            <button
              onClick={handleLikeButton}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-500"
            >
              {isLiked ? (
                <AiFillLike className="w-5 h-5" /> // Filled like icon when liked
              ) : (
                <AiOutlineLike className="w-5 h-5" /> // Outline like icon when not liked
              )}
              {likes.likeCount === 0 ? null : likes.likeCount}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Comment;
