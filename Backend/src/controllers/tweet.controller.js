import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Tweet } from "../models/tweet.model.js";

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    const { content } = req.body;

    if (!content || content.trim().toString === "") {
        throw ApiError(401, "Content requied");
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id,
    });

    if (!tweet) {
        throw ApiError(401, "Error while creating tweet");
    }

    return res.status(200).json(new ApiResponse(200, tweet, "Tweet created"));
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId id");
    }

    const userTweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
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
                content: 1,
                owner: 1,
            },
        },
    ]);

    if (!userTweets)
        throw new ApiError(501, "error while fetching user tweets");

    if (!userTweets.length) {
        return res.status(200).json(new ApiResponse(404, {}, "No tweet found"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, userTweets, "Tweets fetched"));
});

const getaAllTweets = asyncHandler(async (req, res) => {
    const allTweets = await Tweet.aggregate([
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
                content: 1,
                createdAt: 1,
                owner: 1,
            },
        },
    ]);

    if (!allTweets) {
        throw new ApiError(501, "Error while fetching all tweets");
    }
    if (!allTweets.length) {
        return res.status(200).json(new ApiResponse(404, {}, "No tweet found"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, allTweets, "All tweets fetched"));
});

const updateTweet = asyncHandler(async (req, res) => {
    const { newTweet } = req.body;
    const { tweetId } = req.params;

    if (!newTweet || !newTweet.trim() === "") {
        throw new ApiError(400, "New tweet is required to update old tweet");
    }

    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    // find the tweet with the given id;

    const oldTweet = await Tweet.findById(tweetId);

    if (!oldTweet) {
        throw new ApiError(501, "Tweet not found for the given id");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: { content: newTweet },
        },

        {
            new: true,
        }
    );

    if (!updatedTweet) {
        throw new ApiError(500, "Error while updating the Tweet.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTweet, "Tweet successfully updated"));
});

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;

    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(501, "Tweet not found");
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    if (!deletedTweet) {
        throw new ApiError(500, "Error while deleting the tweet");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deleteTweet, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, getaAllTweets, updateTweet, deleteTweet };
