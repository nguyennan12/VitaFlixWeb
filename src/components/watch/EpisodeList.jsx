import React from 'react';

function getServerAudioMeta(serverName = '', index = 0) {
  const lower = serverName.toLowerCase();
  if (lower.includes('lồng tiếng') || lower.includes('long tieng')) {
    return { label: serverName, tag: 'Lồng Tiếng', icon: 'fa-microphone-lines', badgeColor: '#00d4ff' };
  }
  if (lower.includes('thuyết minh') || lower.includes('thuyet minh')) {
    return { label: serverName, tag: 'Thuyết Minh', icon: 'fa-volume-high', badgeColor: '#f59e0b' };
  }
  if (lower.includes('vietsub')) {
    return { label: serverName, tag: 'Vietsub', icon: 'fa-closed-captioning', badgeColor: '#10b981' };
  }
  return { label: serverName || `Server ${index + 1}`, tag: '', icon: 'fa-server', badgeColor: '#94a3b8' };
}

export function EpisodeList({
  servers = [],
  currentServer = 0,
  currentEpisode = 0,
  onSelectEpisode,
  onSelectServer
}) {
  if (!servers || servers.length === 0) {
    return (
      <div className="episodes-card">
        <h3 style={{ fontSize: '18px', color: 'var(--text-white)', margin: 0 }}>Danh sách tập</h3>
        <p className="text-muted mt-3 mb-0">Đang cập nhật tập phim...</p>
      </div>
    );
  }

  const serverData = servers[currentServer]?.server_data || [];

  const handleServerClick = (idx) => {
    if (onSelectServer) {
      onSelectServer(idx);
    } else if (onSelectEpisode) {
      const targetLen = servers[idx]?.server_data?.length || 1;
      const safeEp = Math.min(currentEpisode, targetLen - 1);
      onSelectEpisode(idx, Math.max(0, safeEp));
    }
  };

  return (
    <div className="episodes-card">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <h3 style={{ fontSize: '18px', color: 'var(--text-white)', margin: 0 }}>
          <i className="fa-solid fa-list-ol me-2 text-cyan" />
          Danh Sách Tập ({serverData.length} tập)
        </h3>

        {/* Audio / Server selector (Vietsub / Thuyết Minh / Lồng Tiếng) */}
        <div className="d-flex flex-wrap gap-2">
          {servers.map((srv, idx) => {
            const meta = getServerAudioMeta(srv.server_name, idx);
            const isActive = idx === currentServer;
            return (
              <button
                key={srv.server_name || idx}
                type="button"
                className={`player-ctrl-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleServerClick(idx)}
                title={`Chuyển sang ${meta.label}`}
              >
                <i className={`fa-solid ${meta.icon}`} style={{ color: isActive ? '#121316' : meta.badgeColor }} />
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="episodes-grid">
        {serverData.map((ep, idx) => {
          const isActive = idx === currentEpisode;
          return (
            <button
              key={ep.slug || idx}
              type="button"
              className={`episode-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectEpisode(currentServer, idx)}
              title={ep.filename || ep.name}
            >
              {ep.name || `Tập ${idx + 1}`}
            </button>
          );
        })}
      </div>
    </div>
  );
}
