import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Seed data for Premier League teams
const premierLeagueTeams = [
  {
    name: "Manchester City",
    shortName: "MCI",
    league: "premier_league",
    logoUrl: "/team-logos/manchester-city.png",
    colors: { primary: "#6CABDD", secondary: "#1C2C5B" }
  },
  {
    name: "Arsenal",
    shortName: "ARS",
    league: "premier_league", 
    logoUrl: "/team-logos/arsenal.png",
    colors: { primary: "#EF0107", secondary: "#FFFFFF" }
  },
  {
    name: "Liverpool",
    shortName: "LIV",
    league: "premier_league",
    logoUrl: "/team-logos/liverpool.png",
    colors: { primary: "#C8102E", secondary: "#F6EB61" }
  },
  {
    name: "Manchester United",
    shortName: "MUN",
    league: "premier_league",
    logoUrl: "/team-logos/manchester-united.png",
    colors: { primary: "#DA020E", secondary: "#FBE122" }
  },
  {
    name: "Chelsea",
    shortName: "CHE",
    league: "premier_league",
    logoUrl: "/team-logos/chelsea.png",
    colors: { primary: "#034694", secondary: "#FFFFFF" }
  },
  {
    name: "Tottenham Hotspur",
    shortName: "TOT",
    league: "premier_league",
    logoUrl: "/team-logos/tottenham.png",
    colors: { primary: "#132257", secondary: "#FFFFFF" }
  },
  {
    name: "Newcastle United",
    shortName: "NEW",
    league: "premier_league",
    logoUrl: "/team-logos/newcastle.png",
    colors: { primary: "#241F20", secondary: "#FFFFFF" }
  },
  {
    name: "Brighton & Hove Albion",
    shortName: "BHA",
    league: "premier_league",
    logoUrl: "/team-logos/brighton.png",
    colors: { primary: "#0057B7", secondary: "#FFDD00" }
  },
  {
    name: "Aston Villa",
    shortName: "AVL",
    league: "premier_league",
    logoUrl: "/team-logos/aston-villa.png",
    colors: { primary: "#95BFE5", secondary: "#670E36" }
  },
  {
    name: "West Ham United",
    shortName: "WHU",
    league: "premier_league",
    logoUrl: "/team-logos/west-ham.png",
    colors: { primary: "#7A263A", secondary: "#1BB1E7" }
  }
];

