# Steam Integration Setup

## Your Steam Profile
- **Profile URL**: https://steamcommunity.com/id/eveeleevi/
- **Username**: eveeleevi
- **Level**: 101
- **Location**: Aomori, Japan
- **Badges**: 123
- **Profile Awards**: 2
- **Reviews**: 17

## Setup Instructions

### 1. Get Your Steam API Key
1. Go to https://steamcommunity.com/dev/apikey
2. Sign in with your Steam account
3. Register your domain to get an API key

### 2. Find Your Steam ID
1. Go to https://steamid.io/
2. Enter your profile URL: `https://steamcommunity.com/id/eveeleevi/`
3. Copy the 64-bit Steam ID

### 3. Configure Environment Variables
Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_STEAM_API_KEY=your_api_key_here
```

### 4. Update Steam ID in Code
In `app/SteamPresence.tsx`, replace the placeholder Steam ID:
```typescript
const STEAM_ID = "your_64_bit_steam_id_here";
```

### 5. Make Profile Public
1. Go to your Steam profile settings
2. Set profile visibility to "Public"
3. Enable "Game details" to be visible to everyone

## Features Added
- ✅ Profile picture from Steam
- ✅ Steam level (101)
- ✅ Country (Japan 🇯🇵)
- ✅ Friends count
- ✅ Current game status
- ✅ Recent games with playtime
- ✅ Steam stats (badges, reviews, etc.)
- ✅ Clickable Steam panel
- ✅ Real-time status updates

## API Endpoints Used
- `GetPlayerSummaries` - Profile data, avatar, country
- `GetFriendList` - Friends count
- `GetRecentlyPlayedGames` - Recent games and playtime

Your Steam integration is now ready! The profile will display your real Steam data once configured.


