import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    getChannelStats,
    getChannelVideos,
} from "../controllers/dashboard.controllers.js";

const router = Router();

router.use(verifyJWT);

router.route("/all-videos").get(getChannelVideos);
router.route("/stats").get(getChannelStats);

export default router;
