import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or update user profile
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    favoriteRealTeamId: v.optional(v.id("realTeams")),
    favoriteLeague: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
        favoriteRealTeamId: args.favoriteRealTeamId,
        favoriteLeague: args.favoriteLeague,
        updatedAt: Date.now(),
      });
      return existingUser._id;
    } else {
      // Create new user
      return await ctx.db.insert("users", {
        clerkId: args.clerkId,
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
        favoriteRealTeamId: args.favoriteRealTeamId,
        favoriteLeague: args.favoriteLeague,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Get user by Clerk ID
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

// Update user preferences
export const updateUserPreferences = mutation({
  args: {
    clerkId: v.string(),
    favoriteRealTeamId: v.optional(v.id("realTeams")),
    favoriteLeague: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      favoriteRealTeamId: args.favoriteRealTeamId,
      favoriteLeague: args.favoriteLeague,
      updatedAt: Date.now(),
    });

    return user._id;
  },
});

// Get all users
export const getUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// Get user with their favorite team details
export const getUserWithFavoriteTeam = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) return null;

    if (user.favoriteRealTeamId) {
      const favoriteTeam = await ctx.db.get(user.favoriteRealTeamId);
      return {
        ...user,
        favoriteTeam,
      };
    }

    return user;
  },
});
