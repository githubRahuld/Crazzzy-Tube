import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    getLikedVideos,
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
} from "../controllers/like.controllers.js";

const router = Router();

router.use(verifyJWT);

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/liked-videos").get(getLikedVideos);

export default router;
