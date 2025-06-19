import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a gameweek
export const createGameweek = mutation({
  args: {
    number: v.number(),
    league: v.string(),
    season: v.string(),
    deadline: v.number(), // Timestamp
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("gameweeks", {
      ...args,
      status: "upcoming",
      isActive: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get current active gameweek
export const getCurrentGameweek = query({
  args: { league: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("gameweeks")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .filter((q) => q.eq(q.field("league"), args.league))
      .unique();
  },
});

// Get next gameweek
export const getNextGameweek = query({
  args: { league: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const upcomingGameweeks = await ctx.db
      .query("gameweeks")
      .withIndex("by_status", (q) => q.eq("status", "upcoming"))
      .filter((q) => q.eq(q.field("league"), args.league))
      .collect();
    
    // Find the next gameweek by deadline
    return upcomingGameweeks
      .filter(gw => gw.deadline > now)
      .sort((a, b) => a.deadline - b.deadline)[0] || null;
  },
});

// Get gameweeks by league and season
export const getGameweeks = query({
  args: {
    league: v.string(),
    season: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.season && args.season.length > 0) {
      return await ctx.db
        .query("gameweeks")
        .withIndex("by_league_season", (q) => q.eq("league", args.league).eq("season", args.season!))
        .collect();
    }
    
    // If no season specified, get all gameweeks for the league
    const allGameweeks = await ctx.db.query("gameweeks").collect();
    return allGameweeks.filter(gw => gw.league === args.league);
  },
});

// Update gameweek status
export const updateGameweekStatus = mutation({
  args: {
    gameweekId: v.id("gameweeks"),
    status: v.string(),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { gameweekId, ...updates } = args;
    
    // If setting this gameweek as active, make sure no other gameweek in the same league is active
    if (updates.isActive) {
      const gameweek = await ctx.db.get(gameweekId);
      if (gameweek) {
        const activeGameweeks = await ctx.db
          .query("gameweeks")
          .withIndex("by_active", (q) => q.eq("isActive", true))
          .filter((q) => q.eq(q.field("league"), gameweek.league))
          .collect();
        
        // Deactivate other gameweeks in the same league
        await Promise.all(
          activeGameweeks.map(async (gw) => {
            if (gw._id !== gameweekId) {
              await ctx.db.patch(gw._id, {
                isActive: false,
                status: "completed",
                updatedAt: Date.now(),
              });
            }
          })
        );
      }
    }
    
    await ctx.db.patch(gameweekId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return gameweekId;
  },
});

// Check if gameweek deadline has passed
export const isDeadlinePassed = query({
  args: { gameweekId: v.id("gameweeks") },
  handler: async (ctx, args) => {
    const gameweek = await ctx.db.get(args.gameweekId);
    if (!gameweek) return false;
    
    return Date.now() > gameweek.deadline;
  },
});

// Get gameweek with match count
export const getGameweekWithStats = query({
  args: { gameweekId: v.id("gameweeks") },
  handler: async (ctx, args) => {
    const gameweek = await ctx.db.get(args.gameweekId);
    if (!gameweek) return null;
    
    // Count matches in this gameweek
    const matches = await ctx.db
      .query("matches")
      .withIndex("by_gameweek", (q) => q.eq("gameweekId", args.gameweekId))
      .collect();
    
    const completedMatches = matches.filter(m => m.status === "completed").length;
    const liveMatches = matches.filter(m => m.status === "live").length;
    const upcomingMatches = matches.filter(m => m.status === "upcoming").length;
    
    return {
      ...gameweek,
      totalMatches: matches.length,
      completedMatches,
      liveMatches,
      upcomingMatches,
    };
  },
});

// Activate the first gameweek if none is active
export const activateFirstGameweek = mutation({
  args: { league: v.string() },
  handler: async (ctx, args) => {
    // Check if there's already an active gameweek
    const activeGameweek = await ctx.db
      .query("gameweeks")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .filter((q) => q.eq(q.field("league"), args.league))
      .first();
    
    if (activeGameweek) {
      return activeGameweek;
    }
    
    // Find the first gameweek for this league
    const firstGameweek = await ctx.db
      .query("gameweeks")
      .filter((q) => q.eq(q.field("league"), args.league))
      .order("asc")
      .first();
    
    if (!firstGameweek) {
      throw new Error(`No gameweeks found for league: ${args.league}`);
    }
    
    // Activate the first gameweek
    await ctx.db.patch(firstGameweek._id, {
      status: "active",
      isActive: true,
      // Set deadline to 7 days from now for testing
      deadline: Date.now() + (7 * 24 * 60 * 60 * 1000),
      updatedAt: Date.now(),
    });
    
    return await ctx.db.get(firstGameweek._id);
  },
}); 