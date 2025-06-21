import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Enhanced code generation with football-themed memorable codes
const generateRoomCode = () => {
  const footballWords = [
    'SOCCER', 'GOAL', 'KICK', 'PASS', 'DRIBBLE', 'TACKLE', 'SAVE', 'SCORE',
    'PITCH', 'FIELD', 'BALL', 'NET', 'POST', 'CORNER', 'FREE', 'PENALTY'
  ];
  
  const colors = [
    'RED', 'BLUE', 'GREEN', 'YELLOW', 'BLACK', 'WHITE', 'GOLD', 'SILVER',
    'ORANGE', 'PURPLE', 'PINK', 'BROWN', 'GRAY', 'CYAN', 'LIME', 'NAVY'
  ];
  
  const numbers = Math.floor(Math.random() * 99) + 1;
  const footballWord = footballWords[Math.floor(Math.random() * footballWords.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  return `${footballWord}-${color}-${numbers}`;
};

// Create a fantasy league
export const createFantasyLeague = mutation({
  args: {
    name: v.string(),
    type: v.string(), // "public", "private", "head_to_head", "classic"
    maxParticipants: v.number(),
    creatorId: v.id("users"),
    league: v.string(), // Which real league this fantasy league follows
  },
  handler: async (ctx, args) => {
    // Generate a memorable code for private leagues
    let code: string | undefined;
    if (args.type === "private") {
      // Ensure code is unique
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        code = generateRoomCode();
        const existing = await ctx.db
          .query("fantasyLeagues")
          .withIndex("by_code", (q) => q.eq("code", code))
          .unique();
        isUnique = !existing;
        attempts++;
      }
      
      // Fallback to timestamp-based code if we can't generate unique one
      if (!isUnique) {
        code = `ROOM-${Date.now().toString().slice(-6)}`;
      }
    }
    
    const fantasyLeagueId = await ctx.db.insert("fantasyLeagues", {
      ...args,
      code,
      currentParticipants: 1, // Creator is first participant
      status: "upcoming",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Add creator as first member
    await ctx.db.insert("leagueMemberships", {
      userId: args.creatorId,
      fantasyLeagueId,
      totalPoints: 0,
      joinedAt: Date.now(),
    });

    return fantasyLeagueId;
  },
});

// Join a fantasy league
export const joinFantasyLeague = mutation({
  args: {
    userId: v.id("users"),
    fantasyLeagueId: v.optional(v.id("fantasyLeagues")),
    code: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let league;
    
    if (args.fantasyLeagueId) {
      league = await ctx.db.get(args.fantasyLeagueId);
    } else if (args.code) {
      league = await ctx.db
        .query("fantasyLeagues")
        .withIndex("by_code", (q) => q.eq("code", args.code))
        .unique();
    }

    if (!league) {
      throw new Error("League not found");
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("leagueMemberships")
      .withIndex("by_user_league", (q) => q.eq("userId", args.userId).eq("fantasyLeagueId", league._id))
      .unique();

    if (existingMembership) {
      throw new Error("User is already a member of this league");
    }

    // Check if league is full
    if (league.currentParticipants >= league.maxParticipants) {
      throw new Error("League is full");
    }

    // Add user to league
    await ctx.db.insert("leagueMemberships", {
      userId: args.userId,
      fantasyLeagueId: league._id,
      totalPoints: 0,
      joinedAt: Date.now(),
    });

    // Update participant count
    await ctx.db.patch(league._id, {
      currentParticipants: league.currentParticipants + 1,
      updatedAt: Date.now(),
    });

    return league._id;
  },
});

// Get user's fantasy leagues
export const getUserLeagues = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("leagueMemberships")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const leagues = await Promise.all(
      memberships.map(async (membership) => {
        const league = await ctx.db.get(membership.fantasyLeagueId);
        const creator = await ctx.db.get(league!.creatorId);
        return {
          ...league,
          creator,
          userPoints: membership.totalPoints,
          userRank: membership.rank,
        };
      })
    );

    return leagues;
  },
});

// Get league details with members
export const getLeagueWithMembers = query({
  args: { fantasyLeagueId: v.id("fantasyLeagues") },
  handler: async (ctx, args) => {
    const league = await ctx.db.get(args.fantasyLeagueId);
    if (!league) return null;

    const memberships = await ctx.db
      .query("leagueMemberships")
      .withIndex("by_league", (q) => q.eq("fantasyLeagueId", args.fantasyLeagueId))
      .collect();

    const members = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        return {
          ...user,
          totalPoints: membership.totalPoints,
          rank: membership.rank,
          joinedAt: membership.joinedAt,
        };
      })
    );

    const creator = await ctx.db.get(league.creatorId);

    return {
      ...league,
      creator,
      members: members.sort((a, b) => (a.rank || 999) - (b.rank || 999)),
    };
  },
});

