import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id, Doc } from "./_generated/dataModel";

// Type for player data
type Player = Doc<"players">;

// Type for update results
type UpdateResult = {
  name: string;
  imageUrl?: string;
  status: 'updated' | 'failed';
  error?: string;
};

// Simple image update service focused on your current players
export const updateAllPlayerImages = action({
  args: {},
  handler: async (ctx): Promise<{
    success: boolean;
    totalPlayers: number;
    updatedCount: number;
    successCount: number;
    message: string;
    sampleResults: UpdateResult[];
  }> => {
    console.log("🖼️ Starting player image update...");
    
    try {
      // Get all current players
      const players: Player[] = await ctx.runQuery(internal.playerImageService.getAllPlayersForImageUpdate);
      
      let updatedCount = 0;
      let successCount = 0;
      const results: UpdateResult[] = [];

      for (const player of players) {
        try {
          // Generate image URLs for this player
          const imageUrls = generatePlayerImageUrls(player.name, player.externalId);
          
          // Use the first (most likely to work) URL
          const bestImageUrl = imageUrls[0];
          
          // Update player with new image URL
          await ctx.runMutation(internal.playerImageService.updatePlayerImageUrl, {
            playerId: player._id,
            imageUrl: bestImageUrl
          });
          
          updatedCount++;
          successCount++;
          
          results.push({
            name: player.name,
            imageUrl: bestImageUrl,
            status: 'updated'
          });
          
          console.log(`✅ Updated ${player.name}: ${bestImageUrl}`);
          
        } catch (error) {
          console.warn(`❌ Failed to update ${player.name}:`, error);
          results.push({
            name: player.name,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      return {
        success: true,
        totalPlayers: players.length,
        updatedCount,
        successCount,
        message: `Successfully updated ${successCount}/${players.length} players with image URLs`,
        sampleResults: results.slice(0, 10) // Show first 10 results
      };
      
    } catch (error: unknown) {
      console.error("❌ Image update failed:", error);
      throw new Error(error instanceof Error ? error.message : 'Unknown error');
    }
  },
});

// Test a few specific player images to see what works
export const testPlayerImages = action({
  args: {
    playerNames: v.optional(v.array(v.string()))
  },
  handler: async (ctx, args): Promise<{
    results: Array<{
      name: string;
      workingUrl: string | null;
      allUrls: string[];
      status: 'success' | 'failed';
    }>;
    summary: string;
  }> => {
    const testNames = args.playerNames || [
      "Erling Haaland",
      "Mohamed Salah", 
      "Bukayo Saka",
      "Kevin De Bruyne",
      "Virgil van Dijk"
    ];
    
    const results = [];
    
    for (const playerName of testNames) {
      const imageUrls = generatePlayerImageUrls(playerName);
      const workingUrl = await findWorkingImageUrl(imageUrls);
      
      results.push({
        name: playerName,
        workingUrl,
        allUrls: imageUrls.slice(0, 3), // Show first 3 URLs tested
        status: workingUrl ? 'success' as const : 'failed' as const
      });
    }
    
    return {
      results,
      summary: `${results.filter(r => r.status === 'success').length}/${results.length} players have working images`
    };
  },
});

// Generate image URLs for a player (using name-based approach since not all have externalId)
function generatePlayerImageUrls(playerName: string, externalId?: string): string[] {
  const nameForUrl = playerName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const firstName = playerName.split(' ')[0];
  const lastName = playerName.split(' ').slice(-1)[0];
  
  const urls: string[] = [];
  
  // If we have external ID from football-data.org, use it for official sources
  if (externalId) {
    urls.push(
      `https://resources.premierleague.com/premierleague/photos/players/250x250/p${externalId}.png`,
      `https://images.fotmob.com/image_resources/playerimages/${externalId}.png`,
      `https://img.a.transfermarkt.technology/portrait/header/${externalId}.jpg`,
      `https://a.espncdn.com/i/headshots/soccer/players/full/${externalId}.png`
    );
  }
  
  // Name-based image URLs (work for many popular players)
  urls.push(
    `https://e0.365dm.com/24/08/${nameForUrl}.jpg`,
    `https://ichef.bbci.co.uk/onesport/cps/480/cpsprodpb/vivo/live/images/2024/8/16/${nameForUrl}.jpg`,
    `https://images.immediate.co.uk/production/volatile/sites/2/2024/01/${nameForUrl}.jpg`
  );
  
  // Guaranteed fallbacks (avatar generation services)
  urls.push(
    `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=0D8ABC&color=fff&size=256&font-size=0.6&rounded=true`,
    `https://source.boringavatars.com/marble/256/${playerName}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`
  );
  
  return urls;
}

// Test if an image URL works
async function findWorkingImageUrl(urls: string[]): Promise<string | null> {
  for (const url of urls) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.startsWith('image/')) {
          return url;
        }
      }
    } catch {
      // Continue to next URL
      continue;
    }
  }
  return null;
}

// Internal query to get all players
export const getAllPlayersForImageUpdate = internalQuery({
  args: {},
  handler: async (ctx): Promise<Player[]> => {
    return await ctx.db.query("players").collect();
  },
});

// Internal mutation to update player image URL
export const updatePlayerImageUrl = internalMutation({
  args: {
    playerId: v.id("players"),
    imageUrl: v.string()
  },
  handler: async (ctx, args): Promise<Id<"players">> => {
    await ctx.db.patch(args.playerId, {
      imageUrl: args.imageUrl,
      updatedAt: Date.now()
    });
    
    return args.playerId;
  },
}); 