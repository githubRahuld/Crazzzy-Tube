import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import { Button } from "@nextui-org/react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Loading, ThreeDots, VideoCard } from "../components";
import { Tabs, Tab } from "@nextui-org/react";
import { Card, CardHeader, CardBody, Image } from "@nextui-org/react";
import { IoIosAddCircleOutline } from "react-icons/io";

import { useDisclosure } from "@nextui-org/react"; //for modal
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";

function Dashboard() {
  const userData = useSelector((state) => state.auth.user);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [userProfile, setUserProfile] = useState({});
  const [userId, setUserId] = useState();
  const [videos, setVideos] = useState([]);
  const [tabSelected, setTabSelected] = useState("videos");
  const [playlists, setPlaylists] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [playlistMsg, setPlaylistMsg] = useState("");
  const [addVideoMsg, setAddVideoMsg] = useState("");
  const [authUser, setAuthUser] = useState(false);

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { username } = useParams();
  const tempImage = "/img/no-cover.jpg";

  useEffect(() => {
    if (userData && userData.user._id === userId) {
      setAuthUser(true);
    } else {
      setAuthUser(false);
    }

    console.log(userData.username);

    console.log("userId", userId, "userData: ", userData.user._id);
    console.log("authUser: ", authUser);
  }, [userData, userId]);

  useEffect(() => {
    let isMounted = true;
    const fetchUserDetails = async () => {
      setLoading(true);

      await axios
        .get(`${baseUrl}/api/v1/users/c/${username}`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        })
        .then((res) => {
          if (isMounted) {
            console.log(res.data.data);
            setUserProfile(res.data.data);
            setUserId(res.data.data._id);
            setSubscriberCount(res.data.data.subscribersCount);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.log("error while fetching user Dashboard : ", err);
          if (isMounted) setLoading(false);
        });
    };
    fetchUserDetails();
    return () => {
      isMounted = false;
    };
  }, [username, baseUrl]);

  //subscription toggle
  const handleSubscribe = async () => {
    await axios
      .post(
        `${baseUrl}/api/v1/subscriptions/u/${userProfile._id}`,
        { channelId: userProfile._id },
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
      if (!userProfile._id) return; // If ownerId is not set, return early

      try {
        const res = await axios.get(
          `${baseUrl}/api/v1/subscriptions/status/${userProfile._id}`,
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
  }, [userProfile._id]);

  //fetch user videos
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const fetchVideos = async () => {
        console.log("userId: ", userId);

        await axios
          .get(`${baseUrl}/api/v1/videos/u/all-videos/${userId}`, {
            headers: {
              Authorization: `Bearer ${Cookies.get("accessToken")}`,
            },
          })
          .then((res) => {
            setLoading(false);
            console.log(res.data.data);
            setVideos(res.data.data);
          })
          .catch((err) => {
            setLoading(false);
            console.log("error while fetching videos: ", err);
          });
      };
      if (tabSelected === "videos") fetchVideos();
    }, 2000);
    return () => clearTimeout(timer);
  }, [userId]);

  // Fetch playlists
  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchPlaylists = async () => {
        console.log(userId);

        setLoading(true);
        await axios
          .get(`${baseUrl}/api/v1/playlists/${userId}`, {
            headers: {
              Authorization: `Bearer ${Cookies.get("accessToken")}`,
            },
          })
          .then((res) => {
            console.log("hi");

            setPlaylists(res.data.data);
            console.log(res.data.data);

            setLoading(false);
          })
          .catch((err) => {
            console.log("Error while fetching playlists: ", err);
            setLoading(false);
          });
      };
      if (tabSelected === "playlist") fetchPlaylists();
    }, 2000);
    return () => clearTimeout(timer);
  }, [userId, tabSelected]);

  const handleCreatePlaylist = async () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPlaylistMsg("");

    await axios
      .post(
        `${baseUrl}/api/v1/playlists/create-playlist`,
        { name: playlistName, description: playlistDescription },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        }
      )
      .then((res) => {
        console.log(res.data);
        setPlaylistMsg(res.data.message);
        handleCloseModal();
        setLoading(false);
      })
      .catch((err) => {
        setPlaylistMsg("PLaylist creation failed!");
        console.log("Error while creating playlist: ", err);
        setLoading(false);
      });
  };

  const handleCloseVideoModal = () => {
    setShowVideoModal(false);
  };

  // Function to open the modal for adding a video to the playlist
  const handleAddVideoToPlaylist = (playlist) => {
    setSelectedPlaylist(playlist);
    setShowVideoModal(true);
  };

  // Function to handle selecting a video and adding it to the playlist
  const handleSelectVideo = async (video, playlist) => {
    console.log(`Adding video ${video.title} to playlist ${playlist.name}`);

    setLoading(true);
    await axios
      .patch(
        `${baseUrl}/api/v1/playlists/add/${video._id}/${playlist._id}`,
        { videoId: video._id, playlistId: playlist._id },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        }
      )
      .then((res) => {
        console.log(res.data);
        setShowVideoModal(false);
        setAddVideoMsg("Video added in Playlist Sucessfully");
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        setAddVideoMsg("Video add failed!");
        console.log("Error while adding video to playlist: ", err);
      });

    handleCloseVideoModal();
  };

  return (
    <div className="relative">
      {/* Main Content Section */}
      <div
        className={`p-6 bg-gray-100 min-h-screen ${
          isModalOpen ? "blur-sm" : ""
        }`}
      >
        {/* Cover Image */}
        <div
          className="w-full h-40 sm:h-48 md:h-56 lg:h-80 bg-cover bg-center rounded-lg mb-4"
          style={{
            backgroundImage: `url(${userProfile.coverImage || tempImage})`,
          }}
        ></div>

        {/* Profile Section */}
        <div className="bg-white p-4 shadow-lg rounded-lg mb-2">
          {/* Avatar and Details */}
          <div className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
            <div className="flex flex-col items-center sm:flex-row sm:items-start space-x-0 sm:space-x-4">
              <img
                src={userProfile.avatar}
                alt="Avatar"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-indigo-500"
              />
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
                  {userProfile.fullName}
                </h1>
                <p className="text-sm text-gray-500">
                  <span className="text-blue-600 font-bold">@</span>
                  {userProfile.username}
                </p>
                <p className="text-sm text-gray-500">{userProfile.email}</p>
              </div>
            </div>

            {/* Subscription Info */}
            <div className="text-center sm:text-right mt-4 sm:mt-0">
              <p className="text-md sm:text-lg text-gray-600">
                Subscribers: {subscriberCount}
              </p>
              <p className="text-md sm:text-lg text-gray-600">
                Subscribed To: {userProfile.subscribedToCount}
              </p>
              {!authUser && (
                <button
                  onClick={handleSubscribe}
                  className={`mt-4 px-4 py-2 text-sm font-semibold rounded-full ${
                    isSubscribed
                      ? "bg-gray-500 text-white"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Section */}
        <div className="bg-white text-black rounded-full mb-4">
          <Tabs
            radius="full"
            aria-label="Tabs radius"
            className="mt-2 mb-2"
            selectedKey={tabSelected}
            onSelectionChange={setTabSelected} // Set selected tab on click
          >
            <Tab key="videos" title="Videos" />
            <Tab key="playlist" title="Playlist" />
          </Tabs>
        </div>

        {/* Content Section */}
        {loading ? (
          <Loading />
        ) : (
          <div className="mt-8">
            {tabSelected === "videos" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.length > 0 ? (
                  videos.map((video) => (
                    <div key={video._id} className="bg-white p-4 rounded-lg">
                      <VideoCard video={video} />
                    </div>
                  ))
                ) : (
                  <p>No videos uploaded yet.</p>
                )}
              </div>
            )}

            {tabSelected === "playlist" && (
              <div className="playlist-section">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Playlists</h2>
                  {authUser && (
                    <Button
                      radius="full"
                      className="bg-blue-500 text-white"
                      onClick={handleCreatePlaylist}
                    >
                      <IoIosAddCircleOutline /> Create New Playlist
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {playlists?.length > 0 ? (
                    playlists.map((playlist) => (
                      <div key={playlist._id} className="">
                        <Card className="py-4">
                          <div className="relative px-4 items-center">
                            {/* Playlist Info */}
                            <CardHeader className="pb-0 pt-2 flex-col items-start relative">
                              <p className="text-tiny uppercase font-bold">
                                Playlist
                              </p>
                              <small className="text-default-500">
                                Updated At{" "}
                                {new Date(
                                  playlist.updatedAt
                                ).toLocaleDateString()}
                              </small>
                              <h4 className="font-bold text-large">
                                {playlist.name}
                              </h4>

                              {/* Three Dot Icon positioned at top-right */}
                              {authUser && (
                                <div className="absolute top-2 right-2">
                                  <ThreeDots playlist={{ playlist }} />
                                </div>
                              )}
                            </CardHeader>
                          </div>

                          <CardBody className="overflow-visible py-2">
                            <Link to={`/playlist`} state={{ playlist }}>
                              <Image
                                alt="Card background"
                                className="object-cover rounded-xl transition-transform duration-300 ease-in-out hover:scale-105"
                                src="https://nextui.org/images/hero-card-complete.jpeg"
                                width={270}
                              />
                            </Link>
                          </CardBody>
                        </Card>

                        {/* Add Video Button outside the Card */}
                        {authUser && (
                          <Button
                            className="mt-2 bg-green-500 text-white"
                            onClick={() => handleAddVideoToPlaylist(playlist)}
                            onPress={onOpen}
                          >
                            Add Video
                          </Button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>No playlists created yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Modal for Selecting Videos */}
      <div>
        {showVideoModal && (
          <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    Select Video to Add
                  </ModalHeader>
                  <ModalBody>
                    <div className="grid grid-cols-1 gap-4">
                      {videos.map((video) => (
                        <div
                          key={video._id}
                          className="flex justify-between items-center"
                        >
                          <p>{video.title}</p>
                          <Button
                            className="bg-blue-500 text-white"
                            onClick={() =>
                              handleSelectVideo(video, selectedPlaylist)
                            }
                          >
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                      Close
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 z-50">
            <h2 className="text-lg font-semibold mb-4">Create New Playlist</h2>
            {playlistMsg && <div className="text-green-600">{playlistMsg}</div>}
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter playlist name"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={playlistDescription}
                  name="description"
                  onChange={(e) => setPlaylistDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter playlist description"
                  rows="3"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
