"use client";

import React from "react";
import { FaSteam, FaGamepad, FaClock, FaTrophy } from "react-icons/fa";
import { useImageConfig } from "./ImageConfig";
import { useColorConfig } from "./ColorConfig";

type SteamUser = {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  personastate: number; // 0=Offline, 1=Online, 2=Busy, 3=Away, 4=Snooze, 5=Looking to trade, 6=Looking to play
  communityvisibilitystate: number;
  profilestate: number;
  lastlogoff: number;
  commentpermission: number;
  realname?: string;
  primaryclanid?: string;
  timecreated?: number;
  gameid?: string;
  gameserverip?: string;
  gameextrainfo?: string;
  loccountrycode?: string;
  locstatecode?: string;
  loccityid?: number;
  level?: number;
};

type SteamFriend = {
  steamid: string;
  relationship: string;
  friend_since: number;
};

type SteamFriendsResponse = {
  friendslist: {
    friends: SteamFriend[];
  };
};

type SteamGame = {
  appid: number;
  name: string;
  playtime_forever: number;
  playtime_2weeks?: number;
  playtime_windows_forever?: number;
  playtime_mac_forever?: number;
  playtime_linux_forever?: number;
  playtime_disconnected?: number;
  rtime_last_played: number;
  playtime_disconnected_forever?: number;
};

type SteamGamesResponse = {
  response: {
    game_count: number;
    games: SteamGame[];
  };
};

interface SteamPresenceProps {
  onUsernameClick: (data: {
    username: string;
    avatar: string | null;
    status: string;
    game?: string;
    playtime?: number;
    level?: number;
    country?: string;
    friendsCount?: number;
  }) => void;
}

const STEAM_API_KEY = process.env.NEXT_PUBLIC_STEAM_API_KEY || "";
const STEAM_ID = "76561198000000000"; // Will be updated with your actual Steam ID

function getSteamStatusText(personastate: number): string {
  switch (personastate) {
    case 0: return "offline";
    case 1: return "online";
    case 2: return "busy";
    case 3: return "away";
    case 4: return "snooze";
    case 5: return "looking to trade";
    case 6: return "looking to play";
    default: return "offline";
  }
}

function getSteamStatusColor(personastate: number): string {
  switch (personastate) {
    case 0: return "#6b7280"; // gray
    case 1: return "#22c55e"; // green
    case 2: return "#ef4444"; // red
    case 3: return "#f59e0b"; // yellow
    case 4: return "#8b5cf6"; // purple
    case 5: return "#3b82f6"; // blue
    case 6: return "#06b6d4"; // cyan
    default: return "#6b7280";
  }
}

function formatPlaytime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else {
    return `${minutes}m`;
  }
}

