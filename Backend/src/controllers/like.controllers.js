import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: toggle like on video

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(401, "VideoId is required");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(401, "Video not found!");
    }

    const isLike = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id,
    });

    if (isLike) {
        const unLike = await Like.findByIdAndDelete(isLike._id);

        if (!unLike) {
            throw new ApiError(500, "Error while toogle unlike");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, unLike, "Video unLiked"));
    } else {
        const like = await Like.create({
            video: videoId,
            likedBy: req.user?._id,
        });

        if (!like) {
            throw new ApiError(500, "Error while toogle like");
        }
        return res.status(200).json(new ApiResponse(200, like, "Video liked"));
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    //TODO: toggle like on comment

    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(401, "VideoId is required");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(401, "Comment not found!");
    }

    const isLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id,
    });

    if (isLike) {
        const unLike = await Like.findByIdAndDelete(isLike._id);

        if (!unLike) {
            throw new ApiError(500, "Error while toogle unlike");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, unLike, "Comment unLiked"));
    } else {
        const like = await Like.create({
            comment: commentId,
            likedBy: req.user?._id,
        });

        if (!like) {
            throw new ApiError(500, "Error while toogle like");
        }
        return res
            .status(200)
            .json(new ApiResponse(200, like, "Comment liked"));
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    //TODO: toggle like on comment

    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(401, "VideoId is required");
    }

    const comment = await Comment.findById(tweetId);
    if (!comment) {
        throw new ApiError(401, "Comment not found!");
    }

    const isLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id,
    });

    if (isLike) {
        const unLike = await Like.findByIdAndDelete(isLike._id);

        if (!unLike) {
            throw new ApiError(500, "Error while toogle unlike");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, unLike, "Tweet unLiked"));
    } else {
        const like = await Like.create({
            tweet: tweetId,
            likedBy: req.user?._id,
        });

        if (!like) {
            throw new ApiError(500, "Error while toogle like");
        }
        return res.status(200).json(new ApiResponse(200, like, "Tweet liked"));
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                foreignField: "_id",
                localField: "video",
                as: "video",
                pipeline: [
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
                                        fullName: 1,
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
                        $project: {
                            _id: 1,
                            title: 1,
                            videoFile: 1,
                            thumbnail: 1,
                            owner: 1, // Keep the owner details
                            createdAt: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                video: {
                    $first: "$video",
                },
            },
        },
        {
            $match: {
                video: {
                    $exists: true,
                },
            },
        },
    ]);

    if (!likedVideos?.length) {
        throw new ApiError(500, "No liked videos found for this user");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likedVideos,
                "Liked videos fetched successfully"
            )
        );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
