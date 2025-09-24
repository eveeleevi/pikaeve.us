"use client";

import React from "react";
import { FaTimes } from "react-icons/fa";
import { useImageConfig } from "./ImageConfig";
import { useColorConfig } from "./ColorConfig";

type LanyardDiscordUser = {
  discord_user: {
    id: string;
    username: string;
    discriminator: string;
    global_name?: string | null;
    avatar?: string | null;
    banner?: string | null;
    bio?: string | null;
    public_flags?: number;
  };
  listening_to_spotify: boolean;
  spotify?: {
    track_id: string;
    song: string;
    artist: string;
    album: string;
    album_art_url: string;
    timestamps?: { start?: number; end?: number } | null;
  } | null;
  activities: Array<{
    id: string;
    name: string;
    state?: string;
    details?: string;
    application_id?: string;
    type: number;
    timestamps?: { start?: number; end?: number };
    assets?: { large_image?: string; large_text?: string; small_image?: string; small_text?: string };
  }>;
  discord_status: "online" | "idle" | "dnd" | "offline";
};

const DISCORD_ID = "1313015584291557388";

function getLanyardGatewayUrl(userId: string) {
  const params = new URLSearchParams({ v: "1", encoding: "json" });
  return `wss://api.lanyard.rest/socket?${params.toString()}`;
}

function getCdnAvatarUrl(userId: string, avatar: string | null | undefined) {
  if (!avatar) return null;
  const ext = avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.${ext}?size=128`;
}

function getCdnBannerUrl(userId: string, banner: string | null | undefined) {
  if (!banner) return null;
  const ext = banner.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/banners/${userId}/${banner}.${ext}?size=512`;
}


interface DiscordPresenceProps {
  onUsernameClick?: (discordData: { banner: string | null; bio: string | null; username: string; status: string; avatar: string | null }) => void;
}

