import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.log("Could not find local file path");
            return null;
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        //remove the local temp file when uploader got failed
        fs.unlinkSync(localFilePath);

        return null;
    }
};

export const deleteImageFromCloudinary = async (avatarUrl) => {
    try {
        // Extract public ID from the URL (remove the extension)
        const publicId = avatarUrl.split("/").pop().split(".")[0]; // This extracts the image name without extension

        // Delete the image by its public ID
        await cloudinary.uploader.destroy(publicId);

        console.log(`Image ${publicId} successfully deleted`);
    } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        throw new ApiError(500, "Failed to delete the image");
    }
};

export const deleteVideoFromCloudinary = async (videoUrl) => {
    if (!videoUrl) {
        console.log("Could not find local file path");
        return null;
    }

    // Extract the public ID from the video URL
    const publicId = videoUrl.split("/").pop().split(".")[0]; // Extract the public ID before the file extension

    try {
        // Delete the video from Cloudinary using the public ID
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "video",
        });

        if (result.result !== "ok") {
            console.log("Failed to delete video from Cloudinary");
            return null;
        }

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Video deleted successfully"));
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong with Cloudinary deletion"
        );
    }
};

export default uploadOnCloudinary;
