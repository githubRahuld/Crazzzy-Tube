import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

// cors configuration
app.use(
    cors({
        origin: "https://crazzzy-tube-frontend.vercel.app",  // Allow only your frontend's origin
        credentials: true,  // Allow credentials (cookies, authorization headers)
        methods: ["GET", "POST", "PUT","PATCH", "DELETE", "OPTIONS"],  // Specify allowed HTTP methods
        allowedHeaders: ["Content-Type", "Authorization"],  // Specify allowed headers
    })
);

// Enable preflight requests (OPTIONS) for all routes
app.options("*", cors());


// allowing json data
app.use(express.json({ limit: "16kb" }));

//for url consistency
app.use(express.urlencoded({ extended: true }));

//allowing public folder to access
app.use(express.static("public"));

// to access cookies from users browser using server
app.use(cookieParser());

//import routes
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import subcriptionRouter from "./routes/subscription.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import tweetRouter from "./routes/tweet.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/subscriptions", subcriptionRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/tweets", tweetRouter);

export { app };