export default function SteamPresence({ onUsernameClick }: SteamPresenceProps) {
  const { config } = useImageConfig();
  const { colorConfig } = useColorConfig();
  const [steamUser, setSteamUser] = React.useState<SteamUser | null>(null);
  const [recentGames, setRecentGames] = React.useState<SteamGame[]>([]);
  const [friendsCount, setFriendsCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchSteamData() {
      // For now, use mock data since API key isn't configured
      if (!STEAM_API_KEY || STEAM_API_KEY === "your_steam_api_key_here") {
        // Use your actual profile data as fallback
        const mockUser: SteamUser = {
          steamid: "76561198000000000",
          personaname: "I'm not cheating you're just bad", // Your Steam display name
          profileurl: "https://steamcommunity.com/id/eveeleevi/",
          avatar: "/Screenshot 2025-03-27 043442.png",
          avatarmedium: "/Screenshot 2025-03-27 043442.png",
          avatarfull: "/Screenshot 2025-03-27 043442.png",
          personastate: 1, // Online
          communityvisibilitystate: 3,
          profilestate: 1,
          lastlogoff: Date.now() / 1000,
          commentpermission: 1,
          loccountrycode: "JP",
          level: 101
        };
        
        setSteamUser(mockUser);
        setFriendsCount(0); // Will be updated when API is configured
        
        // Mock recent games data
        const mockGames: SteamGame[] = [
          {
            appid: 730,
            name: "Counter-Strike 2",
            playtime_forever: 144, // 2.4 hours
            rtime_last_played: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
          },
          {
            appid: 570,
            name: "Dota 2",
            playtime_forever: 72, // 1.2 hours
            rtime_last_played: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
          },
          {
            appid: 1172470,
            name: "Apex Legends",
            playtime_forever: 48, // 0.8 hours
            rtime_last_played: Math.floor(Date.now() / 1000) - 10800, // 3 hours ago
          }
        ];
        setRecentGames(mockGames);
        
        onUsernameClick({
          username: mockUser.personaname,
          avatar: mockUser.avatarfull,
          status: getSteamStatusText(mockUser.personastate),
          level: mockUser.level,
          country: mockUser.loccountrycode,
          friendsCount: 0,
        });
        
        setLoading(false);
        return;
      }

      try {
        // Fetch user profile
        const userResponse = await fetch(
          `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${STEAM_ID}`
        );
        const userData = await userResponse.json();
        
        if (userData.response.players.length > 0) {
          const user = userData.response.players[0];
          setSteamUser(user);
          
          // Trigger click handler with user data
          onUsernameClick({
            username: user.personaname,
            avatar: user.avatarfull,
            status: getSteamStatusText(user.personastate),
            game: user.gameextrainfo || undefined,
            level: user.level || 101, // Default to your level from profile
            country: user.loccountrycode || "JP", // Default to Japan based on your profile
            friendsCount: friendsCount,
          });
        }

        // Fetch friends list
        try {
          const friendsResponse = await fetch(
            `https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${STEAM_API_KEY}&steamid=${STEAM_ID}&relationship=friend`
          );
          const friendsData: SteamFriendsResponse = await friendsResponse.json();
          
          if (friendsData.friendslist && friendsData.friendslist.friends) {
            setFriendsCount(friendsData.friendslist.friends.length);
          }
        } catch (err) {
          console.log("Could not fetch friends list:", err);
        }

        // Fetch recent games (last 2 weeks)
        const gamesResponse = await fetch(
          `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${STEAM_API_KEY}&steamid=${STEAM_ID}&count=5`
        );
        const gamesData: SteamGamesResponse = await gamesResponse.json();
        
        if (gamesData.response.games) {
          setRecentGames(gamesData.response.games.slice(0, 3));
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching Steam data:", err);
        setError("Failed to load Steam data");
      } finally {
        setLoading(false);
      }
    }

    fetchSteamData();
  }, [onUsernameClick]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <FaSteam className="w-4 h-4" />
        <span>Loading Steam...</span>
      </div>
    );
  }

  if (error || !steamUser) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <FaSteam className="w-4 h-4" />
        <span>Steam unavailable - Check setup</span>
      </div>
    );
  }

  const statusColor = getSteamStatusColor(steamUser.personastate);
  const statusText = getSteamStatusText(steamUser.personastate);

  return (
    <div className="text-sm text-gray-600 dark:text-gray-400">
      <div className="flex items-center gap-2">
        <div className="relative">
          <img
            src={config.steamPfp}
            alt="Steam avatar"
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => {
              // Fallback to Steam icon if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <FaSteam className="w-4 h-4 hidden" />
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusColor }}
          />
          <a 
            href="https://steamcommunity.com/id/eveeleevi/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            style={{ color: `${colorConfig?.steamUserText || '#000000'} !important` }}
          >
            {steamUser.personaname}
          </a>
          {steamUser.gameextrainfo && (
            <span className="text-xs text-gray-500 dark:text-gray-500">
              playing {steamUser.gameextrainfo}
            </span>
          )}
        </div>
      </div>
      <div className="ml-6 text-xs text-gray-500 dark:text-gray-500 mt-1">
        <span>Level {steamUser.level || 101}</span>
        <span className="mx-2">•</span>
        <span>{friendsCount} friends</span>
      </div>
    </div>
  );
}
