import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { RiVideoUploadFill } from "react-icons/ri";
import { Tooltip, Button } from "@nextui-org/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from "@nextui-org/react";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

const Navbar = ({ searchTerm, setSearchTerm }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const userData = useSelector((state) => state.auth.user);
  const username = userData?.user?.username;

  useEffect(() => {
    if (userData) {
      setEmail(userData?.user?.email);
      setAvatar(userData?.user?.avatar);
    }

    if (!isLoggedIn) {
      navigate("/users/login");
    }
  }, [isLoggedIn, navigate, userData]);

  const [error, setError] = useState();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const handleUpload = () => {
    navigate("/users/upload");
  };

  const handleLogout = (e) => {
    e.preventDefault();

    axios
      .post(
        `${baseUrl}/api/v1/users/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        }
      )
      .then((res) => {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        dispatch(logoutUser());
        navigate("/users/login");
      })
      .catch((err) => {
        if (err.response || err.response.status === 409) {
          setError(err.response.data.message);
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      });
  };

  return (
    <>
      {location.pathname !== "/users/login" &&
        (isLoggedIn ? (
          <nav className="bg-white border-b border-gray-200 shadow-md dark:bg-gray-900 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between h-auto">
                {/* First Row: Logo, Search Bar, and Profile Avatar */}
                <div className="w-full flex items-center justify-between h-16">
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    <Link to="/users/home">
                      <img
                        className="h-28 w-28"
                        src="/img/Logo.png"
                        alt="YouTube Logo"
                      />
                    </Link>
                  </div>

                  {/* Search Bar for larger screens */}
                  {location.pathname === "/users/home" && (
                    <div className="hidden sm:flex sm:flex-grow sm:ml-4">
                      <div className="relative w-full">
                        <input
                          type="text"
                          className="w-full py-2 px-4 border border-gray-300 rounded-full dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Search"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="absolute right-0 top-0 mt-2 mr-3 text-gray-500 dark:text-gray-400">
                          <FaSearch className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Upload Button and Profile Avatar */}
                  <div className="flex items-center space-x-2">
                    <Tooltip content="Post a video">
                      <Button className="bg-white" onClick={handleUpload}>
                        <RiVideoUploadFill
                          size={30}
                          className="mr-2 cursor-pointer"
                        />
                      </Button>
                    </Tooltip>
                    <Dropdown placement="bottom-end">
                      <DropdownTrigger>
                        <Avatar
                          isBordered
                          as="button"
                          className="transition-transform"
                          src={avatar}
                        />
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Profile Actions" variant="flat">
                        <DropdownItem
                          key="profile"
                          className="h-14 gap-2"
                          textValue="Signed in as zoey@example.com"
                        >
                          <p className="font-semibold">Signed in as</p>
                          <p className="font-semibold">{email}</p>
                        </DropdownItem>
                        <DropdownItem key="settings" textValue="Profile">
                          <Link to="/users/profile">Profile</Link>
                        </DropdownItem>
                        <DropdownItem key="team_settings" textValue="Dashboard">
                          <Link to={`/users/dashboard/${username}`}>
                            Dashboard
                          </Link>
                        </DropdownItem>
                        <DropdownItem key="tweet" textValue="Tweet">
                          <Link to={`/tweet`}>Tweet</Link>
                        </DropdownItem>
                        <DropdownItem
                          key="logout"
                          color="danger"
                          textValue="Log Out"
                          onClick={handleLogout}
                        >
                          Log Out
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>

                {/* Search Bar for small screens */}
                {location.pathname === "/users/home" && (
                  <div className="w-full sm:hidden mt-2">
                    <div className="relative w-full mb-2">
                      <input
                        type="text"
                        className="w-full py-2 px-4 border border-gray-300 rounded-full dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <button className="absolute right-0 top-0 mt-2 mr-3 text-gray-500 dark:text-gray-400">
                        <FaSearch className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </nav>
        ) : null)}
    </>
  );
};

export default Navbar;
