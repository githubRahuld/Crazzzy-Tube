import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    addComment,
    deleteComment,
    getCommentLikesById,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controllers.js";

const router = Router();
router.use(verifyJWT);

router.route("/:videoId").post(addComment).get(getVideoComments);
router.route("/c/:commentId").get(getCommentLikesById);

router.route("/:commentId").patch(updateComment).delete(deleteComment);

export default router;
