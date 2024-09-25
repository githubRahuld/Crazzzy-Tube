import { useState } from "react";
import { Input } from "@nextui-org/react";
import { LuUserCircle2 } from "react-icons/lu";
import { Button } from "@nextui-org/react";
import { PiUserCirclePlusDuotone } from "react-icons/pi";
import axios from "axios";
import Cookies from "js-cookie";
import { Spinner } from "@nextui-org/react";

const Profile = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [loadingCI, setLoadingCI] = useState(false);
  const [message, setMessage] = useState();

  // Handle user details update
  const handleUserDetailsSubmit = (e) => {
    e.preventDefault();
    setLoadingDetails(true);
    axios
      .patch(
        `${baseUrl}/api/v1/users/update-account`,
        { fullName, username },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
            "Content-Type": "application/json", // Ensure the content type is JSON
          },
        }
      )
      .then((res) => {
        console.log(res.data);
        setMessage("Updated Successfully");
        setLoadingDetails(false);
      })
      .catch((err) => {
        setLoadingDetails(false);
        setMessage("Failed");
        console.log(err);
      });
  };

  // Handle avatar update
  const handleAvatarSubmit = (e) => {
    e.preventDefault();
    setLoadingAvatar(true);

    const formData = new FormData();
    formData.append("avatar", avatar);

    axios
      .patch(`${baseUrl}/api/v1/users/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        console.log(res.data);
        setMessage("Updated Successfully");
        setLoadingAvatar(false);
      })
      .catch((err) => {
        setLoadingAvatar(false);
        setMessage("Failed");
        console.log(err);
      });
  };

  // Handle cover image update
  const handleCoverImageSubmit = (e) => {
    e.preventDefault();
    setLoadingCI(true);

    const formData = new FormData();
    formData.append("coverImage", coverImage);

    axios
      .patch(`${baseUrl}/api/v1/users/cover-image`, formData, {
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        console.log(res.data);
        setMessage("Updated Successfully");
        setLoadingCI(false);
      })
      .catch((err) => {
        setLoadingCI(false);
        setMessage("Failed");
        console.log(err);
      });
  };

  const formbg = "/img/form-bg.jpg";
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8 ">
      {/* Message*/}
      {message && (
        <h2
          className={`text-xl font-bold p-4 rounded-lg shadow-md ${
            message === "Updated Successfully"
              ? "text-green-500 bg-green-100 border border-green-500"
              : "text-red-500 bg-red-100 border border-red-500"
          }`}
        >
          {message}
        </h2>
      )}
      {/* Form 1: User Details */}
      <form
        onSubmit={handleUserDetailsSubmit}
        className="space-y-4 bg-gray-400 mt-3 mb-2 p-6 rounded-lg"
        style={{
          backgroundImage: `url(${formbg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div>
          <h3 className="text-xl font-semibold text-orange-400 ">
            Update Details
          </h3>

          <Input
            type="text"
            name="username"
            label="Username"
            value={username}
            labelPlacement="outside"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <Input
            type="text"
            name="fullName"
            label="Full Name"
            value={fullName}
            labelPlacement="outside"
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          radius="full"
          className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg"
        >
          {loadingDetails && <Spinner color="success" />} Update Details{" "}
          <LuUserCircle2 />
        </Button>
      </form>

      {/* Form 2: Avatar Upload */}
      <form
        onSubmit={handleAvatarSubmit}
        className="space-y-4 bg-gray-400 mt-3 mb-2 p-6 rounded-lg"
        style={{
          backgroundImage: `url(${formbg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h3 className="text-xl font-semibold text-orange-400 ">
          Update Avatar
        </h3>
        <div>
          <Input
            type="file"
            accept="image/*"
            name="fullName"
            label="Avatar"
            labelPlacement="outside"
            onChange={(e) => setAvatar(e.target.files[0])}
          />
        </div>
        <Button
          type="submit"
          radius="full"
          className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg"
        >
          {loadingAvatar && <Spinner color="success" />} Update Avatar{" "}
          <PiUserCirclePlusDuotone />
        </Button>
      </form>

      {/* Form 3: Cover Image Upload */}
      <form
        onSubmit={handleCoverImageSubmit}
        className="space-y-4 bg-gray-400 mt-3 mb-2 p-6 rounded-lg"
        style={{
          backgroundImage: `url(${formbg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h3 className="text-xl font-semibold text-orange-400 ">
          Update Cover Image
        </h3>
        <div>
          <Input
            type="file"
            accept="image/*"
            name="coverImage"
            label="Cover Image"
            labelPlacement="outside"
            onChange={(e) => setCoverImage(e.target.files[0])}
          />
        </div>
        <Button
          type="submit"
          radius="full"
          className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg"
        >
          {loadingCI && <Spinner color="success" />} Update Cover Image{" "}
          <PiUserCirclePlusDuotone />
        </Button>
      </form>
    </div>
  );
};

export default Profile;