export default function DiscordPresence({ onUsernameClick }: DiscordPresenceProps) {
  const [presence, setPresence] = React.useState<LanyardDiscordUser | null>(null);
  const { config } = useImageConfig();
  const { colorConfig } = useColorConfig();
  const [connected, setConnected] = React.useState(false);
  const [trackingError, setTrackingError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let ws: WebSocket | null = null;
    let heartbeat: number | null = null;
    let heartbeatInterval = 30000;

    function extractPresenceFromPayload(payload: unknown): LanyardDiscordUser | null {
      // Lanyard can send { d: {...} } or { d: { data: {...} } }
      const payloadObj = payload as { d?: unknown };
      const inner = payloadObj?.d ?? payload;
      const innerObj = inner as { data?: unknown };
      const maybe = innerObj?.data ?? inner;
      if (maybe && typeof maybe === "object" && "discord_user" in maybe) return maybe as LanyardDiscordUser;
      return null;
    }

    async function checkTrackedViaRest() {
      try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`, { cache: "no-store" });
        const json = await res.json();
        if (json?.success) {
          setTrackingError(null);
          const p = json?.data as LanyardDiscordUser;
          if (p && p.discord_user) setPresence(p);
        } else {
          setTrackingError("User is not tracked by Lanyard. Join their Discord server.");
        }
      } catch (e) {
        // Network errors are non-fatal; socket may still succeed
      }
    }

    function connect() {
      ws = new WebSocket(getLanyardGatewayUrl(DISCORD_ID));

      ws.onopen = () => {
        setConnected(true);
      };

      ws.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        const { op, d, t } = payload;

        if (op === 1) {
          // Hello
          heartbeatInterval = d.heartbeat_interval ?? 30000;
          ws?.send(
            JSON.stringify({
              op: 2,
              d: { subscribe_to_id: DISCORD_ID },
            })
          );
          if (heartbeat) window.clearInterval(heartbeat);
          heartbeat = window.setInterval(() => {
            ws?.send(JSON.stringify({ op: 3 }));
          }, heartbeatInterval);
          return;
        }

        if (op === 0 && t === "INIT_STATE") {
          const p = extractPresenceFromPayload({ d });
          if (p) setPresence(p);
          return;
        }

        if (op === 0 && t === "PRESENCE_UPDATE") {
          const p = extractPresenceFromPayload({ d });
          if (p) setPresence(p);
          return;
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (heartbeat) window.clearInterval(heartbeat);
        // Retry after short delay
        setTimeout(connect, 2000);
      };
      ws.onerror = () => {
        ws?.close();
      };
    }

    checkTrackedViaRest();
    connect();

    return () => {
      if (heartbeat) window.clearInterval(heartbeat);
      ws?.close();
    };
  }, []);

  const username = presence?.discord_user?.global_name || presence?.discord_user?.username;
  const avatarUrl = getCdnAvatarUrl(presence?.discord_user?.id || DISCORD_ID, presence?.discord_user?.avatar ?? null);
  const status = presence?.discord_status ?? "offline";
  const spotify = presence?.listening_to_spotify ? presence?.spotify : null;
  const [now, setNow] = React.useState<number>(() => Date.now());
  React.useEffect(() => {
    if (!spotify?.timestamps?.start || !spotify?.timestamps?.end) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [spotify?.timestamps?.start, spotify?.timestamps?.end]);

  function formatTime(ms: number) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
  const playingActivity = React.useMemo(() => {
    const list = presence?.activities || [];
    // Type 0 = Playing
    const playing = list.find((a) => a?.type === 0 && a?.name);
    if (!playing) return null;
    const startedAt = playing.timestamps?.start ? new Date(playing.timestamps.start) : null;
    return {
      name: playing.name,
      details: playing.details,
      state: playing.state,
      startedAt,
    };
  }, [presence?.activities]);

  function formatElapsed(start: Date | null) {
    if (!start) return null;
    const ms = Date.now() - start.getTime();
    if (ms < 0) return null;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }

  const statusColor = {
    online: "#22c55e",
    idle: "#f59e0b",
    dnd: "#ef4444",
    offline: "#6b7280",
  }[status];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <img
          src={avatarUrl || "/vercel.svg"}
          alt={username || "Discord avatar"}
          className="w-8 h-8 rounded-full object-cover"
        />
        <span
          title={status}
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-white dark:border-gray-900"
          style={{ backgroundColor: statusColor }}
        />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <div 
            className="text-sm font-medium cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            style={{ color: colorConfig?.discordUserText || '#000000' }}
            onClick={() => {
              if (onUsernameClick && presence) {
                const bannerUrl = getCdnBannerUrl(presence.discord_user.id, presence.discord_user.banner);
                onUsernameClick({
                  banner: bannerUrl,
                  bio: presence.discord_user.bio || null,
                  username: username || "Loading...",
                  status: status,
                  avatar: avatarUrl
                });
              }
            }}
          >
            {username || "Loading..."}
          </div>
          {/* Custom Badges */}
          <div className="flex items-center gap-1 ml-1">
            <div className="relative group">
              <img
                src={config.peakMusicBadge}
                alt="Badge 1"
                className="w-4 h-4 rounded-sm"
              />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                peak music
              </div>
            </div>
            <div className="relative group">
              <img
                src={config.notoriousBadge}
                alt="Badge 2"
                className="w-4 h-4 rounded-sm"
              />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                Notorious
              </div>
            </div>
            <div className="relative group">
              <img
                src={config.touhouBadge}
                alt="Touhou Cirno"
                className="w-4 h-4 rounded-sm"
              />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                nonononono
              </div>
            </div>
            <div className="relative group">
              <img
                src="/1-237fdf5a7336cc9619b248dabd856ef696e56e78.gif"
                alt="Eevee Badge"
                className="w-4 h-4 rounded-sm"
              />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                eevee
              </div>
            </div>
          </div>
        </div>
        {trackingError ? (
          <div className="text-xs text-red-600 dark:text-red-400">
            {trackingError} —
            <a
              className="underline ml-1"
              href="https://discord.com/invite/lanyard"
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Lanyard
            </a>
          </div>
        ) : spotify ? (
          <div className="text-xs" style={{ color: colorConfig?.discordBioText || '#6b7280' }}>
            <div>♪ {spotify.song} — {spotify.artist}</div>
          </div>
        ) : playingActivity ? (
          <div className="text-xs" style={{ color: colorConfig?.discordBioText || '#6b7280' }}>
            🎮 {playingActivity.name}
            {playingActivity.details && ` — ${playingActivity.details}`}
          </div>
        ) : (
          <div className="text-xs capitalize" style={{ color: colorConfig?.discordBioText || '#6b7280' }}>{status}</div>
        )}
      </div>
    </div>
  );
}


