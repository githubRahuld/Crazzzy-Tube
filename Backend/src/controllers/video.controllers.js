import { Video } from "../models/video.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import uploadOnCloudinary, {
    deleteImageFromCloudinary,
    deleteVideoFromCloudinary,
} from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { exec } from "child_process"; // Import the exec function from Node.js
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";
import util from "util";
import { v4 as uuidv4 } from "uuid";
import EventEmitter from "events";
EventEmitter.defaultMaxListeners = 20; // Increase the limit

const execPromise = util.promisify(exec);

// Function to get video duration using ffprobe
const getVideoDuration = (videoPath) => {
    console.log("videoPath: ",videoPath)
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) {
                return reject(
                    new ApiError(400, "Could not retrieve video metadata")
                );
            }
            const duration = metadata.format.duration; // Duration in seconds
            resolve(duration);
        });
    });
};

const publishVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        throw new ApiError(404, "Title and Description are required");
    }

    const videoFile = req.files?.videoFile;
    console.log("Video file: ", videoFile);

    const thumbnailFile = req.files?.thumbnail;

    if (!videoFile || !videoFile[0]?.path) {
        throw new ApiError(400, "Video file is required");
    }

    if (!thumbnailFile || !thumbnailFile[0]?.path) {
        throw new ApiError(400, "Thumbnail file is required");
    }

    const videoLocalPath = videoFile[0].path;
    const thumbnailLocalPath = thumbnailFile[0].path;

    // const videoDuration = await getVideoDuration(videoLocalPath);
     const videoDuration = 10;

    const lessonId = uuidv4();
    const outputPath = path.join("public", "hls", lessonId); // Use the public folder
    const hlsPath = path.join(outputPath, "index.m3u8");
    console.log("HLS Path:", hlsPath);

    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }

    // ffmpeg command
    const ffmpegCommand = `ffmpeg -i ${videoLocalPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${path.join(
        outputPath,
        "segment%03d.ts"
    )}" -start_number 0 ${hlsPath}`;

    // Execute ffmpeg command
    exec(ffmpegCommand, async (error, stdout, stderr) => {
        if (error) {
            console.log(`Exec error: ${error}`);
            return res
                .status(500)
                .json({ message: "Error processing video with FFmpeg" });
        }
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);

        // Upload HLS files to Cloudinary
        const hlsFiles = fs
            .readdirSync(outputPath)
            .filter((file) => file.endsWith(".m3u8") || file.endsWith(".ts"));
        const hlsUploadPromises = hlsFiles.map((file) => {
            return uploadOnCloudinary(path.join(outputPath, file));
        });

        try {
            const uploadedHLS = await Promise.all(hlsUploadPromises);
            console.log("Uploaded HLS files:", uploadedHLS); // Log uploaded HLS files for debugging

            // Filter out null values and find the .m3u8 URL
            const m3u8File = uploadedHLS.find(
                (file) => file && file.playback_url
            );
            const m3u8Url = m3u8File?.playback_url;

            if (!m3u8Url) {
                throw new ApiError(401, "HLS upload failed!");
            }

            const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

            if (!thumbnail?.url) {
                throw new ApiError(401, "Thumbnail upload failed!");
            }

            const videoData = await Video.create({
                title,
                description,
                videoFile: m3u8Url, // Use the HLS .m3u8 URL
                thumbnail: thumbnail.url,
                duration: videoDuration,
                views: 0,
                isPublished: true,
                owner: req.user._id,
            });

            if (!videoData) {
                throw new ApiError(
                    401,
                    "Something went wrong with video upload"
                );
            }

            console.log("Video published");

            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        videoData,
                        "Video published successfully"
                    )
                );
        } catch (uploadError) {
            console.error("Upload error:", uploadError);
            return res
                .status(500)
                .json({ message: "Error uploading HLS files or thumbnail" });
        }
    });
});

