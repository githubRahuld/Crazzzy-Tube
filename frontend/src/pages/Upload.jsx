import axios from "axios";
import React, { useState } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@nextui-org/react";
import Cookies from "js-cookie";

const Upload = () => {
  const [videoFile, setVideoFile] = useState();
  const [thumbnail, setThumbnail] = useState();
  const [title, setTitle] = useState();
  const [description, setDescription] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
 

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const formbg = "/img/form-bg.jpg";

  // const token = Cookies.get("accessToken");
  // console.log("token: ", token);

  const handleUpload = (e) => {
  e.preventDefault();
  setLoading(true);

  const formData = new FormData();
  formData.append("videoFile", videoFile);
  formData.append("thumbnail", thumbnail);
  formData.append("title", title);
  formData.append("description", description);

  axios
    .post(`${baseUrl}/api/v1/videos/upload-video`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${Cookies.get("accessToken")}`,
      },
    })
    .then((res) => {
      if (videoFile && thumbnail) {
        console.log("Video uploaded:", videoFile);
        console.log("Thumbnail uploaded:", thumbnail);
        console.log("res: ", res);
      } else {
        alert("Please upload both video and thumbnail!");
        return; // exit if video or thumbnail isn't uploaded
      }

      if (res.status === 202) {  // Corrected to 'res'
        setUploadMessage(res.data.message); // Set message for UI
      }

      // Redirect to home page after 5 seconds
      const timer = setTimeout(() => {
        navigate("/users/home");
      }, 5000);

      // Cleanup the timer when the component unmounts
      return () => clearTimeout(timer);
    })
    .catch((err) => {
      setLoading(false);
      console.log(err);

      // Catching the error response
      if (err.response && err.response.statusText) {
        setError(err.response.statusText || "An error occurred");
      } else {
        setError("An unexpected error occurred");
      }
    });
};

  return (
    <div className="flex justify-center items-center bg-gray-100 min-h-screen">
       
      {loading ? (
        <Spinner
          label="Uploading..."
          color="warning"
          className="text-yellow-400"
        />
      ) : (
        <div className="w-full max-w-2xl bg-white shadow-lg p-6 rounded-lg mt-4 sm:px-40">
           {/* Display the upload message */}
          {uploadMessage && <p>{uploadMessage}</p>}
          {error && <div className="text-red-500 bg-slate-800">{error}</div>}
          <form onSubmit={handleUpload} encType="multipart/form-data">
            <h1 className="text-2xl font-bold mb-4">Upload Video</h1>
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg flex flex-col items-center justify-center text-center">
              <AiOutlineCloudUpload size={50} className="text-gray-400 mb-4" />
              <input
                type="file"
                name="videoFile"
                accept="video/*"
                className="hidden"
                id="videoFile"
                onChange={(e) => setVideoFile(e.target.files[0])}
              />
              <label
                htmlFor="videoFile"
                className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Choose Video
              </label>
              {videoFile && (
                <p className="mt-2 text-gray-600">{videoFile.name}</p>
              )}
            </div>

            {/* Thumbnail Upload */}
            <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg flex flex-col items-center justify-center text-center mb-4 mt-2">
              <AiOutlineCloudUpload size={50} className="text-gray-400 mb-4" />
              <input
                type="file"
                accept="image/*"
                name="thumbnail"
                onChange={(e) => setThumbnail(e.target.files[0])}
                className="hidden"
                id="thumbnail"
              />
              <label
                htmlFor="thumbnail"
                className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Choose Thumbnail
              </label>
              {thumbnail && (
                <p className="mt-2 text-gray-600">{thumbnail.name}</p>
              )}
            </div>

            {/* Title Input */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter video title"
              />
            </div>

            {/* Description Input */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter video description"
                rows={4}
              ></textarea>
            </div>

            {/* Upload Button */}
            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Upload Video
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Upload;
