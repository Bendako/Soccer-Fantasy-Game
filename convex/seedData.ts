import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Sample Premier League teams
const premierLeagueTeams = [
  {
    name: "Manchester City",
    shortName: "MCI",
    league: "premier_league",
    colors: { primary: "#6CABDD", secondary: "#1C2C5B" }
  },
  {
    name: "Arsenal",
    shortName: "ARS", 
    league: "premier_league",
    colors: { primary: "#EF0107", secondary: "#FFD700" }
  },
  {
    name: "Liverpool",
    shortName: "LIV",
    league: "premier_league", 
    colors: { primary: "#C8102E", secondary: "#F6EB61" }
  },
  {
    name: "Manchester United",
    shortName: "MUN",
    league: "premier_league",
    colors: { primary: "#DA020E", secondary: "#FBE122" }
  },
  {
    name: "Chelsea",
    shortName: "CHE",
    league: "premier_league",
    colors: { primary: "#034694", secondary: "#ED1C24" }
  },
  {
    name: "Tottenham Hotspur",
    shortName: "TOT",
    league: "premier_league",
    colors: { primary: "#132257", secondary: "#FFFFFF" }
  }
];

// Sample players for each team
const samplePlayers = [
  // Manchester City
  { name: "Erling Haaland", position: "FWD", team: "Manchester City", points: 250 },
  { name: "Kevin De Bruyne", position: "MID", team: "Manchester City", points: 180 },
  { name: "Phil Foden", position: "MID", team: "Manchester City", points: 160 },
  { name: "Ederson", position: "GK", team: "Manchester City", points: 140 },
  { name: "Ruben Dias", position: "DEF", team: "Manchester City", points: 130 },
  
  // Arsenal
  { name: "Bukayo Saka", position: "MID", team: "Arsenal", points: 190 },
  { name: "Martin Ødegaard", position: "MID", team: "Arsenal", points: 170 },
  { name: "Gabriel Jesus", position: "FWD", team: "Arsenal", points: 150 },
  { name: "William Saliba", position: "DEF", team: "Arsenal", points: 140 },
  { name: "Aaron Ramsdale", position: "GK", team: "Arsenal", points: 130 },
  
  // Liverpool
  { name: "Mohamed Salah", position: "FWD", team: "Liverpool", points: 220 },
  { name: "Sadio Mané", position: "FWD", team: "Liverpool", points: 200 },
  { name: "Virgil van Dijk", position: "DEF", team: "Liverpool", points: 160 },
  { name: "Alisson", position: "GK", team: "Liverpool", points: 150 },
  { name: "Fabinho", position: "MID", team: "Liverpool", points: 140 },
  
  // Manchester United
  { name: "Bruno Fernandes", position: "MID", team: "Manchester United", points: 180 },
  { name: "Marcus Rashford", position: "FWD", team: "Manchester United", points: 170 },
  { name: "Casemiro", position: "MID", team: "Manchester United", points: 150 },
  { name: "Raphael Varane", position: "DEF", team: "Manchester United", points: 130 },
  { name: "André Onana", position: "GK", team: "Manchester United", points: 120 },
  
  // Chelsea  
  { name: "Enzo Fernández", position: "MID", team: "Chelsea", points: 160 },
  { name: "Christopher Nkunku", position: "FWD", team: "Chelsea", points: 150 },
  { name: "Thiago Silva", position: "DEF", team: "Chelsea", points: 140 },
  { name: "Robert Sánchez", position: "GK", team: "Chelsea", points: 110 },
  { name: "Reece James", position: "DEF", team: "Chelsea", points: 130 },
  
  // Tottenham
  { name: "Harry Kane", position: "FWD", team: "Tottenham Hotspur", points: 230 },
  { name: "Son Heung-min", position: "FWD", team: "Tottenham Hotspur", points: 190 },
  { name: "James Maddison", position: "MID", team: "Tottenham Hotspur", points: 160 },
  { name: "Cristian Romero", position: "DEF", team: "Tottenham Hotspur", points: 130 },
  { name: "Guglielmo Vicario", position: "GK", team: "Tottenham Hotspur", points: 115 }
];

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingTeams = await ctx.db.query("realTeams").collect();
    if (existingTeams.length > 0) {
      return { message: "Database already seeded", teams: existingTeams.length };
    }

    const now = Date.now();
    const teamIdMap: Record<string, string> = {};

    // Insert teams first
    for (const team of premierLeagueTeams) {
      const teamId = await ctx.db.insert("realTeams", {
        name: team.name,
        shortName: team.shortName,
        league: team.league,
        colors: team.colors,
        createdAt: now,
        updatedAt: now,
      });
      teamIdMap[team.name] = teamId;
    }

    // Insert players
    for (const player of samplePlayers) {
      const teamId = teamIdMap[player.team];
      if (teamId) {
        await ctx.db.insert("players", {
          name: player.name,
          position: player.position as "GK" | "DEF" | "MID" | "FWD",
          realTeamId: teamId as Id<"realTeams">,
          injured: false,
          suspended: false,
          totalGoals: Math.floor(player.points / 20),
          totalAssists: Math.floor(player.points / 30),
          totalPoints: player.points,
          averagePoints: player.points / 10,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // Create a sample gameweek
    const gameweekId = await ctx.db.insert("gameweeks", {
      number: 1,
      league: "premier_league",
      season: "2024-25",
      deadline: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week from now
      status: "upcoming",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return { 
      message: "Database seeded successfully", 
      teams: premierLeagueTeams.length,
      players: samplePlayers.length,
      gameweekId 
    };
  },
});

export const clearDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear all data (be careful with this!)
    const players = await ctx.db.query("players").collect();
    const teams = await ctx.db.query("realTeams").collect();
    const gameweeks = await ctx.db.query("gameweeks").collect();
    
    for (const player of players) {
      await ctx.db.delete(player._id);
    }
    
    for (const team of teams) {
      await ctx.db.delete(team._id);
    }
    
    for (const gameweek of gameweeks) {
      await ctx.db.delete(gameweek._id);
    }

    return { message: "Database cleared", deletedPlayers: players.length, deletedTeams: teams.length };
  },
}); 