const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query = "",
        sortBy,
        sortType = "asc",
        userId,
    } = req.query;

    if (!query || !query.trim() === "") {
        throw new ApiError(401, "Query is required");
    }

    // Build the match criteria
    const matchCriteria = {
        $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
        ],
    };

    // If userId is provided, add it to the match criteria
    if (userId && isValidObjectId(userId)) {
        matchCriteria.owner = new mongoose.Types.ObjectId(userId);
    }

    const videos = await Video.aggregate([
        {
            $match: matchCriteria,
        },
        {
            $lookup: {
                from: "users", // Collection to join (users)

                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            avatar: 1,
                            username: 1,
                            fullName: 1,
                        },
                    },
                ],
            },
        },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                owner: 1,
                _id: 1,
                title: 1,
                description: 1,
                views: 1,
                duration: 1,
                isPublished: 1,
            },
        },
        {
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1,
            },
        },
        {
            // Skip results for pagination
            $skip: (page - 1) * limit,
        },
        {
            // Limit the number of results
            $limit: parseInt(limit),
        },
    ]);

    if (!videos.length) {
        throw new ApiError(404, "No videos found from this search");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "All videos  fetched successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(401, "Video-Id required");
    }

    // Validate that the videoId is a valid MongoDB ObjectId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId),
            },
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "owner",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                owner: { $first: "$owner" },
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "owner._id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers",
                },
            },
        },
        {
            $project: {
                _id: 1,
                videoFile: 1,
                thumbnail: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                updatedAt: 1,
                owner: 1,
                subscribersCount: 1,
            },
        },
    ]);

    if (!video) {
        throw new ApiError(404, "video not found");
    }
    console.log(video);

    const incrementView = await Video.findByIdAndUpdate(
        videoId,
        {
            $inc: { views: 1 },
        },
        { new: true }
    );

    const addToWatchHistory = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $addToSet: { watchHistory: videoId },
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: update video details like title, description, thumbnail

    if (!videoId) {
        throw new ApiError(401, "Video-Id required");
    }

    // Validate that the videoId is a valid MongoDB ObjectId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(401, "Title and description are required");
    }

    const thumbnailLocalPath = req.file?.path;

    if (!thumbnailLocalPath) {
        throw new ApiError(404, "new Thumbnail required");
    }

    //retrive old thumbnail and delete it
    const oldThumbnailUrl = await Video.findById(videoId);
    deleteImageFromCloudinary(oldThumbnailUrl.thumbnail);

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail?.url) {
        throw new ApiError(404, "error while updating thumbnail");
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail: thumbnail.url,
            },
        },
        {
            new: true,
        }
    );

    if (!video) {
        throw new ApiError(500, "Error while updating video details");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "video details updated"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(401, "Video-Id required");
    }

    // Validate that the videoId is a valid MongoDB ObjectId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    const videoToBeDeleted = await Video.findById(videoId);
    if (!videoToBeDeleted) {
        throw new ApiError(404, "Video not found");
    }

    const response = await deleteVideoFromCloudinary(
        videoToBeDeleted.videoFile
    );

    const deletedVideo = await Video.findByIdAndDelete(videoId);

    return res
        .status(200)
        .json(
            new ApiResponse(200, deletedVideo, "Video deleted suncsessfully")
        );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is not valid");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    //   // Toggle the publish status
    //   video.isPublished = !video.isPublished;

    // toggle the publish status

    const toggleStatus = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished,
            },
        },
        {
            new: true,
        }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, toggleStatus, "Status is updated successfully")
        );
});

const allVideos = asyncHandler(async (req, res) => {
    // const videos = await Video.find();

    // if (!videos.length) {
    //     return res.status(404).json(404, {}, "Videos are not found");
    // }

    const videos = await Video.aggregate([
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "owner",
                as: "channelDetails",
                pipeline: [
                    {
                        $project: {
                            _id: 0,
                            username: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                channel: { $first: "$channelDetails" },
            },
        },

        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                duration: 1,
                description: 1,
                createdAt: 1,
                views: 1,
                channel: 1,
            },
        },
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "All available videos fetched"));
});

const getVideoLikeById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const likesCount = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId),
            },
        },
        {
            $lookup: {
                from: "likes",
                foreignField: "video",
                localField: "_id",
                as: "likeOnVideo",
            },
        },
        {
            $addFields: {
                likeCount: { $size: "$likeOnVideo" },
            },
        },
        {
            $project: {
                _id: 0,
                likeCount: 1,
            },
        },
    ]);

    if (!likesCount) {
        throw new ApiError(401, "Error while fetching likes on video");
    }
    if (!likesCount.length) {
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "0 likes on this video"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, likesCount, "Likes count fetched"));
});

const oneUserVideos = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(id),
            },
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "owner",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                channel: { $first: "$owner" },
            },
        },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                duration: 1,
                description: 1,
                createdAt: 1,
                views: 1,
                channel: 1,
            },
        },
    ]);

    if (!videos) {
        throw new ApiError(501, {}, "Erro while fetching videos");
    }
    if (!videos.length) {
        return res.status(200).json(new ApiResponse(200, {}, "No video found"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "All video fetched"));
});

export {
    publishVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    allVideos,
    getVideoLikeById,
    oneUserVideos,
};
