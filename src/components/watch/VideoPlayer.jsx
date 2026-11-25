import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';

export function VideoPlayer({
  source,
  poster,
  movieName,
  episodeName,
  initialTime = 0,
  onProgressSave,
  onEnded,
  onNextEpisode,
  onPrevEpisode,
  hasNext,
  hasPrev
}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const hasSeekedRef = useRef(false);
  const lastSavedAtRef = useRef(0);
  const skipTimerRef = useRef(null);
  const initialTimeRef = useRef(initialTime);
  const onProgressSaveRef = useRef(onProgressSave);

  useEffect(() => {
    initialTimeRef.current = initialTime;
  }, [initialTime]);

  useEffect(() => {
    onProgressSaveRef.current = onProgressSave;
  }, [onProgressSave]);

  const [cinemaMode, setCinemaMode] = useState(false);
  const [autoNext, setAutoNext] = useState(true);
  const [skipFeedback, setSkipFeedback] = useState(null);

  const triggerProgressSave = useCallback((options) => {
    const video = videoRef.current;
    if (!video || !onProgressSaveRef.current) return;
    if (video.currentTime > 0) {
      lastSavedAtRef.current = Date.now();
      onProgressSaveRef.current(video.currentTime, video.duration || 0, options);
    }
  }, []);

  // If saved initialTime arrives slightly after video metadata loaded, seek immediately
  useEffect(() => {
    const video = videoRef.current;
    if (!video || hasSeekedRef.current || !initialTime || initialTime <= 5) return;
    if (video.readyState >= 1) {
      hasSeekedRef.current = true;
      const maxSeek = Number.isFinite(video.duration) && video.duration > 10 ? video.duration - 5 : initialTime;
      video.currentTime = Math.min(initialTime, maxSeek);
    }
  }, [initialTime]);

  const skipSeconds = useCallback((delta) => {
    const video = videoRef.current;
    if (!video) return;

    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : Infinity;
    const targetTime = Math.max(0, Math.min(duration, video.currentTime + delta));
    video.currentTime = targetTime;

    setSkipFeedback(delta > 0 ? `+${delta}s` : `${delta}s`);
    if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
    skipTimerRef.current = setTimeout(() => {
      setSkipFeedback(null);
    }, 700);
  }, []);

  // Keyboard shortcuts: ArrowLeft / J (-10s), ArrowRight / L (+10s)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || document.activeElement?.isContentEditable) {
        return;
      }
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'j') {
        e.preventDefault();
        skipSeconds(-10);
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'l') {
        e.preventDefault();
        skipSeconds(10);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [skipSeconds]);

  // Reset seek tracker when source changes
  useEffect(() => {
    hasSeekedRef.current = false;
    lastSavedAtRef.current = 0;
  }, [source]);

  // Load Video source with Hls.js (only re-runs when `source` changes)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source) return;

    const applyInitialSeek = () => {
      const startAt = initialTimeRef.current || 0;
      if (!hasSeekedRef.current && startAt > 5) {
        hasSeekedRef.current = true;
        const maxSeek = Number.isFinite(video.duration) && video.duration > 10 ? video.duration - 5 : startAt;
        video.currentTime = Math.min(startAt, maxSeek);
      }
    };

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
        applyInitialSeek();
        video.play().catch(() => {});
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
    } else {
      video.src = source;
      const onLoadedMeta = () => {
        applyInitialSeek();
        video.play().catch(() => {});
      };
      video.addEventListener('loadedmetadata', onLoadedMeta, { once: true });
    }

    return () => {
      triggerProgressSave();
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [source, triggerProgressSave]);

  // Save on page hide / tab close / reload
  useEffect(() => {
    const handlePageHide = () => triggerProgressSave({ keepalive: true });
    window.addEventListener('pagehide', handlePageHide);
    return () => window.removeEventListener('pagehide', handlePageHide);
  }, [triggerProgressSave]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || video.currentTime < 1) return;
    if (Date.now() - lastSavedAtRef.current >= 10000) {
      triggerProgressSave();
    }
  };

  const handleVideoEnded = () => {
    triggerProgressSave();
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
      <div className={`watch-player-wrap ${cinemaMode ? 'cinema-mode-active' : ''}`} style={{ position: 'relative' }}>
        <video
          ref={videoRef}
          controls
          playsInline
          poster={poster}
          onTimeUpdate={handleTimeUpdate}
          onPause={triggerProgressSave}
          onEnded={handleVideoEnded}
        />

        {/* Skip +/-10s Visual Feedback */}
        {skipFeedback && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0, 0, 0, 0.78)',
              color: '#fff',
              padding: '12px 22px',
              borderRadius: '999px',
              fontSize: '20px',
              fontWeight: '700',
              pointerEvents: 'none',
              zIndex: 20,
              border: '1px solid rgba(0, 212, 255, 0.5)'
            }}
          >
            {skipFeedback}
          </div>
        )}

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
            className="player-ctrl-btn"
            onClick={() => skipSeconds(-10)}
            title="Lùi 10 giây (Phím mũi tên trái hoặc J)"
          >
            <i className="fa-solid fa-rotate-left" />
            <span>-10s</span>
          </button>

          <button
            className="player-ctrl-btn"
            onClick={() => skipSeconds(10)}
            title="Tới 10 giây (Phím mũi tên phải hoặc L)"
          >
            <i className="fa-solid fa-rotate-right" />
            <span>+10s</span>
          </button>

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
