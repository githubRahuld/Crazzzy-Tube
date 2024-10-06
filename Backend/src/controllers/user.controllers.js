import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import uploadOnCloudinary, {
    deleteImageFromCloudinary,
} from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "something went wrong while generting access and refresh tokens"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, username, email, password } = req.body;

    if (
        [fullName, username, email, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are reuqired");
    }
    //email validation
    if (!email.includes("@")) {
        throw new ApiError("Email should be valid");
    }

    const checkUserExist = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (checkUserExist) {
        // throw new ApiError(409, "User already exists");
        return res.status(409).json({ message: "User already exists" });
    }

    //check images using multer
    const avatarLocalPath = req.files?.avatar[0]?.path;

    // const coverLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    let coverLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverLocalPath = req.files.coverImage[0].path;
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverLocalPath);

    if (!avatar) {
        throw new ApiError("Avatar not uploaded on cloudinary ");
    }

    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registring user!");
    }

    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "User register successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;

    // required either email or username
    if (!email && !username) {
        // throw new ApiError(400, "either Email or username required");
        return res
            .status(409)
            .json({ message: "either Email or username required" });
    }

    const userExists = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!userExists) {
        // throw new ApiError(404, "User not exists,please SignUp first!");
        return res
            .status(409)
            .json({ message: "User not exists,please SignUp first!" });
    }

    const passwordCheck = await userExists.isPasswordCorrect(password);

    if (!passwordCheck) {
        // throw new ApiError(400, "Invalid Password");
        return res.status(409).json({ message: "Invalid Password" });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        userExists._id
    );

    const loggedInUser = await User.findById(userExists._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User loggedIn successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged Out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request");
    }

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    if (!decodedToken) {
        throw new ApiError(401, "Invalid Refresh Token");
    }

    const user = await User.findById(decodedToken._id);

    if (!user) {
        throw new ApiError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, "Refresh Token was expired please login");
    }

    const { accessToken, newRefreshToken } = generateAccessAndRefreshTokens(
        user._id
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                201,
                { accessToken, refreshToken: newRefreshToken },
                "Access Token refreshed"
            )
        );
});

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(401, "Fields are required");
    }
    if (oldPassword === newPassword) {
        throw new ApiError(401, "Donot use previously used passwords");
    }

    const user = await User.findById(req.user?._id);
    const passwordCheck = await user.isPasswordCorrect(oldPassword);

    if (!passwordCheck) {
        throw new ApiError(401, "Invalid password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: true });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Passsword changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const currentUser = await User.findById(req.user?._id);

    if (!currentUser) {
        throw new ApiError(401, "Unauthorized request");
    }

    //TODO: directly return req.user without fetching from db
    return res
        .status(200)
        .json(new ApiResponse(200, currentUser, "Fetched current user"));
});

const updateUserDetails = asyncHandler(async (req, res) => {
    const { fullName, username } = req.body;

    if (!fullName || !username) {
        throw new ApiError(401, "Fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                username,
            },
        },
        {
            new: true,
        }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User details updated"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    // const avatarLocalPath = req.files?.avatar[0]?.path;
    const avatarLocalPath = req.file?.path; //single file is given by user

    console.log(avatarLocalPath);

    if (!avatarLocalPath) {
        throw new ApiError(401, "Avatar is requried");
    }

    const avatarImage = await uploadOnCloudinary(avatarLocalPath);

    if (!avatarImage.url) {
        throw new ApiError(500, "Error while uploading avatar");
    }

    //delete old avatar from cloudinary
    const currUser = await User.findById(req.user?._id);
    deleteImageFromCloudinary(currUser.avatar);

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatarImage?.url,
            },
        },
        {
            new: true,
        }
    ).select("-password");

    return res.status(200).json(new ApiResponse(200, user, "Avatar updated"));
});
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path; //single file is given by user

    if (!coverImageLocalPath) {
        throw new ApiError(401, "Avatar is requried");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url) {
        throw new ApiError(500, "Error while uploading avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage?.url,
            },
        },
        {
            new: true,
        }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "coverImage updated"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username.trim()) {
        throw new ApiError(401, "Username is missing");
    }

    // const channel = User.aggregate([{pipleline 1},{pinepline 2},{and soo on...}])
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase(),
            },
        },
        {
            //find subcribers
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            //find channels which user subscribed to
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribeTo",
            },
        },
        {
            //add more field in existing document
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers",
                },
                subscribedToCount: {
                    $size: "$subscribeTo",
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            //return neccessary fields
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            },
        },
    ]);

    if (!channel?.length) {
        throw new ApiError(401, "User not found");
    }

    //aggregation pipleline always return array

    return res
        .status(200)
        .json(new ApiResponse(200, channel[0], "User profile fetched"));
});

const getUserWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
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
                            owner: {
                                $first: "$owner",
                            },
                        },
                    },
                ],
            },
        },
    ]);

    if (!user) {
        throw new ApiError(404, "no watched video found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "Watch history fetched successfully"
            )
        );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateUserDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getUserWatchHistory,
};
