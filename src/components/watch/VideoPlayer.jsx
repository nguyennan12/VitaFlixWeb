import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

export function VideoPlayer({ source, poster, movieName, episodeName, onEnded, onNextEpisode, onPrevEpisode, hasNext, hasPrev }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [cinemaMode, setCinemaMode] = useState(false);
  const [autoNext, setAutoNext] = useState(true);

  // Load Video source with Hls.js
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source) return;

    if (Hls.isSupported() && source.includes('.m3u8')) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          // Autoplay was prevented
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
      });
    } else {
      video.src = source;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [source]);

  // Handle auto next
  const handleVideoEnded = () => {
    if (autoNext && hasNext && onNextEpisode) {
      setTimeout(() => {
        onNextEpisode();
      }, 1000);
    }
    if (onEnded) onEnded();
  };

  return (
    <div>
      {/* Film Playing Title */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 style={{ fontSize: '24px', margin: 0 }} className="gradient-text">
          {movieName} {episodeName ? `— ${episodeName}` : ''}
        </h2>
      </div>

      {/* Video Container */}
      <div className={`watch-player-wrap ${cinemaMode ? 'cinema-mode-active' : ''}`}>
        <video
          ref={videoRef}
          controls
          playsInline
          poster={poster}
          onEnded={handleVideoEnded}
        />
        {cinemaMode && (
          <button
            onClick={() => setCinemaMode(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(0,0,0,0.7)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '14px',
              zIndex: 10000
            }}
          >
            <i className="fa-solid fa-xmark me-1" /> Tắt rạp phim
          </button>
        )}
      </div>

      {/* Control Bar */}
      <div className="player-control-bar">
        {/* Left options */}
        <div className="player-control-group">
          <button
            className={`player-ctrl-btn ${cinemaMode ? 'active' : ''}`}
            onClick={() => setCinemaMode(!cinemaMode)}
          >
            <i className="fa-solid fa-film" />
            <span>Rạp phim: {cinemaMode ? 'Bật' : 'Tắt'}</span>
          </button>

          <button
            className={`player-ctrl-btn ${autoNext ? 'active' : ''}`}
            onClick={() => setAutoNext(!autoNext)}
          >
            <i className="fa-solid fa-forward-step" />
            <span>Tự chuyển tập: {autoNext ? 'Bật' : 'Tắt'}</span>
          </button>
        </div>

        {/* Right prev / next buttons */}
        <div className="player-control-group">
          <button
            className="player-ctrl-btn"
            disabled={!hasPrev}
            onClick={onPrevEpisode}
            style={{ opacity: hasPrev ? 1 : 0.4, cursor: hasPrev ? 'pointer' : 'not-allowed' }}
          >
            <i className="fa-solid fa-backward" /> Tập trước
          </button>

          <button
            className="player-ctrl-btn"
            disabled={!hasNext}
            onClick={onNextEpisode}
            style={{ opacity: hasNext ? 1 : 0.4, cursor: hasNext ? 'pointer' : 'not-allowed' }}
          >
            Tập sau <i className="fa-solid fa-forward" />
          </button>
        </div>
      </div>
    </div>
  );
}
