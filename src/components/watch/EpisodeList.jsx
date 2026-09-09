import React, { useState } from 'react';

export function EpisodeList({ servers = [], currentServer = 0, currentEpisode = 0, onSelectEpisode }) {
  const [selectedServer, setSelectedServer] = useState(currentServer);

  if (!servers || servers.length === 0) {
    return (
      <div className="episodes-card">
        <h3 style={{ fontSize: '18px', color: 'var(--text-white)', margin: 0 }}>Danh sách tập</h3>
        <p className="text-muted mt-3 mb-0">Đang cập nhật tập phim...</p>
      </div>
    );
  }

  const serverData = servers[selectedServer]?.server_data || [];

  return (
    <div className="episodes-card">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <h3 style={{ fontSize: '18px', color: 'var(--text-white)', margin: 0 }}>
          <i className="fa-solid fa-list-ol me-2 text-cyan" />
          Danh Sách Tập ({serverData.length} tập)
        </h3>

        {/* Multiple Servers selector */}
        {servers.length > 1 && (
          <div className="d-flex gap-2">
            {servers.map((srv, idx) => (
              <button
                key={srv.server_name || idx}
                className={`player-ctrl-btn ${idx === selectedServer ? 'active' : ''}`}
                onClick={() => setSelectedServer(idx)}
              >
                {srv.server_name || `Server ${idx + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="episodes-grid">
        {serverData.map((ep, idx) => {
          const isActive = idx === currentEpisode && selectedServer === currentServer;
          return (
            <button
              key={ep.slug || idx}
              className={`episode-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectEpisode(selectedServer, idx)}
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
