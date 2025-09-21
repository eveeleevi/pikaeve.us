"use client";

import React from "react";

type BackgroundVideoProps = {
  src?: string;
  poster?: string;
  opacity?: number; // 0..1 overlay darkness (0 = none)
  audioSrc?: string; // optional background audio
  canPlay?: boolean; // gate autoplay until allowed
};

export default function BackgroundVideo({ src = "/background.mp4", poster = "", opacity = 0.35, audioSrc, canPlay = true }: BackgroundVideoProps) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch {
      // Ignore autoplay errors
    }
  };

  React.useEffect(() => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio) return;
    if (typeof audio.volume === "number") {
      audio.volume = 0.5; // 50%
    }

    // Try to autoplay with sound. If blocked, wait for first user interaction
    let cleanedUp = false;
    const attemptPlay = async () => {
      try {
        if (!canPlay) return;
        if (video && video.paused) {
          await video.play();
        }
        await audio.play();
        if (!cleanedUp) setIsPlaying(true);
        cleanupInteractionListeners();
      } catch {
        // Autoplay blocked, keep listeners
      }
    };

    const onFirstInteract = () => {
      attemptPlay();
    };

    const addInteractionListeners = () => {
      document.addEventListener("click", onFirstInteract, { once: true });
      document.addEventListener("keydown", onFirstInteract, { once: true });
      document.addEventListener("touchstart", onFirstInteract, { once: true });
    };
    const cleanupInteractionListeners = () => {
      document.removeEventListener("click", onFirstInteract);
      document.removeEventListener("keydown", onFirstInteract);
      document.removeEventListener("touchstart", onFirstInteract);
    };

    attemptPlay().then(() => {
      // If autoplay failed, listeners remain
    });
    addInteractionListeners();

    return () => {
      cleanedUp = true;
      cleanupInteractionListeners();
    };
  }, [audioSrc, canPlay]);
  return (
    <>
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <video
          ref={videoRef}
          className="min-w-full min-h-full w-auto h-auto object-cover"
          muted
          loop
          playsInline
          poster={poster || undefined}
        >
          <source src={src} type="video/mp4" />
        </video>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.6) 100%)",
            opacity,
          }}
        />
      </div>
      {audioSrc ? (
        <audio ref={audioRef} src={audioSrc} preload="auto" loop />
      ) : null}
    </>
  );
}


