import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { User } from "@nextui-org/react";
import { useSelector } from "react-redux";
import { Button } from "@nextui-org/react";
import { Loading } from "../components";

const Tweet = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const userData = useSelector((state) => state.auth.user);

  const [tweets, setTweets] = useState([]);
  const [content, setContent] = useState("");
  const [tweetId, setTweetId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");

  // Function to fetch all tweets

  useEffect(() => {
    const fetchTweets = async () => {
      setLoading(true);
      axios
        .get(`${baseUrl}/api/v1/tweets/tweet`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        })
        .then((res) => {
          setTweets(res.data.data);

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
    fetchTweets();
  }, [tweets]);

  // Function to create a new tweet
  const createTweet = async () => {
    setLoading(true);
    axios
      .post(
        `${baseUrl}/api/v1/tweets/`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        }
      )
      .then((res) => {
        setLoading(false);
        console.log(res.data);

        const newTweet = res.data.data; // Fixed this line
        setTweets([newTweet, ...tweets]); // Prepend the new tweet

        // Clear the input after successful creation
        setContent(""); // This will clear the textarea after the tweet is created
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
        setError(err);
      });
  };

  // Function to update a tweet
  const updateTweet = async () => {
    if (!content || !tweetId) return;
    try {
      setLoading(true);
      const response = await axios.patch(
        `${baseUrl}/api/v1/tweets/${tweetId}`,
        { newTweet: content },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        }
      );
      setTweets(
        tweets.map((tweet) => (tweet._id === tweetId ? response.data : tweet))
      );
      setContent("");
      setTweetId(null);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error updating tweet:", error);
    }
  };

  // Function to delete a tweet
  const deleteTweet = async (tweetId) => {
    try {
      setLoading(true);
      await axios.delete(`${baseUrl}/api/v1/tweets/${tweetId}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
      });
      setTweets(tweets.filter((tweet) => tweet._id !== tweetId));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error deleting tweet:", error);
    }
  };

  // Render the Tweet Page
  return (
    <div className="container mx-auto p-4 bg-slate-200">
      <h1 className="text-3xl font-bold mb-4 text-orange-500">Tweets</h1>

      {/* Input for creating/updating tweets */}
      <div className="mb-6">
        <textarea
          className="border border-gray-300 rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-pink-400 transition duration-300 ease-in-out shadow-sm text-gray-700 placeholder-gray-400"
          rows="4"
          placeholder="What's happening?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex justify-end mt-3">
          <Button
            radius="full"
            className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white shadow-lg px-6 py-2 rounded-full hover:scale-105 hover:shadow-2xl transition-transform duration-300 ease-in-out"
            onClick={tweetId ? updateTweet : createTweet}
          >
            {tweetId ? "Update Tweet" : "Create Tweet"}
          </Button>
        </div>
      </div>

      {/* List of tweets */}
      <ul>
        {tweets.length > 0 ? (
          [...tweets]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by newest first
            .map((tweet) => (
              <li
                key={tweet._id}
                className="border-b py-4 mb-4 bg-white shadow-sm rounded-lg p-4 transition duration-300 ease-in-out hover:shadow-lg"
              >
                {/* Check if owner exists */}
                {tweet.owner ? (
                  <div className="flex items-center mb-3">
                    <User
                      name={tweet.owner.username || "Unknown"}
                      avatarProps={{
                        src: tweet.owner.avatar || "/default-avatar.png",
                      }}
                    />
                    <p className="text-gray-500 text-sm ml-3">
                      {new Date(tweet.createdAt).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-red-500">User information unavailable</p>
                )}

                {/* Tweet Content */}
                <div className="text-gray-700 text-base text-start">
                  {tweet.content}
                </div>

                {/* Edit/Delete Actions */}
                {userData.user._id === tweet.owner?._id && (
                  <div className="mt-4 flex space-x-3">
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-300 ease-in-out"
                      onClick={() => {
                        setTweetId(tweet._id);
                        setContent(tweet.content);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition duration-300 ease-in-out"
                      onClick={() => deleteTweet(tweet._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))
        ) : (
          <div className="flex items-center justify-center">
            <p className="text-lg text-gray-600 dark:text-gray-300">
              No tweets in your feed.
            </p>
          </div>
        )}
      </ul>
    </div>
  );
};

export default Tweet;
