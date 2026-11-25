import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

export function VideoPlayer({
  source,
  poster,
  movieName,
  episodeName,
  initialTime = 0,
  resumePrompt = null,
  onResumeConfirm,
  onResumeRestart,
  onResumeDismiss,
  onProgressSave,
  onEnded,
  onNextEpisode,
  onPrevEpisode,
  hasNext,
  hasPrev
}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const plyrRef = useRef(null);
  const hasSeekedRef = useRef(false);
  const lastSavedAtRef = useRef(0);
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

  // Reset seek tracker when source changes
  useEffect(() => {
    hasSeekedRef.current = false;
    lastSavedAtRef.current = 0;
  }, [source]);

  // Initialize Plyr + Hls.js when source changes
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

    const basePlyrOptions = {
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'duration',
        'mute',
        'volume',
        'settings',
        'pip',
        'airplay',
        'fullscreen'
      ],
      settings: ['quality', 'speed'],
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
      keyboard: { focused: true, global: false },
      i18n: {
        speed: 'Tốc độ',
        normal: 'Bình thường',
        quality: 'Chất lượng',
        qualityLabel: { 0: 'Tự động' }
      }
    };

    const initPlyr = (extraOptions = {}) => {
      if (plyrRef.current) {
        plyrRef.current.destroy();
        plyrRef.current = null;
      }
      plyrRef.current = new Plyr(video, { ...basePlyrOptions, ...extraOptions });
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
        const levels = hls.levels || [];
        const uniqueHeights = [...new Set(levels.map((l) => l.height).filter(Boolean))].sort((a, b) => b - a);

        if (uniqueHeights.length > 1) {
          initPlyr({
            quality: {
              default: 0,
              options: [0, ...uniqueHeights],
              forced: true,
              onChange: (newQuality) => {
                if (newQuality === 0) {
                  hls.currentLevel = -1;
                } else {
                  const idx = hls.levels.findIndex((l) => l.height === newQuality);
                  if (idx !== -1) hls.currentLevel = idx;
                }
              }
            }
          });
        } else {
          initPlyr({ settings: ['speed'] });
        }

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
      initPlyr({ settings: ['speed'] });
      video.src = source;
      const onLoadedMeta = () => {
        applyInitialSeek();
        video.play().catch(() => {});
      };
      video.addEventListener('loadedmetadata', onLoadedMeta, { once: true });
    }

    return () => {
      triggerProgressSave();
      if (plyrRef.current) {
        plyrRef.current.destroy();
        plyrRef.current = null;
      }
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
          playsInline
          poster={poster}
          onTimeUpdate={handleTimeUpdate}
          onPause={triggerProgressSave}
          onEnded={handleVideoEnded}
        />

        {resumePrompt && (
          <div className="vf-resume-toast" role="dialog" aria-label="Xác nhận xem tiếp">
            <div className="d-flex align-items-start justify-content-between gap-2">
              <div style={{ fontSize: '13.5px', lineHeight: '1.45' }}>
                <i className="fa-solid fa-clock-rotate-left text-cyan me-2" />
                Bạn đã xem <strong>{resumePrompt.episodeName}</strong> đến{' '}
                <strong className="text-cyan">{resumePrompt.formattedTime}</strong>. Bạn muốn xem tiếp chứ?
              </div>
              <button
                type="button"
                className="vf-toast-close"
                onClick={onResumeDismiss}
                aria-label="Đóng"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="vf-resume-actions">
              <button
                type="button"
                className="vf-resume-btn-primary"
                onClick={onResumeConfirm}
              >
                <i className="fa-solid fa-play me-1" /> Xem tiếp ({resumePrompt.formattedTime})
              </button>
              <button
                type="button"
                className="vf-resume-btn-secondary"
                onClick={onResumeRestart}
              >
                Xem từ đầu
              </button>
            </div>
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
