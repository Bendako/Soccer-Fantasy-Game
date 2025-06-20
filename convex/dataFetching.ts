import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

// Football-data.org API Configuration
const FOOTBALL_DATA_BASE_URL = "https://api.football-data.org/v4";
const API_HEADERS = {
  "X-Auth-Token": process.env.FOOTBALL_DATA_TOKEN || ""
};

// Supported leagues with their Football-data.org IDs
const SUPPORTED_LEAGUES = {
  premier_league: { id: 2021, code: "PL", name: "Premier League", country: "England" },
  la_liga: { id: 2014, code: "PD", name: "Primera Division", country: "Spain" },
  champions_league: { id: 2001, code: "CL", name: "UEFA Champions League", country: "World" },
  serie_a: { id: 2019, code: "SA", name: "Serie A", country: "Italy" },
  bundesliga: { id: 2002, code: "BL1", name: "Bundesliga", country: "Germany" },
  ligue_1: { id: 2015, code: "FL1", name: "Ligue 1", country: "France" }
} as const;

type LeagueKey = keyof typeof SUPPORTED_LEAGUES;

// Fetch teams for a specific league
export const fetchTeamsForLeague = action({
  args: { league: v.string() },
  handler: async (ctx, args) => {
    const leagueConfig = SUPPORTED_LEAGUES[args.league as LeagueKey];
    if (!leagueConfig) {
      throw new Error(`Unsupported league: ${args.league}`);
    }

    try {
      console.log(`Fetching teams for ${leagueConfig.name} from Football-data.org...`);
      
      const response = await fetch(
        `${FOOTBALL_DATA_BASE_URL}/competitions/${leagueConfig.id}/teams`,
        { headers: API_HEADERS }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const teams = data.teams || [];

      console.log(`Found ${teams.length} teams for ${leagueConfig.name}`);

      // Store teams in database
      let teamsStored = 0;
      for (const team of teams) {
        try {
          await ctx.runMutation(internal.dataFetching.storeTeam, {
            externalId: team.id.toString(),
            name: team.name,
            shortName: team.shortName || team.name.substring(0, 20),
            league: args.league,
            logoUrl: team.crest || undefined,
            founded: team.founded || undefined,
            venue: team.venue || undefined,
            website: team.website || undefined,
          });
          teamsStored++;
        } catch (error) {
          console.warn(`Failed to store team ${team.name}:`, error);
        }
      }

      return {
        success: true,
        teamsCount: teamsStored,
        message: `Successfully fetched ${teamsStored} teams for ${leagueConfig.name}`
      };

    } catch (error: unknown) {
      console.error("Error fetching teams:", error);
      throw new Error(`Failed to fetch teams: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// Fetch players for a specific team
export const fetchPlayersForTeam = action({
  args: { teamId: v.string() },
  handler: async (ctx, args) => {
    try {
      console.log(`Fetching players for team ${args.teamId}...`);
      
      const response = await fetch(
        `${FOOTBALL_DATA_BASE_URL}/teams/${args.teamId}`,
        { headers: API_HEADERS }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const team = await response.json();
      const players = team.squad || [];

      console.log(`Found ${players.length} players for ${team.name}`);

      // Find the team in our database
      const dbTeam = await ctx.runQuery(internal.dataFetching.findTeamByExternalId, {
        externalId: args.teamId
      });

      if (!dbTeam) {
        throw new Error(`Team with external ID ${args.teamId} not found in database. Please fetch teams first.`);
      }

      // Store players in database
      let playersStored = 0;
      for (const player of players) {
        try {
          await ctx.runMutation(internal.dataFetching.storePlayer, {
            externalId: player.id.toString(),
            name: player.name,
            position: mapPosition(player.position),
            realTeamId: dbTeam._id,
            nationality: player.nationality || undefined,
            dateOfBirth: player.dateOfBirth || undefined,
          });
          playersStored++;
        } catch (error) {
          console.warn(`Failed to store player ${player.name}:`, error);
        }
      }

      return {
        success: true,
        playersCount: playersStored,
        message: `Successfully fetched ${playersStored} players for ${team.name}`
      };

    } catch (error: unknown) {
      console.error("Error fetching players:", error);
      throw new Error(`Failed to fetch players: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// Fetch all available competitions
export const fetchCompetitions = action({
  args: {},
  handler: async () => {
    try {
      console.log("Fetching competitions from Football-data.org...");
      
      const response = await fetch(
        `${FOOTBALL_DATA_BASE_URL}/competitions`,
        { headers: API_HEADERS }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const competitions = data.competitions || [];

      type ApiCompetition = {
        id: number;
        name: string;
        code: string;
        area: { name: string };
      };

      const supportedCompetitions = competitions.filter((comp: ApiCompetition) =>
        Object.values(SUPPORTED_LEAGUES).some(league => league.id === comp.id)
      );

      return {
        success: true,
        total: competitions.length,
        supported: supportedCompetitions.length,
        message: `Found ${supportedCompetitions.length} supported competitions`,
        competitions: supportedCompetitions.map((comp: ApiCompetition) => ({
          id: comp.id,
          name: comp.name,
          code: comp.code,
          area: comp.area.name
        }))
      };

    } catch (error: unknown) {
      console.error("Error fetching competitions:", error);
      throw new Error(`Failed to fetch competitions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// Helper function to map Football-data.org positions to our schema
function mapPosition(position: string): string {
  const positionMap: Record<string, string> = {
    "Goalkeeper": "GK",
    "Centre-Back": "DEF",
    "Left-Back": "DEF",
    "Right-Back": "DEF",
    "Defensive Midfield": "MID",
    "Central Midfield": "MID",
    "Attacking Midfield": "MID",
    "Left Midfield": "MID",
    "Right Midfield": "MID",
    "Left Winger": "FWD",
    "Right Winger": "FWD",
    "Centre-Forward": "FWD",
    "Attacker": "FWD"
  };

  return positionMap[position] || "MID";
}

// Internal mutations for storing data
export const storeTeam = internalMutation({
  args: {
    externalId: v.string(),
    name: v.string(),
    shortName: v.string(),
    league: v.string(),
    logoUrl: v.optional(v.string()),
    founded: v.optional(v.number()),
    venue: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if team already exists
    const existing = await ctx.db
      .query("realTeams")
      .filter((q) => q.eq(q.field("externalId"), args.externalId))
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing team
      await ctx.db.patch(existing._id, {
        name: args.name,
        shortName: args.shortName,
        league: args.league,
        logoUrl: args.logoUrl,
        founded: args.founded,
        venue: args.venue,
        website: args.website,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new team
      return await ctx.db.insert("realTeams", {
        externalId: args.externalId,
        name: args.name,
        shortName: args.shortName,
        league: args.league,
        logoUrl: args.logoUrl,
        colors: {
          primary: "#000000",
          secondary: "#FFFFFF"
        },
        founded: args.founded,
        venue: args.venue,
        website: args.website,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

export const storePlayer = internalMutation({
  args: {
    externalId: v.string(),
    name: v.string(),
    position: v.string(),
    realTeamId: v.id("realTeams"),
    nationality: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if player already exists
    const existing = await ctx.db
      .query("players")
      .filter((q) => q.eq(q.field("externalId"), args.externalId))
      .first();

    const now = Date.now();

    // Enhanced image URL generation with multiple fallbacks
    const generatePlayerImageUrls = (name: string, externalId: string): string[] => {
      const nameForUrl = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const firstName = name.split(' ')[0];
      const lastName = name.split(' ').slice(-1)[0];
      
      return [
        // Official sources using real player ID from football-data.org
        `https://resources.premierleague.com/premierleague/photos/players/250x250/p${externalId}.png`,
        `https://images.fotmob.com/image_resources/playerimages/${externalId}.png`,
        `https://img.a.transfermarkt.technology/portrait/header/${externalId}.jpg`,
        `https://a.espncdn.com/i/headshots/soccer/players/full/${externalId}.png`,
        
        // Name-based fallbacks
        `https://e0.365dm.com/24/08/${nameForUrl}.jpg`,
        `https://ichef.bbci.co.uk/onesport/cps/480/cpsprodpb/vivo/live/images/2024/8/16/${nameForUrl}.jpg`,
        
        // Avatar services (always work)
        `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=0D8ABC&color=fff&size=256&font-size=0.6&rounded=true`,
        `https://source.boringavatars.com/marble/256/${name}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`
      ];
    };

    const imageUrl = generatePlayerImageUrls(args.name, args.externalId)[0];

    if (existing) {
      // Update existing player
      await ctx.db.patch(existing._id, {
        name: args.name,
        position: args.position,
        realTeamId: args.realTeamId,
        imageUrl: imageUrl,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new player
      return await ctx.db.insert("players", {
        externalId: args.externalId,
        name: args.name,
        position: args.position,
        realTeamId: args.realTeamId,
        jerseyNumber: undefined,
        imageUrl: imageUrl,
        injured: false,
        suspended: false,
        totalGoals: 0,
        totalAssists: 0,
        totalPoints: 0,
        averagePoints: 0,
        minutesPlayed: 0,
        price: 50, // Default price
        form: [],
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Action to update all existing players with image URLs
export const updatePlayerImages = action({
  args: {},
  handler: async (ctx) => {
    try {
      console.log("🖼️ Updating player images...");
      
      // Get all players
      const players = await ctx.runQuery(internal.dataFetching.getAllPlayersForImageUpdate);
      
      let updatedCount = 0;
      
      for (const player of players) {
        try {
          // Generate image URL using the player's externalId
          const imageUrl = `https://resources.premierleague.com/premierleague/photos/players/250x250/p${player.externalId}.png`;
          
          // Update the player with the image URL
          await ctx.runMutation(internal.dataFetching.updatePlayerImageUrl, {
            playerId: player._id,
            imageUrl: imageUrl,
          });
          
          updatedCount++;
        } catch (error) {
          console.warn(`Failed to update image for player ${player.name}:`, error);
        }
      }
      
      return {
        success: true,
        message: `Updated ${updatedCount} players with image URLs`,
        updatedCount
      };
      
    } catch (error: unknown) {
      console.error("Error updating player images:", error);
      throw new Error(`Failed to update player images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const findTeamByExternalId = internalQuery({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("realTeams")
      .filter((q) => q.eq(q.field("externalId"), args.externalId))
      .first();
  },
});

// Internal query to get all players for image updating
export const getAllPlayersForImageUpdate = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("players").collect();
  },
});

// Internal mutation to update player image URL
export const updatePlayerImageUrl = internalMutation({
  args: {
    playerId: v.id("players"),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.playerId, {
      imageUrl: args.imageUrl,
      updatedAt: Date.now(),
    });
  },
});

// Clean up duplicate teams
export const cleanupDuplicateTeams = internalMutation({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db.query("realTeams").collect();
    const teamGroups: Record<string, typeof teams> = {};
    
    // Group teams by name and league
    teams.forEach(team => {
      const key = `${team.name}_${team.league}`;
      if (!teamGroups[key]) {
        teamGroups[key] = [];
      }
      teamGroups[key].push(team);
    });
    
    let deletedCount = 0;
    
    // For each group with duplicates, keep the most recent one
    for (const teamGroup of Object.values(teamGroups)) {
      if (teamGroup.length > 1) {
        // Sort by creation time, keep the most recent
        teamGroup.sort((a, b) => b.createdAt - a.createdAt);
        const toKeep = teamGroup[0];
        const toDelete = teamGroup.slice(1);
        
        // Delete older duplicates
        for (const team of toDelete) {
          await ctx.db.delete(team._id);
          deletedCount++;
        }
        
        console.log(`Kept ${toKeep.name} (${toKeep._id}), deleted ${toDelete.length} duplicates`);
      }
    }
    
    return { deletedCount, remainingTeams: teams.length - deletedCount };
  },
});

// Get teams by league
export const getTeamsByLeague = internalQuery({
  args: { league: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("realTeams")
      .withIndex("by_league", (q) => q.eq("league", args.league))
      .collect();
  },
});

 