// Get public leagues available to join
export const getPublicLeagues = query({
  args: { 
    league: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    const query = ctx.db
      .query("fantasyLeagues")
      .withIndex("by_type", (q) => q.eq("type", "public"));

    if (args.league) {
      // Filter by real league if specified
      const allPublicLeagues = await query.collect();
      const filteredLeagues = allPublicLeagues
        .filter(league => league.league === args.league)
        .slice(0, limit);
      
      return await Promise.all(
        filteredLeagues.map(async (league) => {
          const creator = await ctx.db.get(league.creatorId);
          return {
            ...league,
            creator,
          };
        })
      );
    }

    const leagues = await query.take(limit);

    return await Promise.all(
      leagues.map(async (league) => {
        const creator = await ctx.db.get(league.creatorId);
        return {
          ...league,
          creator,
        };
      })
    );
  },
});

// Update league standings
export const updateLeagueStandings = mutation({
  args: {
    fantasyLeagueId: v.id("fantasyLeagues"),
    gameweekId: v.id("gameweeks"),
  },
  handler: async (ctx, args) => {
    // Get all members of the league
    const memberships = await ctx.db
      .query("leagueMemberships")
      .withIndex("by_league", (q) => q.eq("fantasyLeagueId", args.fantasyLeagueId))
      .collect();

    // Get all user teams for this gameweek
    const userTeams = await Promise.all(
      memberships.map(async (membership) => {
        const userTeam = await ctx.db
          .query("userTeams")
          .withIndex("by_user_gameweek", (q) => 
            q.eq("userId", membership.userId).eq("gameweekId", args.gameweekId)
          )
          .filter((q) => q.eq(q.field("fantasyLeagueId"), args.fantasyLeagueId))
          .unique();
        
        return {
          userId: membership.userId,
          gameweekPoints: userTeam?.totalPoints || 0,
        };
      })
    );

    // Sort by gameweek points to determine ranks
    userTeams.sort((a, b) => b.gameweekPoints - a.gameweekPoints);

    // Update or create league standings for this gameweek
    await Promise.all(
      userTeams.map(async (userTeam, index) => {
        const rank = index + 1;
        
        // Get user's total points across all gameweeks
        const userMembership = memberships.find(m => m.userId === userTeam.userId);
        const totalPoints = userMembership?.totalPoints || 0;

        // Check if standing already exists
        const existingStanding = await ctx.db
          .query("leagueStandings")
          .withIndex("by_league_gameweek", (q) => 
            q.eq("fantasyLeagueId", args.fantasyLeagueId).eq("gameweekId", args.gameweekId)
          )
          .filter((q) => q.eq(q.field("userId"), userTeam.userId))
          .unique();

        if (existingStanding) {
          await ctx.db.patch(existingStanding._id, {
            gameweekPoints: userTeam.gameweekPoints,
            totalPoints: totalPoints + userTeam.gameweekPoints,
            rank,
            updatedAt: Date.now(),
          });
        } else {
          await ctx.db.insert("leagueStandings", {
            fantasyLeagueId: args.fantasyLeagueId,
            gameweekId: args.gameweekId,
            userId: userTeam.userId,
            gameweekPoints: userTeam.gameweekPoints,
            totalPoints: totalPoints + userTeam.gameweekPoints,
            rank,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }

        // Update the user's total points in league membership
        const membershipToUpdate = memberships.find(m => m.userId === userTeam.userId);
        if (membershipToUpdate) {
          await ctx.db.patch(membershipToUpdate._id, {
            totalPoints: totalPoints + userTeam.gameweekPoints,
            rank,
          });
        }
      })
    );

    return args.fantasyLeagueId;
  },
});

// Create a default league for new users
export const createDefaultLeague = mutation({
  args: { 
    userId: v.id("users"),
    league: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const league = args.league || "premier_league";
    
    // Check if user already has leagues
    const existingMembership = await ctx.db
      .query("leagueMemberships")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    if (existingMembership) {
      // User already has a league, return it
      return await ctx.db.get(existingMembership.fantasyLeagueId);
    }
    
    // Create a new public league for this user
    const leagueId = await ctx.db.insert("fantasyLeagues", {
      name: `Default ${league.replace('_', ' ').toUpperCase()} League`,
      type: "public",
      maxParticipants: 20,
      currentParticipants: 0,
      creatorId: args.userId,
      league: league,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Add user to the league
    await ctx.db.insert("leagueMemberships", {
      userId: args.userId,
      fantasyLeagueId: leagueId,
      totalPoints: 0,
      joinedAt: Date.now(),
    });
    
    // Update participant count
    await ctx.db.patch(leagueId, {
      currentParticipants: 1,
      updatedAt: Date.now(),
    });
    
    return await ctx.db.get(leagueId);
  },
});

// Regenerate room code for league creators
export const regenerateRoomCode = mutation({
  args: {
    fantasyLeagueId: v.id("fantasyLeagues"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const league = await ctx.db.get(args.fantasyLeagueId);
    if (!league) {
      throw new Error("League not found");
    }

    // Check if user is the creator
    if (league.creatorId !== args.userId) {
      throw new Error("Only the room creator can regenerate the code");
    }

    // Generate new unique code
    let newCode: string = generateRoomCode();
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      const existing = await ctx.db
        .query("fantasyLeagues")
        .withIndex("by_code", (q) => q.eq("code", newCode))
        .unique();
      isUnique = !existing;
      if (!isUnique) {
        newCode = generateRoomCode();
      }
      attempts++;
    }
    
    // Fallback if needed
    if (!isUnique) {
      newCode = `ROOM-${Date.now().toString().slice(-6)}`;
    }

    // Update league with new code
    await ctx.db.patch(args.fantasyLeagueId, {
      code: newCode,
      updatedAt: Date.now(),
    });

    return newCode;
  },
});

// Get sharing information for a room
export const getRoomSharingInfo = query({
  args: { fantasyLeagueId: v.id("fantasyLeagues") },
  handler: async (ctx, args) => {
    const league = await ctx.db.get(args.fantasyLeagueId);
    if (!league || !league.code) return null;

    const creator = await ctx.db.get(league.creatorId);
    
    // Get recent joiners (last 5)
    const memberships = await ctx.db
      .query("leagueMemberships")
      .withIndex("by_league", (q) => q.eq("fantasyLeagueId", args.fantasyLeagueId))
      .order("desc")
      .take(5);

    const recentMembers = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        return {
          name: user?.name,
          joinedAt: membership.joinedAt,
        };
      })
    );

    return {
      code: league.code,
      roomName: league.name,
      league: league.league,
      creator: creator?.name,
      memberCount: league.currentParticipants,
      maxMembers: league.maxParticipants,
      recentMembers,
      shareUrl: `https://soccer-fantasy-game.vercel.app/join/${league.code}`,
    };
  },
});

// Get league by join code
export const getLeagueByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("fantasyLeagues")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();
  },
});

