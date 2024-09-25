import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid videoId");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const allComments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
            },
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "owner",
                as: "commentBy",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            _id: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                commentBy: { $first: "$commentBy" },
            },
        },
        {
            $project: {
                _id: 1,
                content: 1,
                createdAt: 1,
                commentBy: 1,
            },
        },

        {
            $skip: (page - 1) * limit,
        },

        {
            $limit: parseInt(limit),
        },
    ]);

    if (!allComments) {
        throw new ApiError(500, "Error while fetching comments");
    }
    if (!allComments.length) {
        throw new ApiError(500, "No comments on this video");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, allComments, "All comments fetched"));
});

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const { videoId } = req.params;
    const { content } = req.body;

    if (!content || content?.trim() === "") {
        throw new ApiError(401, "Content requied");
    }

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid videoId");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    console.log("user: ", req.user?._id);

    const createComment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id,
    });

    if (!createComment) {
        throw new ApiError(500, "Error while creating comment");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { createComment, videoId },
                "Comment added to the video"
            )
        );
});

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const { commentId } = req.params;
    const { newContent } = req.body;

    if (!newContent || newContent?.trim() === "") {
        throw new ApiError(401, "Content requied");
    }

    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(401, "Invalid videoId");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(500, "Comment not found");
    }

    if (comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(
            401,
            "You do not have permission to update this comment"
        );
    }

    const updateComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: newContent,
            },
        },
        { new: true }
    );

    if (!updateComment) {
        throw new ApiError(404, "Error while updating comment on video");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updateComment, "Comment updated successfully")
        );
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(401, "Invalid videoId");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(500, "Comment not found");
    }

    if (comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(
            401,
            "You do not have permission to delete this comment"
        );
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
        throw new ApiError(404, "Error while deleting comment on video");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedComment._id,
                "Comment deleted successfully"
            )
        );
});

const getCommentLikesById = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const commentCount = await Comment.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(commentId),
            },
        },
        {
            $lookup: {
                from: "likes",
                foreignField: "comment",
                localField: "_id",
                as: "likeOnComment",
            },
        },
        {
            $addFields: {
                likeCount: { $size: "$likeOnComment" },
            },
        },
        {
            $project: {
                _id: 0,
                likeCount: 1,
            },
        },
    ]);

    if (!commentCount) {
        throw new ApiError(401, "Error while fetching likes on Comment");
    }
    if (!commentCount.length) {
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "0 likes on this Comment"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, commentCount, "Likes count fetched"));
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment,
    getCommentLikesById,
};
