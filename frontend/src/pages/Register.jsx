import React, { useState } from "react";
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaEnvelope,
  FaUserCircle,
  FaLock,
  FaImage,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Spinner } from "@nextui-org/react";

const Register = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);

  const [fullName, setFullName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [username, setUsername] = useState();
  const [avatar, setAvatar] = useState();
  const [coverImage, setCoverImage] = useState();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();

    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("username", username);
    formData.append("avatar", avatar);
    formData.append("coverImage", coverImage);
    console.log("formData: ", formData);

    axios
      .post(`${baseUrl}/api/v1/users/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        setLoading(false);
        console.log("register res: ", res);
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
      {loading ? (
        <Spinner label="Loading..." color="warning" />
      ) : (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-300 to-gray-100">
          <div className="flex-grow flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mt-10 mb-10">
              <h2 className="text-2xl font-bold text-gray-800 text-center">
                Sign Up
              </h2>
              <p className="text-center text-gray-400 text-sm mt-1 mb-6">
                Sign up to <span className="text-red-500">CrazzzyTube</span>
              </p>
              {error && <div className="text-red-400">{error}</div>}
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                {/* Name Input */}
                <div className="mb-4 flex items-center">
                  <FaUser className="text-gray-500 mr-2" />
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    placeholder="Name"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                {/* Email Input */}
                <div className="mb-4 flex items-center">
                  <FaEnvelope className="text-gray-500 mr-2" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="Email Address"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Username Input */}
                <div className="mb-4 flex items-center">
                  <FaUserCircle className="text-gray-500 mr-2" />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Username"
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                {/* Password Input */}
                <div className="mb-4 flex items-center relative">
                  <FaLock className="text-gray-500 mr-2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Password"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-2 top-2 text-gray-500"
                  >
                    {showPassword ? (
                      <FaEye className="w-6 h-6" />
                    ) : (
                      <FaEyeSlash className="w-6 h-6" />
                    )}
                  </button>
                </div>

                {/* Avatar Upload */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Upload Avatar</p>
                  <div className="flex items-center">
                    <FaUser className="text-gray-500 mr-2" />
                    <input
                      type="file"
                      id="avatar"
                      name="avatar"
                      accept="image/*"
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                      onChange={(e) => setAvatar(e.target.files[0])}
                    />
                  </div>
                </div>

                {/* Cover Image Upload */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">
                    Upload Cover Image
                  </p>
                  <div className="flex items-center">
                    <FaImage className="text-gray-500 mr-2" />
                    <input
                      type="file"
                      id="coverImage"
                      name="coverImage"
                      accept="image/*"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                      onChange={(e) => setCoverImage(e.target.files[0])}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300"
                >
                  Sign Up
                </button>
              </form>

              <p className="mt-4 text-sm text-gray-600 text-center">
                Already have an account?{" "}
                <Link to="/users/login" className="text-blue-500">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Register;
