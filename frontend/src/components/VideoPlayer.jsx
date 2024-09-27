import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const VideoPlayer = ({ videoUrl, poster }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    // Initialize the video.js player when the component mounts
    const player = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      preload: "auto",
      poster: poster, // Thumbnail image for the video
      fluid: true, // Responsive video player
      techOrder: ["html5"], // Use HTML5 video
      responsive: true, // Make player responsive
      playsinline: true, // Ensures the video plays inline on iOS
    });

    // Load the video URL
    player.src({ src: videoUrl, type: "application/x-mpegURL" });

    // Dispose of the player when the component unmounts
    return () => {
      if (player) {
        player.dispose();
      }
    };
  }, [videoUrl, poster]);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-big-play-centered" controls>
        <source src={videoUrl} type="application/x-mpegURL" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
