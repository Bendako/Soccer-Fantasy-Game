import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Real player image URLs from various sources
const playerImageUrls: Record<string, string> = {
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

  // Chelsea
  "Cole Palmer": "https://resources.premierleague.com/premierleague/photos/players/250x250/p247632.png",
  "Nicolas Jackson": "https://resources.premierleague.com/premierleague/photos/players/250x250/p482719.png",
  "Enzo Fernández": "https://resources.premierleague.com/premierleague/photos/players/250x250/p240270.png",
  "Robert Sánchez": "https://resources.premierleague.com/premierleague/photos/players/250x250/p182930.png",
  "Thiago Silva": "https://resources.premierleague.com/premierleague/photos/players/250x250/p12496.png",
  "Reece James": "https://resources.premierleague.com/premierleague/photos/players/250x250/p204485.png",
  "Ben Chilwell": "https://resources.premierleague.com/premierleague/photos/players/250x250/p99678.png",
  "Conor Gallagher": "https://resources.premierleague.com/premierleague/photos/players/250x250/p221482.png",

  // Tottenham
  "Son Heung-min": "https://resources.premierleague.com/premierleague/photos/players/250x250/p85971.png",
  "James Maddison": "https://resources.premierleague.com/premierleague/photos/players/250x250/p121160.png",
  "Dejan Kulusevski": "https://resources.premierleague.com/premierleague/photos/players/250x250/p243784.png",
  "Guglielmo Vicario": "https://resources.premierleague.com/premierleague/photos/players/250x250/p207553.png",
  "Cristian Romero": "https://resources.premierleague.com/premierleague/photos/players/250x250/p204932.png",
  "Micky van de Ven": "https://resources.premierleague.com/premierleague/photos/players/250x250/p272728.png",
  "Pedro Porro": "https://resources.premierleague.com/premierleague/photos/players/250x250/p219697.png",
  "Yves Bissouma": "https://resources.premierleague.com/premierleague/photos/players/250x250/p169187.png",

  // Newcastle
  "Alexander Isak": "https://resources.premierleague.com/premierleague/photos/players/250x250/p188567.png",
  "Bruno Guimarães": "https://resources.premierleague.com/premierleague/photos/players/250x250/p215498.png",
  "Nick Pope": "https://resources.premierleague.com/premierleague/photos/players/250x250/p98950.png",
  "Kieran Trippier": "https://resources.premierleague.com/premierleague/photos/players/250x250/p92134.png",

  // Brighton
  "Kaoru Mitoma": "https://resources.premierleague.com/premierleague/photos/players/250x250/p447325.png",
  "Pascal Groß": "https://resources.premierleague.com/premierleague/photos/players/250x250/p110979.png",
  "Jason Steele": "https://resources.premierleague.com/premierleague/photos/players/250x250/p66015.png",
  "Lewis Dunk": "https://resources.premierleague.com/premierleague/photos/players/250x250/p78830.png",

  // Aston Villa
  "Ollie Watkins": "https://resources.premierleague.com/premierleague/photos/players/250x250/p183853.png",
  "John McGinn": "https://resources.premierleague.com/premierleague/photos/players/250x250/p146907.png",
  "Emiliano Martínez": "https://resources.premierleague.com/premierleague/photos/players/250x250/p107373.png",
  "Ezri Konsa": "https://resources.premierleague.com/premierleague/photos/players/250x250/p184135.png",

  // West Ham
  "Jarrod Bowen": "https://resources.premierleague.com/premierleague/photos/players/250x250/p133449.png",
  "Lucas Paquetá": "https://resources.premierleague.com/premierleague/photos/players/250x250/p170848.png",
  "Alphonse Areola": "https://resources.premierleague.com/premierleague/photos/players/250x250/p91969.png",
  "Kurt Zouma": "https://resources.premierleague.com/premierleague/photos/players/250x250/p78830.png",
};

// Function to generate fallback image URLs
function generateFallbackImageUrls(playerName: string): string[] {
  const nameForUrl = playerName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const firstName = playerName.split(' ')[0];
  const lastName = playerName.split(' ').slice(-1)[0];
  
  return [
    // UI Avatars - always works
    `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=0D8ABC&color=fff&size=256&font-size=0.6&rounded=true`,
    
    // Boring Avatars - deterministic and always works
    `https://source.boringavatars.com/marble/256/${playerName}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`,
    
    // DiceBear - avatar generation service
    `https://avatars.dicebear.com/api/male/${nameForUrl}.svg`,
    
    // Generic sports placeholder
    `https://via.placeholder.com/256x256/0D8ABC/FFFFFF?text=${firstName}+${lastName}`,
  ];
}

export const updateAllPlayerImages = mutation({
  args: {},
  handler: async (ctx) => {
    const players = await ctx.db.query("players").collect();
    let updatedCount = 0;
    
    for (const player of players) {
      // Skip if player already has an image
      if (player.imageUrl) {
        continue;
      }

      let imageUrl: string | null = null;

      // First, try to get a real player image
      if (playerImageUrls[player.name]) {
        imageUrl = playerImageUrls[player.name];
      } else {
        // Use fallback generation
        const fallbackUrls = generateFallbackImageUrls(player.name);
        imageUrl = fallbackUrls[0]; // Use the first fallback (UI Avatars)
      }

      if (imageUrl) {
        await ctx.db.patch(player._id, {
          imageUrl,
          updatedAt: Date.now(),
        });
        updatedCount++;
      }
    }

    return { 
      message: `Updated ${updatedCount} players with images`,
      totalPlayers: players.length 
    };
  },
});

export const updateSpecificPlayerImage = mutation({
  args: {
    playerName: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("players")
      .filter((q) => q.eq(q.field("name"), args.playerName))
      .first();

    if (!player) {
      throw new Error(`Player ${args.playerName} not found`);
    }

    await ctx.db.patch(player._id, {
      imageUrl: args.imageUrl,
      updatedAt: Date.now(),
    });

    return player._id;
  },
}); 