// Delete a fantasy league (only by creator)
export const deleteFantasyLeague = mutation({
  args: {
    fantasyLeagueId: v.id("fantasyLeagues"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const league = await ctx.db.get(args.fantasyLeagueId);
    if (!league) {
      throw new Error("League not found");
    }

    // Check if user is the creator
    if (league.creatorId !== args.userId) {
      throw new Error("Only the room creator can delete the room");
    }

    // Delete all league memberships
    const memberships = await ctx.db
      .query("leagueMemberships")
      .withIndex("by_league", (q) => q.eq("fantasyLeagueId", args.fantasyLeagueId))
      .collect();

    for (const membership of memberships) {
      await ctx.db.delete(membership._id);
    }

    // Delete all user teams for this league
    const userTeams = await ctx.db
      .query("userTeams")
      .withIndex("by_league", (q) => q.eq("fantasyLeagueId", args.fantasyLeagueId))
      .collect();

    for (const team of userTeams) {
      await ctx.db.delete(team._id);
    }

    // Delete all league standings for this league
    const standings = await ctx.db
      .query("leagueStandings")
      .filter((q) => q.eq(q.field("fantasyLeagueId"), args.fantasyLeagueId))
      .collect();

    for (const standing of standings) {
      await ctx.db.delete(standing._id);
    }

    // Finally, delete the league itself
    await ctx.db.delete(args.fantasyLeagueId);

    return { success: true };
  },
});