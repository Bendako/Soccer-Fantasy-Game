import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a real soccer team
export const createRealTeam = mutation({
  args: {
    name: v.string(),
    shortName: v.string(),
    league: v.string(),
    logoUrl: v.optional(v.string()),
    colors: v.optional(v.object({
      primary: v.string(),
      secondary: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("realTeams", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get all teams by league
export const getTeamsByLeague = query({
  args: { league: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("realTeams")
      .withIndex("by_league", (q) => q.eq("league", args.league))
      .collect();
  },
});

// Get all teams
export const getAllTeams = query({
  handler: async (ctx) => {
    return await ctx.db.query("realTeams").collect();
  },
});

// Get team by ID
export const getTeamById = query({
  args: { teamId: v.id("realTeams") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.teamId);
  },
});

// Update team information
export const updateTeam = mutation({
  args: {
    teamId: v.id("realTeams"),
    name: v.optional(v.string()),
    shortName: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    colors: v.optional(v.object({
      primary: v.string(),
      secondary: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const { teamId, ...updates } = args;
    
    await ctx.db.patch(teamId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return teamId;
  },
}); 