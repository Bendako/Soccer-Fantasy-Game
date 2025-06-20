import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

// Type for the player data with external ID
type PlayerWithExternalId = Doc<"players"> & {
  externalId?: string;
};

// Enhanced image update utility that leverages football-data.org IDs
export const updatePlayerImagesWithRealData = action({
  args: { 
    useAlternativeAPIs: v.optional(v.boolean()),
    testUrls: v.optional(v.boolean()) 
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    updatedCount: number;
    totalPlayers: number;
    successfulUrls: string[];
    failedPlayers: string[];
    message: string;
  }> => {
    console.log("🖼️ Starting enhanced player image update...");
    
    try {
      // Get all players with their football-data.org IDs
      const players: PlayerWithExternalId[] = await ctx.runQuery(internal.imageUpdateUtility.getAllPlayersWithExternalIds);
      
      let updatedCount = 0;
      const successfulUrls: string[] = [];
      const failedPlayers: string[] = [];

      for (const player of players) {
        try {
          let bestImageUrl: string | null = null;
          
          // Method 1: Use alternative APIs if enabled
          if (args.useAlternativeAPIs && player.name && player.externalId) {
            bestImageUrl = await fetchFromAlternativeAPIs(player.name, player.externalId);
          }
          
          // Method 2: Generate URLs using football-data.org ID (current smart approach)
          if (!bestImageUrl && player.name && player.externalId) {
            const imageUrls = generateEnhancedImageUrls(player.name, player.externalId);
            
            // Test URLs if requested
            if (args.testUrls) {
              bestImageUrl = await findWorkingImageUrl(imageUrls);
            } else {
              bestImageUrl = imageUrls[0]; // Use first URL (most likely to work)
            }
          }
          
          if (bestImageUrl) {
            await ctx.runMutation(internal.imageUpdateUtility.updatePlayerImage, {
              playerId: player._id,
              imageUrl: bestImageUrl
            });
            
            updatedCount++;
            successfulUrls.push(bestImageUrl);
            console.log(`✅ Updated ${player.name}: ${bestImageUrl}`);
          } else {
            failedPlayers.push(player.name || "Unknown player");
            console.log(`❌ No image found for ${player.name}`);
          }
          
        } catch (error) {
          failedPlayers.push(player.name || "Unknown player");
          console.warn(`Failed to update ${player.name}:`, error);
        }
      }
      
      return {
        success: true,
        updatedCount,
        totalPlayers: players.length,
        successfulUrls: successfulUrls.slice(0, 10), // Sample of successful URLs
        failedPlayers: failedPlayers.slice(0, 10), // Sample of failed players
        message: `Updated ${updatedCount}/${players.length} players with enhanced image URLs`
      };
      
    } catch (error: unknown) {
      console.error("❌ Enhanced image update failed:", error);
      throw new Error(`Failed to update images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
});

// Generate enhanced image URLs using the real football-data.org player ID
function generateEnhancedImageUrls(playerName: string, externalId: string): string[] {
  const nameForUrl = playerName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const firstName = playerName.split(' ')[0];
  const lastName = playerName.split(' ').slice(-1)[0];
  
  return [
    // Premier League official (highest success rate for PL players)
    `https://resources.premierleague.com/premierleague/photos/players/250x250/p${externalId}.png`,
    
    // FotMob (good quality, football-focused)
    `https://images.fotmob.com/image_resources/playerimages/${externalId}.png`,
    
    // Transfermarkt (comprehensive football database)
    `https://img.a.transfermarkt.technology/portrait/header/${externalId}.jpg`,
    
    // ESPN (good for international coverage)
    `https://a.espncdn.com/i/headshots/soccer/players/full/${externalId}.png`,
    
    // Sky Sports (good for Premier League)
    `https://e0.365dm.com/24/08/${nameForUrl}.jpg`,
    
    // BBC Sport
    `https://ichef.bbci.co.uk/onesport/cps/480/cpsprodpb/vivo/live/images/2024/8/16/${nameForUrl}.jpg`,
    
    // Guaranteed fallbacks (avatar services)
    `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=0D8ABC&color=fff&size=256&font-size=0.6&rounded=true`,
    `https://source.boringavatars.com/marble/256/${playerName}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`
  ];
}

// Test image URLs to find working ones
async function findWorkingImageUrl(urls: string[]): Promise<string | null> {
  for (const url of urls) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
        return url;
      }
    } catch {
      // Continue to next URL
      continue;
    }
  }
  return null;
}

// Fetch from alternative APIs (placeholder - implement if needed)
async function fetchFromAlternativeAPIs(_playerName: string, _externalId: string): Promise<string | null> {
  // This would integrate with APIs like RapidAPI or TheSportsDB
  // that actually provide player photos
  return null;
}

// Internal query to get all players with external IDs
export const getAllPlayersWithExternalIds = internalQuery({
  args: {},
  handler: async (ctx): Promise<PlayerWithExternalId[]> => {
    return await ctx.db
      .query("players")
      .filter((q) => q.neq(q.field("externalId"), undefined))
      .collect();
  },
});

// Internal mutation to update player image
export const updatePlayerImage = internalMutation({
  args: {
    playerId: v.id("players"),
    imageUrl: v.string()
  },
  handler: async (ctx, args): Promise<void> => {
    await ctx.db.patch(args.playerId, {
      imageUrl: args.imageUrl,
      updatedAt: Date.now()
    });
  },
}); 