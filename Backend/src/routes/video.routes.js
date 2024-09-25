import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import {
    allVideos,
    deleteVideo,
    getAllVideos,
    getVideoById,
    getVideoLikeById,
    oneUserVideos,
    publishVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controllers.js";

const router = Router();

router.use(verifyJWT);

router.route("/upload-video").post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
    ]),
    publishVideo
);

router.route("/get-all-videos").get(getAllVideos); //perticular user videos
router.route("/:videoId").get(getVideoById);
router.route("/:videoId").patch(upload.single("thumbnail"), updateVideo);
router.route("/:videoId").delete(deleteVideo);

router.route("/v/all-videos").get(allVideos); // all videos by search
router.route("/u/all-videos/:id").get(oneUserVideos); // all users videos
router.route("/likes/:videoId").get(getVideoLikeById);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
