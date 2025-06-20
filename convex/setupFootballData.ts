import { action } from "./_generated/server";
import { api } from "./_generated/api";

interface Competition {
  id: number;
  name: string;
  code: string;
  area: {
    name: string;
  };
}

interface FetchCompetitionsResult {
  competitions: Competition[];
}

interface FetchTeamsResult {
  success: boolean;
  message: string;
  teamsCount: number;
}

// Known player image URLs from Premier League
const PLAYER_IMAGE_MAP: Record<string, string> = {
  // Manchester City
  "Erling Haaland": "https://resources.premierleague.com/premierleague/photos/players/250x250/p223094.png",
  "Kevin De Bruyne": "https://resources.premierleague.com/premierleague/photos/players/250x250/p61366.png",
  "Phil Foden": "https://resources.premierleague.com/premierleague/photos/players/250x250/p241641.png",
  "Ederson": "https://resources.premierleague.com/premierleague/photos/players/250x250/p121160.png",
  "Ruben Dias": "https://resources.premierleague.com/premierleague/photos/players/250x250/p178315.png",
  "John Stones": "https://resources.premierleague.com/premierleague/photos/players/250x250/p78830.png",
  "Bernardo Silva": "https://resources.premierleague.com/premierleague/photos/players/250x250/p108980.png",
  "Rodri": "https://resources.premierleague.com/premierleague/photos/players/250x250/p186591.png",

  // Arsenal
  "Bukayo Saka": "https://resources.premierleague.com/premierleague/photos/players/250x250/p244851.png",
  "Martin Ødegaard": "https://resources.premierleague.com/premierleague/photos/players/250x250/p186477.png",
  "Gabriel Jesus": "https://resources.premierleague.com/premierleague/photos/players/250x250/p161189.png",
  "Aaron Ramsdale": "https://resources.premierleague.com/premierleague/photos/players/250x250/p161699.png",
  "William Saliba": "https://resources.premierleague.com/premierleague/photos/players/250x250/p226597.png",
  "Gabriel Magalhães": "https://resources.premierleague.com/premierleague/photos/players/250x250/p179784.png",
  "Declan Rice": "https://resources.premierleague.com/premierleague/photos/players/250x250/p170899.png",
  "Kai Havertz": "https://resources.premierleague.com/premierleague/photos/players/250x250/p182539.png",

  // Liverpool
  "Mohamed Salah": "https://resources.premierleague.com/premierleague/photos/players/250x250/p118748.png",
  "Virgil van Dijk": "https://resources.premierleague.com/premierleague/photos/players/250x250/p97032.png",
  "Sadio Mané": "https://resources.premierleague.com/premierleague/photos/players/250x250/p95685.png",
  "Alisson": "https://resources.premierleague.com/premierleague/photos/players/250x250/p116556.png",
  "Andrew Robertson": "https://resources.premierleague.com/premierleague/photos/players/250x250/p95748.png",
  "Trent Alexander-Arnold": "https://resources.premierleague.com/premierleague/photos/players/250x250/p156074.png",
  "Jordan Henderson": "https://resources.premierleague.com/premierleague/photos/players/250x250/p23889.png",
  "Darwin Núñez": "https://resources.premierleague.com/premierleague/photos/players/250x250/p248047.png",

  // Manchester United
  "Marcus Rashford": "https://resources.premierleague.com/premierleague/photos/players/250x250/p176297.png",
  "Bruno Fernandes": "https://resources.premierleague.com/premierleague/photos/players/250x250/p141746.png",
  "Casemiro": "https://resources.premierleague.com/premierleague/photos/players/250x250/p27707.png",
  "André Onana": "https://resources.premierleague.com/premierleague/photos/players/250x250/p143077.png",
  "Lisandro Martínez": "https://resources.premierleague.com/premierleague/photos/players/250x250/p194001.png",
  "Raphaël Varane": "https://resources.premierleague.com/premierleague/photos/players/250x250/p37164.png",
  "Luke Shaw": "https://resources.premierleague.com/premierleague/photos/players/250x250/p90753.png",
  "Antony": "https://resources.premierleague.com/premierleague/photos/players/250x250/p253905.png",
};

