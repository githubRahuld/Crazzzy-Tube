import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    checkSubscriptionStatus,
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controllers.js";

const router = Router();

router.use(verifyJWT);

router.route("/c/:channelId").get(getUserChannelSubscribers);
router.route("/status/:channelId").get(checkSubscriptionStatus);
router.route("/u/:subscriberId").get(getSubscribedChannels);
router.route("/u/:channelId").post(toggleSubscription);

export default router;
