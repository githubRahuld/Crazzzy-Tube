import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Playlist } from "../models/playlist.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || name.trim() === "") {
        throw new ApiError(401, "Name is required");
    }

    const playlist = await Playlist.create({
        name,
        description: description || "",
        owner: req.user?._id,
    });

    if (!playlist) {
        throw new ApiError(500, "Error while creating playlist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist created suncessfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(401, "Invalid playlist Id");
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId);

    if (!playlist) {
        throw new ApiError(500, "Error while deleting Playlist");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist._id, "Playlist deleted suncessfull")
        );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(404, "UserId is required");
    }

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
    ]);

    if (!playlists.length) {
        return res.status(200).json({ message: "No Playlist found" });
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlists, "Playlists fetched successfully")
        );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { videoId, playlistId } = req.params;

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(401, "VideoId is required");
    }
    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(401, "playlistId is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "This video is not exists");
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "This playlist is not exists");
    }

    //checking wheather owner is adding video or not

    if (playlist?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(
            401,
            "You are not allowed to add video in this playlist"
        );
    }

    if (playlist.videos.includes(videoId)) {
        throw new ApiError(401, "Video already in playlis");
    }

    const addVideoToplaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: {
                videos: videoId,
            },
        },
        { new: true }
    );

    if (!addVideoToplaylist) {
        throw new ApiError(500, "Error while adding video to playlist");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                addVideoToplaylist,
                "Video added to playlist successfully"
            )
        );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { videoId, playlistId } = req.params;

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(401, "VideoId is required");
    }
    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(401, "playlistId is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "This video is not exists");
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "This playlist is not exists");
    }

    //checking wheather owner is adding video or not

    if (playlist?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(
            401,
            "You are not allowed to add video in this playlist"
        );
    }

    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(401, "Video not in playlis");
    }

    const removeVideoFromPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: {
                    $in: [`${videoId}`], //The condition: Remove any item in the array that matches videoId
                },
            },
        },
        { new: true }
    );

    if (!removeVideoFromPlaylist) {
        throw new ApiError(500, "Error while removing video from playlist");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                removeVideoFromPlaylist,
                "Video removed from playlist"
            )
        );
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(400, "Playlist not found");
    }

    if (!name && !description) {
        throw new ApiError(400, "Atleast one of the field is required");
    }

    if (playlist?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(
            401,
            "you do not have permission to perform this action"
        );
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name: name || playlist?.name,
                description: description || playlist?.description,
            },
        },
        { new: true }
    );

    if (!updatedPlaylist) {
        throw new ApiError(500, "Error while updating playlist");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Playlist updated successfully"
            )
        );
});

export {
    createPlaylist,
    deletePlaylist,
    getUserPlaylists,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist,
};
