import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const videoStats = await Video.aggregate([
        {
            $match: {
                owner: req.user?._id,
            },
        },
        {
            $lookup: {
                from: "likes",
                foreignField: "video",
                localField: "_id",
                as: "likes",
            },
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "owner",
                as: "videos",
            },
        },
        {
            $addFields: {
                totalLikes: { $size: "$likes" },
                totalViews: { $sum: "$views" },
            },
        },
        {
            $group: {
                _id: null, // Group all documents together to count total videos
                totalVideos: { $sum: 1 }, // Count the total number of videos
                videos: {
                    $push: {
                        _id: "$_id",
                        title: "$title",
                        totalLikes: "$totalLikes",
                        totalViews: "$totalViews",
                    },
                },
            },
        },
        {
            $project: {
                totalVideos: 1,
                videos: 1,
            },
        },
    ]);

    const subscribersStats = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(user?._id),
            },
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "subscriber",
                as: "subscribers",
            },
        },
        {
            $addFields: {
                totalSubcribers: "$subscribers",
            },
        },
        {
            $group: {
                _id: null,
                totalSubcribers: { $sum: 1 },
            },
        },
        {
            $project: {
                _id: 0,
                totalSubcribers: 1,
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { videoStats, subscribersStats },
                "Stats are fetched"
            )
        );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const userVideos = await Video.aggregate([
        {
            $match: {
                owner: req.user?._id,
            },
        },

        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes",
            },
        },

        {
            $addFields: {
                likesCount: {
                    $size: "$likes",
                },
            },
        },

        {
            $project: {
                _id: 1,
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                createdAt: 1,
                owner: 1,
                views: 1,
                likesCount: 1,
                isPublished: 1,
                videoFile_public_id: 1,
                thumbnail_public_id: 1,
            },
        },
    ]);

    if (!userVideos) {
        throw ApiError(500, "Error while fetching your videos");
    }
    if (!userVideos.length) {
        return res.status(200).json(new ApiResponse(200, {}, "No video found"));
    }
    return res
        .status(200)
        .json(new ApiResponse(200, userVideos, "Fetched all your videos"));
});

export { getChannelStats, getChannelVideos };
