import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { loginUser } from "../store/authSlice";
import { Spinner } from "@nextui-org/react";
import { Card, CardBody } from "@nextui-org/react";

const Login = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);

  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const demoEmail = "amit@indmail.com";
  const demoPassword = "demo123";

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert(`${text} copied to clipboard!`);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    axios
      .post(`${baseUrl}/api/v1/users/login`, { email, password })
      .then((res) => {
        setError("");

        const { accessToken, refreshToken } = res.data.data;

        //set Cookies
        Cookies.set("accessToken", accessToken, {
          secure: true,
          sameSite: "strict",
        });
        Cookies.set("refreshToken", refreshToken, {
          secure: true,
          sameSite: "strict",
        });

        const userData = res.data.data;
        dispatch(loginUser({ userData }));

        setLoading(false);
        navigate("/users/home");
      })
      .catch((err) => {
        setLoading(false);
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
        <div className="flex items-center justify-center min-h-screen">
          <Spinner label="Loading..." color="warning" className="w-1/2 h-36" />
        </div>
      ) : (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-300 to-gray-100">
          <div className=" font-poppins flex-grow flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mt-6 mb-6 sm:mt-20 sm:mb-20 sm:p-12">
              <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-gray-800 text-center">
                Sign In
              </h2>
              <p className="text-center text-gray-400 text-sm mt-2 mb-6">
                Sign In to{" "}
                <span className="font-poppins text-red-500 font-semibold">
                  CrazzzyTube
                </span>
              </p>
              {error && (
                <div className="text-red-400 mb-4 text-center">{error}</div>
              )}
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                {/* Email Input */}
                <div className="mb-4 flex items-center">
                  <FaEnvelope className="text-gray-500 mr-2 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="Email Address"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Password Input */}
                <div className="mb-4 flex items-center relative">
                  <FaLock className="text-gray-500 mr-2 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Password"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-3 top-2 text-gray-500"
                  >
                    {showPassword ? (
                      <FaEye className="w-5 h-5" />
                    ) : (
                      <FaEyeSlash className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300 text-base"
                >
                  Login
                </button>
              </form>

              <p className="mt-4 text-sm text-gray-600 text-center mb-4">
                Don't have an account?{" "}
                <Link
                  to="/users/sign-up"
                  className="text-blue-500 hover:underline"
                >
                  Sign Up
                </Link>
              </p>

              <Card>
                <CardBody>
                  <h3 className="font-semibold text-sm text-gray-800 text-center">
                    Demo Credentials
                  </h3>
                  <div className="p-2 rounded-lg text-center text-sm">
                    <p className="text-gray-700">
                      <span className="font-medium">Email:</span> {demoEmail}
                      <button
                        onClick={() => copyToClipboard(demoEmail)}
                        className="ml-2 text-blue-500 underline cursor-pointer"
                      >
                        Copy
                      </button>
                    </p>
                    <p className="text-gray-700 mt-2">
                      <span className="font-medium">Password:</span>{" "}
                      {demoPassword}
                      <button
                        onClick={() => copyToClipboard(demoPassword)}
                        className="ml-2 text-blue-500 underline cursor-pointer"
                      >
                        Copy
                      </button>
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