// Seed data for Premier League players
const premierLeaguePlayers = [
  // Manchester City
  { name: "Erling Haaland", position: "FWD", team: "Manchester City", jerseyNumber: 9, totalGoals: 36, totalAssists: 8, totalPoints: 272 },
  { name: "Kevin De Bruyne", position: "MID", team: "Manchester City", jerseyNumber: 17, totalGoals: 7, totalAssists: 18, totalPoints: 156 },
  { name: "Phil Foden", position: "MID", team: "Manchester City", jerseyNumber: 47, totalGoals: 19, totalAssists: 8, totalPoints: 174 },
  { name: "Ederson", position: "GK", team: "Manchester City", jerseyNumber: 31, totalGoals: 0, totalAssists: 1, totalPoints: 143 },
  { name: "Ruben Dias", position: "DEF", team: "Manchester City", jerseyNumber: 3, totalGoals: 2, totalAssists: 1, totalPoints: 125 },
  { name: "John Stones", position: "DEF", team: "Manchester City", jerseyNumber: 5, totalGoals: 1, totalAssists: 2, totalPoints: 118 },
  { name: "Bernardo Silva", position: "MID", team: "Manchester City", jerseyNumber: 20, totalGoals: 8, totalAssists: 9, totalPoints: 142 },
  { name: "Rodri", position: "MID", team: "Manchester City", jerseyNumber: 16, totalGoals: 5, totalAssists: 6, totalPoints: 134 },

  // Arsenal
  { name: "Bukayo Saka", position: "MID", team: "Arsenal", jerseyNumber: 7, totalGoals: 16, totalAssists: 9, totalPoints: 168 },
  { name: "Martin Ødegaard", position: "MID", team: "Arsenal", jerseyNumber: 8, totalGoals: 8, totalAssists: 10, totalPoints: 147 },
  { name: "Gabriel Jesus", position: "FWD", team: "Arsenal", jerseyNumber: 9, totalGoals: 11, totalAssists: 8, totalPoints: 134 },
  { name: "Aaron Ramsdale", position: "GK", team: "Arsenal", jerseyNumber: 1, totalGoals: 0, totalAssists: 0, totalPoints: 132 },
  { name: "William Saliba", position: "DEF", team: "Arsenal", jerseyNumber: 12, totalGoals: 2, totalAssists: 1, totalPoints: 128 },
  { name: "Gabriel Magalhães", position: "DEF", team: "Arsenal", jerseyNumber: 6, totalGoals: 4, totalAssists: 1, totalPoints: 119 },
  { name: "Declan Rice", position: "MID", team: "Arsenal", jerseyNumber: 41, totalGoals: 7, totalAssists: 8, totalPoints: 141 },
  { name: "Kai Havertz", position: "MID", team: "Arsenal", jerseyNumber: 29, totalGoals: 13, totalAssists: 7, totalPoints: 139 },

  // Liverpool
  { name: "Mohamed Salah", position: "FWD", team: "Liverpool", jerseyNumber: 11, totalGoals: 25, totalAssists: 13, totalPoints: 211 },
  { name: "Virgil van Dijk", position: "DEF", team: "Liverpool", jerseyNumber: 4, totalGoals: 5, totalAssists: 2, totalPoints: 134 },
  { name: "Sadio Mané", position: "FWD", team: "Liverpool", jerseyNumber: 10, totalGoals: 16, totalAssists: 5, totalPoints: 159 },
  { name: "Alisson", position: "GK", team: "Liverpool", jerseyNumber: 1, totalGoals: 0, totalAssists: 1, totalPoints: 151 },
  { name: "Andrew Robertson", position: "DEF", team: "Liverpool", jerseyNumber: 26, totalGoals: 1, totalAssists: 6, totalPoints: 127 },
  { name: "Trent Alexander-Arnold", position: "DEF", team: "Liverpool", jerseyNumber: 66, totalGoals: 3, totalAssists: 13, totalPoints: 144 },
  { name: "Jordan Henderson", position: "MID", team: "Liverpool", jerseyNumber: 14, totalGoals: 2, totalAssists: 3, totalPoints: 108 },
  { name: "Darwin Núñez", position: "FWD", team: "Liverpool", jerseyNumber: 27, totalGoals: 18, totalAssists: 5, totalPoints: 142 },

  // Manchester United
  { name: "Marcus Rashford", position: "FWD", team: "Manchester United", jerseyNumber: 10, totalGoals: 17, totalAssists: 5, totalPoints: 154 },
  { name: "Bruno Fernandes", position: "MID", team: "Manchester United", jerseyNumber: 18, totalGoals: 14, totalAssists: 13, totalPoints: 172 },
  { name: "Casemiro", position: "MID", team: "Manchester United", jerseyNumber: 18, totalGoals: 5, totalAssists: 5, totalPoints: 118 },
  { name: "André Onana", position: "GK", team: "Manchester United", jerseyNumber: 24, totalGoals: 0, totalAssists: 0, totalPoints: 124 },
  { name: "Lisandro Martínez", position: "DEF", team: "Manchester United", jerseyNumber: 6, totalGoals: 1, totalAssists: 1, totalPoints: 105 },
  { name: "Raphaël Varane", position: "DEF", team: "Manchester United", jerseyNumber: 19, totalGoals: 2, totalAssists: 0, totalPoints: 98 },
  { name: "Luke Shaw", position: "DEF", team: "Manchester United", jerseyNumber: 23, totalGoals: 1, totalAssists: 4, totalPoints: 102 },
  { name: "Antony", position: "MID", team: "Manchester United", jerseyNumber: 21, totalGoals: 8, totalAssists: 3, totalPoints: 89 },

  // Chelsea
  { name: "Cole Palmer", position: "MID", team: "Chelsea", jerseyNumber: 20, totalGoals: 22, totalAssists: 11, totalPoints: 234 },
  { name: "Nicolas Jackson", position: "FWD", team: "Chelsea", jerseyNumber: 15, totalGoals: 14, totalAssists: 5, totalPoints: 126 },
  { name: "Enzo Fernández", position: "MID", team: "Chelsea", jerseyNumber: 8, totalGoals: 3, totalAssists: 4, totalPoints: 94 },
  { name: "Robert Sánchez", position: "GK", team: "Chelsea", jerseyNumber: 1, totalGoals: 0, totalAssists: 0, totalPoints: 98 },
  { name: "Thiago Silva", position: "DEF", team: "Chelsea", jerseyNumber: 6, totalGoals: 2, totalAssists: 1, totalPoints: 112 },
  { name: "Reece James", position: "DEF", team: "Chelsea", jerseyNumber: 24, totalGoals: 2, totalAssists: 5, totalPoints: 89 },
  { name: "Ben Chilwell", position: "DEF", team: "Chelsea", jerseyNumber: 21, totalGoals: 1, totalAssists: 2, totalPoints: 67 },
  { name: "Conor Gallagher", position: "MID", team: "Chelsea", jerseyNumber: 23, totalGoals: 7, totalAssists: 9, totalPoints: 133 },

  // Tottenham
  { name: "Son Heung-min", position: "FWD", team: "Tottenham Hotspur", jerseyNumber: 7, totalGoals: 17, totalAssists: 6, totalPoints: 164 },
  { name: "James Maddison", position: "MID", team: "Tottenham Hotspur", jerseyNumber: 10, totalGoals: 4, totalAssists: 9, totalPoints: 106 },
  { name: "Dejan Kulusevski", position: "MID", team: "Tottenham Hotspur", jerseyNumber: 21, totalGoals: 8, totalAssists: 3, totalPoints: 118 },
  { name: "Guglielmo Vicario", position: "GK", team: "Tottenham Hotspur", jerseyNumber: 1, totalGoals: 0, totalAssists: 1, totalPoints: 134 },
  { name: "Cristian Romero", position: "DEF", team: "Tottenham Hotspur", jerseyNumber: 17, totalGoals: 2, totalAssists: 1, totalPoints: 101 },
  { name: "Micky van de Ven", position: "DEF", team: "Tottenham Hotspur", jerseyNumber: 37, totalGoals: 1, totalAssists: 0, totalPoints: 96 },
  { name: "Pedro Porro", position: "DEF", team: "Tottenham Hotspur", jerseyNumber: 23, totalGoals: 2, totalAssists: 7, totalPoints: 114 },
  { name: "Yves Bissouma", position: "MID", team: "Tottenham Hotspur", jerseyNumber: 8, totalGoals: 1, totalAssists: 4, totalPoints: 89 },

  // Additional teams players (reduced for brevity)
  // Newcastle
  { name: "Alexander Isak", position: "FWD", team: "Newcastle United", jerseyNumber: 14, totalGoals: 21, totalAssists: 2, totalPoints: 174 },
  { name: "Bruno Guimarães", position: "MID", team: "Newcastle United", jerseyNumber: 39, totalGoals: 7, totalAssists: 8, totalPoints: 132 },
  { name: "Nick Pope", position: "GK", team: "Newcastle United", jerseyNumber: 22, totalGoals: 0, totalAssists: 0, totalPoints: 141 },
  { name: "Kieran Trippier", position: "DEF", team: "Newcastle United", jerseyNumber: 2, totalGoals: 1, totalAssists: 7, totalPoints: 119 },

  // Brighton
  { name: "Kaoru Mitoma", position: "MID", team: "Brighton & Hove Albion", jerseyNumber: 22, totalGoals: 7, totalAssists: 2, totalPoints: 98 },
  { name: "Pascal Groß", position: "MID", team: "Brighton & Hove Albion", jerseyNumber: 13, totalGoals: 5, totalAssists: 8, totalPoints: 114 },
  { name: "Jason Steele", position: "GK", team: "Brighton & Hove Albion", jerseyNumber: 23, totalGoals: 0, totalAssists: 1, totalPoints: 126 },
  { name: "Lewis Dunk", position: "DEF", team: "Brighton & Hove Albion", jerseyNumber: 5, totalGoals: 1, totalAssists: 1, totalPoints: 108 },

  // Aston Villa  
  { name: "Ollie Watkins", position: "FWD", team: "Aston Villa", jerseyNumber: 11, totalGoals: 19, totalAssists: 13, totalPoints: 198 },
  { name: "John McGinn", position: "MID", team: "Aston Villa", jerseyNumber: 7, totalGoals: 5, totalAssists: 5, totalPoints: 118 },
  { name: "Emiliano Martínez", position: "GK", team: "Aston Villa", jerseyNumber: 1, totalGoals: 0, totalAssists: 0, totalPoints: 156 },
  { name: "Ezri Konsa", position: "DEF", team: "Aston Villa", jerseyNumber: 4, totalGoals: 3, totalAssists: 1, totalPoints: 112 },

  // West Ham  
  { name: "Jarrod Bowen", position: "MID", team: "West Ham United", jerseyNumber: 20, totalGoals: 16, totalAssists: 6, totalPoints: 156 },
  { name: "Lucas Paquetá", position: "MID", team: "West Ham United", jerseyNumber: 11, totalGoals: 4, totalAssists: 6, totalPoints: 102 },
  { name: "Alphonse Areola", position: "GK", team: "West Ham United", jerseyNumber: 23, totalGoals: 0, totalAssists: 0, totalPoints: 89 },
  { name: "Kurt Zouma", position: "DEF", team: "West Ham United", jerseyNumber: 4, totalGoals: 2, totalAssists: 0, totalPoints: 84 },
];

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // First, clear existing data (optional - be careful with this in production)
    // const existingTeams = await ctx.db.query("realTeams").collect();
    // const existingPlayers = await ctx.db.query("players").collect();
    
    // for (const team of existingTeams) {
    //   await ctx.db.delete(team._id);
    // }
    // for (const player of existingPlayers) {
    //   await ctx.db.delete(player._id);
    // }

    const now = Date.now();
    const teamIdMap = new Map<string, Id<"realTeams">>();

    // Insert teams first
    console.log("Seeding teams...");
    for (const teamData of premierLeagueTeams) {
      const teamId = await ctx.db.insert("realTeams", {
        ...teamData,
        createdAt: now,
        updatedAt: now,
      });
      teamIdMap.set(teamData.name, teamId);
    }

    // Insert players
    console.log("Seeding players...");
    for (const playerData of premierLeaguePlayers) {
      const teamId = teamIdMap.get(playerData.team);
      if (!teamId) {
        console.error(`Team not found: ${playerData.team}`);
        continue;
      }

      const averagePoints = playerData.totalPoints > 0 ? Math.round(playerData.totalPoints / 38) : 0;

      await ctx.db.insert("players", {
        name: playerData.name,
        position: playerData.position,
        realTeamId: teamId,
        imageUrl: `/player-images/${playerData.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
        jerseyNumber: playerData.jerseyNumber,
        injured: false,
        suspended: false,
        totalGoals: playerData.totalGoals,
        totalAssists: playerData.totalAssists,
        totalPoints: playerData.totalPoints,
        averagePoints: averagePoints,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Create a sample gameweek
    console.log("Creating sample gameweek...");
    const gameweekId = await ctx.db.insert("gameweeks", {
      number: 1,
      league: "premier_league",
      season: "2024-25",
      deadline: now + (7 * 24 * 60 * 60 * 1000), // 1 week from now
      status: "upcoming",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    console.log("Database seeded successfully!");
    return {
      teamsCreated: premierLeagueTeams.length,
      playersCreated: premierLeaguePlayers.length,
      gameweekId: gameweekId,
    };
  },
});

// Helper mutation to check if database is already seeded
export const checkSeededData = mutation({
  args: {},
  handler: async (ctx) => {
    const teamCount = await ctx.db.query("realTeams").collect();
    const playerCount = await ctx.db.query("players").collect();
    
    return {
      teams: teamCount.length,
      players: playerCount.length,
      isSeeded: teamCount.length > 0 && playerCount.length > 0,
    };
  },
});

// Helper mutation to clean up duplicate players
export const cleanupDuplicatePlayers = mutation({
  args: {},
  handler: async (ctx) => {
    const allPlayers = await ctx.db.query("players").collect();
    
    // Group players by name and team to find duplicates
    const playerGroups = new Map<string, typeof allPlayers>();
    const duplicatesRemoved: string[] = [];
    
    for (const player of allPlayers) {
      const team = await ctx.db.get(player.realTeamId);
      const key = `${player.name}-${team?.name || 'unknown'}`;
      
      if (!playerGroups.has(key)) {
        playerGroups.set(key, []);
      }
      playerGroups.get(key)!.push(player);
    }
    
    // Remove duplicates (keep the first one, remove the rest)
    for (const [key, players] of playerGroups) {
      if (players.length > 1) {
        console.log(`Found ${players.length} duplicates for ${key}`);
        // Keep the first player, remove the rest
        for (let i = 1; i < players.length; i++) {
          await ctx.db.delete(players[i]._id);
          duplicatesRemoved.push(`${players[i].name} (${players[i]._id})`);
        }
      }
    }
    
    const finalPlayerCount = await ctx.db.query("players").collect();
    
    return {
      duplicatesRemoved: duplicatesRemoved.length,
      removedPlayers: duplicatesRemoved,
      originalCount: allPlayers.length,
      finalCount: finalPlayerCount.length,
    };
  },
});

// Helper query to find duplicate players
export const findDuplicatePlayers = query({
  args: {},
  handler: async (ctx) => {
    const allPlayers = await ctx.db.query("players").collect();
    
    // Group players by name to find duplicates
    const playerGroups = new Map<string, typeof allPlayers>();
    
    for (const player of allPlayers) {
      const team = await ctx.db.get(player.realTeamId);
      const key = `${player.name}-${team?.name || 'unknown'}`;
      
      if (!playerGroups.has(key)) {
        playerGroups.set(key, []);
      }
      playerGroups.get(key)!.push(player);
    }
    
    // Find groups with duplicates
    const duplicates: Array<{key: string, count: number, players: typeof allPlayers}> = [];
    
    for (const [key, players] of playerGroups) {
      if (players.length > 1) {
        duplicates.push({
          key,
          count: players.length,
          players: players.map(p => ({
            ...p,
            realTeam: null // We'll add this in the return if needed
          }))
        });
      }
    }
    
    return {
      totalPlayers: allPlayers.length,
      duplicateGroups: duplicates.length,
      duplicates
    };
  },
}); 