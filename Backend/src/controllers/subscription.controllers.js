import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    // TODO: toggle subscription

    if (!channelId || !isValidObjectId(channelId)) {
        throw new ApiError(401, "Invalid Channel");
    }

    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel not exists");
    }

    if (channelId.toString() === req.user?._id.toString()) {
        throw new ApiError(400, "Cannot subscribe to your own channel");
    }

    const isSubscribed = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId,
    });

    if (isSubscribed) {
        const unsubscribe = await Subscription.findByIdAndDelete(isSubscribed);

        if (!unsubscribe) {
            throw new ApiError(500, "Problem while unsubscribing!");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Channel Unsubscribed"));
    } else {
        const subscribe = await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId,
        });

        if (!subscribe) {
            throw new ApiError(500, "Problem while subscribing!");
        }
    }

    return res.status(200).json(new ApiResponse(200, {}, "Channel Subscribed"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId || !isValidObjectId(channelId)) {
        throw new ApiError(401, "Invalid channel-id");
    }

    const user = await User.findById(channelId);
    if (!user) {
        throw new ApiError(404, "Channel not exists");
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers",
            },
        },
        {
            $addFields: {
                subscribers: {
                    $first: "$subscribers",
                },
            },
        },
        {
            $group: {
                _id: null,
                subscribers: { $push: "$subscribers" },
                totalSubscribersCount: { $sum: 1 },
            },
        },

        {
            $project: {
                _id: 0,
                subscribers: {
                    _id: 1,
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                },
                totalSubscribers: "$totalSubscribersCount",
            },
        },
    ]);

    if (!subscribers) {
        throw new ApiError(401, "Error while fetching subcribers");
    }
    if (!subscribers.length) {
        new ApiResponse(200, "Subscribers not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subscribers, "Subscriber list fetched"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!subscriberId || !isValidObjectId(subscriberId)) {
        throw new ApiError(401, "Invalid channel-id");
    }

    const user = await User.findById(subscriberId);
    if (!user) {
        throw new ApiError(404, "Channel not exists");
    }

    const subscribedTo = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            },
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "channel",
                as: "channels",
            },
        },
        {
            $addFields: {
                channels: {
                    $first: "$channels",
                },
            },
        },
        {
            $group: {
                _id: null,
                channels: { $push: "$channels" },
                totalChannels: { $sum: 1 },
            },
        },
        {
            $project: {
                _id: 0,
                channels: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                },
                subscribedChannelsCount: "$totalChannels",
            },
        },
    ]);

    if (!subscribedTo.length) {
        throw new ApiError(404, "You donot subsrcibed any channel");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subscribedTo, "SubscribedTo list fetched"));
});

const checkSubscriptionStatus = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user?._id;

    try {
        // Check if the user is subscribed to the channel
        const status = await Subscription.findOne({
            channel: new mongoose.Types.ObjectId(channelId),
            subscriber: new mongoose.Types.ObjectId(userId),
        });

        if (status) {
            res.status(200).json({
                success: true,
                message: "User is subscribed to the channel",
                isSubscribed: true,
            });
        } else {
            res.status(200).json({
                success: true,
                message: "User is not subscribed to the channel",
                isSubscribed: false,
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error checking subscription status",
            error: error.message,
        });
    }
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
    checkSubscriptionStatus,
};