// Generate fallback image URL for any player
function generateFallbackImageUrl(playerName: string): string {
  const firstName = playerName.split(' ')[0];
  const lastName = playerName.split(' ').slice(-1)[0];
  return `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=0D8ABC&color=fff&size=256&font-size=0.6&rounded=true`;
}

// Action to check API status
export const checkAPIStatus = action({
  args: {},
  handler: async (ctx): Promise<{
    status: "connected" | "error";
    message: string;
    competitions?: Competition[];
  }> => {
    try {
      const result: FetchCompetitionsResult = await ctx.runAction(api.dataFetching.fetchCompetitions);
      return {
        status: "connected" as const,
        message: "Football-data.org API is working",
        competitions: result.competitions
      };
    } catch (error: unknown) {
      return {
        status: "error" as const,
        message: error instanceof Error ? error.message : "Unknown error"
      };
    }
  },
});

// Simple setup action to fetch Premier League data
export const setupPremierLeague = action({
  args: {},
  handler: async (ctx): Promise<{
    success: boolean;
    message?: string;
    teamsCount?: number;
    error?: string;
  }> => {
    console.log("🚀 Setting up Premier League data from Football-data.org...");

    try {
      // First test API connection
      console.log("📡 Testing API connection...");
      await ctx.runAction(api.dataFetching.fetchCompetitions);
      console.log("✅ API connection successful");

      // Fetch Premier League teams
      console.log("📥 Fetching Premier League teams...");
      const result: FetchTeamsResult = await ctx.runAction(api.dataFetching.fetchTeamsForLeague, {
        league: "premier_league",
      });

      console.log("🎉 Premier League setup completed!");
      return {
        success: true,
        message: `Successfully set up Premier League: ${result.message}`,
        teamsCount: result.teamsCount
      };

    } catch (error: unknown) {
      console.error("❌ Setup failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  },
});

// Simple action to update all player images
export const updateAllPlayerImages = action({
  args: {},
  handler: async (ctx): Promise<{
    success: boolean;
    message?: string;
    updatedCount?: number;
    error?: string;
  }> => {
    console.log("🖼️ Updating all player images...");

    try {
      const result: {
        success: boolean;
        message: string;
        updatedCount: number;
      } = await ctx.runAction(api.dataFetching.updatePlayerImages);

      console.log("🎉 Player images update completed!");
      return {
        success: true,
        message: result.message,
        updatedCount: result.updatedCount
      };

    } catch (error: unknown) {
      console.error("❌ Image update failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  },
});

// Action to fix current player images with real URLs
export const fixCurrentPlayerImages = action({
  args: {},
  handler: async (ctx): Promise<{
    success: boolean;
    message?: string;
    updatedCount?: number;
    error?: string;
  }> => {
    console.log("🖼️ Fixing current player images with real URLs...");

    try {
      const players = await ctx.runQuery(api.players.getAllPlayers);
      
      let updatedCount = 0;
      
      for (const player of players) {
        try {
          // Get real image URL or fallback
          const realImageUrl = PLAYER_IMAGE_MAP[player.name] || generateFallbackImageUrl(player.name);
          
          // Update the player using the players.updatePlayerStats mutation
          await ctx.runMutation(api.players.updatePlayerStats, {
            playerId: player._id as any,
            imageUrl: realImageUrl,
          });
          
          updatedCount++;
          console.log(`Updated ${player.name} with image URL`);
        } catch (error) {
          console.warn(`Failed to update image for player ${player.name}:`, error);
        }
      }
      
      console.log("🎉 Player images fix completed!");
      return {
        success: true,
        message: `Fixed ${updatedCount} players with proper image URLs`,
        updatedCount
      };

    } catch (error: unknown) {
      console.error("❌ Image fix failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  },
}); 