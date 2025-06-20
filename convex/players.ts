import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a soccer player
export const createPlayer = mutation({
  args: {
    name: v.string(),
    position: v.string(),
    realTeamId: v.id("realTeams"),
    imageUrl: v.optional(v.string()),
    jerseyNumber: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("players", {
      ...args,
      injured: false,
      suspended: false,
      totalGoals: 0,
      totalAssists: 0,
      totalPoints: 0,
      averagePoints: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get all players
export const getAllPlayers = query({
  args: {},
  handler: async (ctx) => {
    const players = await ctx.db.query("players").collect();
    
    // Get team info for each player
    const playersWithTeams = await Promise.all(
      players.map(async (player) => {
        const team = await ctx.db.get(player.realTeamId);
        return {
          ...player,
          realTeam: team ? {
            name: team.name,
            shortName: team.shortName,
            colors: team.colors,
          } : null,
        };
      })
    );
    
    return playersWithTeams;
  },
});

// Get players by team
export const getPlayersByTeam = query({
  args: { teamId: v.id("realTeams") },
  handler: async (ctx, args) => {
    const players = await ctx.db
      .query("players")
      .withIndex("by_team", (q) => q.eq("realTeamId", args.teamId))
      .collect();

    const team = await ctx.db.get(args.teamId);

    return players.map(player => ({
      ...player,
      team,
    }));
  },
});

// Get players by position
export const getPlayersByPosition = query({
  args: { position: v.string() },
  handler: async (ctx, args) => {
    const players = await ctx.db
      .query("players")
      .withIndex("by_position", (q) => q.eq("position", args.position))
      .collect();
    
    // Get team info for each player
    const playersWithTeams = await Promise.all(
      players.map(async (player) => {
        const team = await ctx.db.get(player.realTeamId);
        return {
          ...player,
          realTeam: team ? {
            name: team.name,
            shortName: team.shortName,
            colors: team.colors,
          } : null,
        };
      })
    );
    
    return playersWithTeams.sort((a, b) => b.totalPoints - a.totalPoints);
  },
});

// Search players by name
export const searchPlayers = query({
  args: { 
    searchTerm: v.string(),
    position: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let players = await ctx.db.query("players").collect();
    
    // Filter by position if provided
    if (args.position) {
      players = players.filter(player => player.position === args.position);
    }
    
    // Filter by search term
    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();
      players = players.filter(player => 
        player.name.toLowerCase().includes(searchLower)
      );
    }
    
    // Get team info for each player
    const playersWithTeams = await Promise.all(
      players.map(async (player) => {
        const team = await ctx.db.get(player.realTeamId);
        return {
          ...player,
          realTeam: team ? {
            name: team.name,
            shortName: team.shortName,
            colors: team.colors,
          } : null,
        };
      })
    );
    
    return playersWithTeams.sort((a, b) => b.totalPoints - a.totalPoints);
  },
});

// Update player status (injury, suspension)
export const updatePlayerStatus = mutation({
  args: {
    playerId: v.id("players"),
    injured: v.optional(v.boolean()),
    suspended: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { playerId, ...updates } = args;
    
    await ctx.db.patch(playerId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return playerId;
  },
});

// Update player stats
export const updatePlayerStats = mutation({
  args: {
    playerId: v.id("players"),
    goals: v.optional(v.number()),
    assists: v.optional(v.number()),
    points: v.optional(v.number()),
    injured: v.optional(v.boolean()),
    suspended: v.optional(v.boolean()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { playerId, ...updates } = args;
    
    await ctx.db.patch(playerId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return playerId;
  },
});

// Update player image URL
export const updatePlayerImage = mutation({
  args: {
    playerId: v.id("players"),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.playerId, {
      imageUrl: args.imageUrl,
      updatedAt: Date.now(),
    });

    return args.playerId;
  },
});

// Get player by ID with team info
export const getPlayerById = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) return null;
    
    const team = await ctx.db.get(player.realTeamId);
    
    return {
      ...player,
      realTeam: team ? {
        name: team.name,
        shortName: team.shortName,
        colors: team.colors,
      } : null,
    };
  },
});

// Get top performers
export const getTopPerformers = query({
  args: { 
    position: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let players = await ctx.db
      .query("players")
      .withIndex("by_total_points")
      .order("desc")
      .take(args.limit || 10);
    
    // Filter by position if provided
    if (args.position) {
      players = players.filter(player => player.position === args.position);
    }
    
    // Get team info for each player
    const playersWithTeams = await Promise.all(
      players.map(async (player) => {
        const team = await ctx.db.get(player.realTeamId);
        return {
          ...player,
          realTeam: team ? {
            name: team.name,
            shortName: team.shortName,
            colors: team.colors,
          } : null,
        };
      })
    );
    
    return playersWithTeams;
  },
});

// Get players by league
export const getPlayersByLeague = query({
  args: { league: v.string() },
  handler: async (ctx, args) => {
    // First get all teams in this league
    const teams = await ctx.db
      .query("realTeams")
      .withIndex("by_league", (q) => q.eq("league", args.league))
      .collect();
    
    const teamIds = teams.map(team => team._id);
    
    // Get all players from these teams
    const players = await ctx.db.query("players").collect();
    const leaguePlayers = players.filter(player => 
      teamIds.includes(player.realTeamId)
    );
    
    // Get team info for each player
    const playersWithTeams = await Promise.all(
      leaguePlayers.map(async (player) => {
        const team = await ctx.db.get(player.realTeamId);
        return {
          ...player,
          realTeam: team ? {
            name: team.name,
            shortName: team.shortName,
            colors: team.colors,
          } : null,
        };
      })
    );
    
    return playersWithTeams.sort((a, b) => b.totalPoints - a.totalPoints);
  },
}); 