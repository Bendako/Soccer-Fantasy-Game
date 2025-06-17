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
  handler: async (ctx) => {
    const players = await ctx.db.query("players").collect();
    
    // Get team details for each player
    const playersWithTeams = await Promise.all(
      players.map(async (player) => {
        const team = await ctx.db.get(player.realTeamId);
        return {
          ...player,
          team,
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

    // Get team details for each player
    const playersWithTeams = await Promise.all(
      players.map(async (player) => {
        const team = await ctx.db.get(player.realTeamId);
        return {
          ...player,
          team,
        };
      })
    );

    return playersWithTeams;
  },
});

// Search players by name
export const searchPlayers = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const allPlayers = await ctx.db.query("players").collect();
    
    const filteredPlayers = allPlayers.filter(player => 
      player.name.toLowerCase().includes(args.searchTerm.toLowerCase())
    );

    // Get team details for filtered players
    const playersWithTeams = await Promise.all(
      filteredPlayers.map(async (player) => {
        const team = await ctx.db.get(player.realTeamId);
        return {
          ...player,
          team,
        };
      })
    );

    return playersWithTeams;
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
    totalGoals: v.optional(v.number()),
    totalAssists: v.optional(v.number()),
    totalPoints: v.optional(v.number()),
    averagePoints: v.optional(v.number()),
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

// Get top performing players
export const getTopPlayers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    const players = await ctx.db
      .query("players")
      .withIndex("by_total_points")
      .order("desc")
      .take(limit);

    // Get team details for each player
    const playersWithTeams = await Promise.all(
      players.map(async (player) => {
        const team = await ctx.db.get(player.realTeamId);
        return {
          ...player,
          team,
        };
      })
    );

    return playersWithTeams;
  },
}); 