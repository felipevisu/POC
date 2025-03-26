"use client";

import { useEffect, useRef, useState } from "react";

interface YouTubePlayerProps {
  videoId: string;
}

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId }) => {
  const playerRef = useRef<HTMLIFrameElement>(null);
  const [player, setPlayer] = useState<YT.Player | null>(null);

  useEffect(() => {
    const initializePlayer = () => {
      if (window.YT && playerRef.current) {
        new window.YT.Player(playerRef.current, {
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
          },
          events: {
            onReady: (event: YT.PlayerEvent) => setPlayer(event.target),
          },
        });
      }
    };

    if (window.YT) {
      initializePlayer();
    } else {
      window.onYouTubeIframeAPIReady = initializePlayer;

      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [videoId]);

  const playVideo = () => player?.playVideo();
  const pauseVideo = () => player?.pauseVideo();
  const stopVideo = () => player?.stopVideo();
  const seekTo = (seconds: number) => player?.seekTo(seconds, true);

  return (
    <div>
      <div>
        <iframe
          ref={playerRef}
          width="640"
          height="360"
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      <div>
        <button onClick={playVideo}>Play</button>
        <button onClick={pauseVideo}>Pause</button>
        <button onClick={stopVideo}>Stop</button>
        <button onClick={() => seekTo(30)}>Seek to 30s</button>
      </div>
    </div>
  );
};

export default YouTubePlayer;
