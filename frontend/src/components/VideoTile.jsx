import { useEffect, useRef } from "react";

export function VideoTile({ peer, stream, label, isLocal = false, isMuted = false }) {
  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`video-tile ${isLocal ? "video-tile--local" : ""}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal || isMuted}
        className="video-tile__element"
      />
      <div className="video-tile__overlay">
        <div className="video-tile__label">
          {label} {isLocal && "(You)"}
        </div>
        {isMuted && (
          <div className="video-tile__status">
            <span className="icon">🔇</span>
          </div>
        )}
      </div>
    </div>
  );
}
