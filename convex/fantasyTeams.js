import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Formation validation helper
function validateFormation(formation, defCount, midCount, fwdCount) {
  const validFormations = {
    "4-3-3": { def: 4, mid: 3, fwd: 3 },
    "4-4-2": { def: 4, mid: 4, fwd: 2 },
    "3-5-2": { def: 3, mid: 5, fwd: 2 },
    "4-5-1": { def: 4, mid: 5, fwd: 1 },
    "3-4-3": { def: 3, mid: 4, fwd: 3 },
    "5-3-2": { def: 5, mid: 3, fwd: 2 },
    "5-4-1": { def: 5, mid: 4, fwd: 1 },
  };
  
  const expected = validFormations[formation];
  if (!expected) {
    throw new Error(`Invalid formation: ${formation}`);
  }
  
  if (defCount !== expected.def || midCount !== expected.mid || fwdCount !== expected.fwd) {
    throw new Error(`Formation ${formation} requires ${expected.def} defenders, ${expected.mid} midfielders, and ${expected.fwd} forwards`);
  }
  
  return true;
}

// Validate player positions helper
async function validatePlayerPositions(ctx, playerIds, expectedPosition) {
  for (const playerId of playerIds) {
    const player = await ctx.db.get(playerId);
    if (!player) {
      throw new Error(`Player not found: ${playerId}`);
    }
    if (player.position !== expectedPosition) {
      throw new Error(`Player ${player.name} is not a ${expectedPosition}`);
    }
  }
}

// Create or update user's fantasy team
export const saveFantasyTeam = mutation({
  args: {
    userId: v.id("users"),
    gameweekId: v.id("gameweeks"),
    fantasyLeagueId: v.id("fantasyLeagues"),
    formation: v.string(),
    
    // Starting XI
    goalkeeper: v.id("players"),
    defenders: v.array(v.id("players")),
    midfielders: v.array(v.id("players")),
    forwards: v.array(v.id("players")),
    
    // Bench
    benchGoalkeeper: v.id("players"),
    benchDefender: v.id("players"),
    benchMidfielder: v.id("players"),
    benchForward: v.id("players"),
    
    // Captain system
    captainId: v.id("players"),
    viceCaptainId: v.id("players"),
  },
  
  handler: async (ctx, args) => {
    // Validate formation
    validateFormation(args.formation, args.defenders.length, args.midfielders.length, args.forwards.length);
    
    // Validate player positions
    await validatePlayerPositions(ctx, [args.goalkeeper], "GK");
    await validatePlayerPositions(ctx, args.defenders, "DEF");
    await validatePlayerPositions(ctx, args.midfielders, "MID");
    await validatePlayerPositions(ctx, args.forwards, "FWD");
    await validatePlayerPositions(ctx, [args.benchGoalkeeper], "GK");
    await validatePlayerPositions(ctx, [args.benchDefender], "DEF");
    await validatePlayerPositions(ctx, [args.benchMidfielder], "MID");
    await validatePlayerPositions(ctx, [args.benchForward], "FWD");
    
    // Check for duplicate players
    const allPlayerIds = [
      args.goalkeeper,
      ...args.defenders,
      ...args.midfielders,
      ...args.forwards,
      args.benchGoalkeeper,
      args.benchDefender,
      args.benchMidfielder,
      args.benchForward,
    ];
    
    const uniquePlayerIds = new Set(allPlayerIds);
    if (uniquePlayerIds.size !== allPlayerIds.length) {
      throw new Error("Cannot select the same player multiple times");
    }
    
    // Validate captain and vice-captain are in the starting XI
    const startingXI = [args.goalkeeper, ...args.defenders, ...args.midfielders, ...args.forwards];
    if (!startingXI.includes(args.captainId)) {
      throw new Error("Captain must be in the starting XI");
    }
    if (!startingXI.includes(args.viceCaptainId)) {
      throw new Error("Vice-captain must be in the starting XI");
    }
    if (args.captainId === args.viceCaptainId) {
      throw new Error("Captain and vice-captain must be different players");
    }
    
    // Check if gameweek deadline has passed
    const gameweek = await ctx.db.get(args.gameweekId);
    if (!gameweek) {
      throw new Error("Gameweek not found");
    }
    if (Date.now() > gameweek.deadline) {
      throw new Error("Gameweek deadline has passed");
    }
    
    // Check if team already exists for this user/gameweek/league
    const existingTeam = await ctx.db
      .query("userTeams")
      .withIndex("by_user_gameweek", (q) => q.eq("userId", args.userId).eq("gameweekId", args.gameweekId))
      .filter((q) => q.eq(q.field("fantasyLeagueId"), args.fantasyLeagueId))
      .first();
    
    const teamData = {
      userId: args.userId,
      gameweekId: args.gameweekId,
      fantasyLeagueId: args.fantasyLeagueId,
      formation: args.formation,
      
      goalkeeper: args.goalkeeper,
      defenders: args.defenders,
      midfielders: args.midfielders,
      forwards: args.forwards,
      
      benchGoalkeeper: args.benchGoalkeeper,
      benchDefender: args.benchDefender,
      benchMidfielder: args.benchMidfielder,
      benchForward: args.benchForward,
      
      captainId: args.captainId,
      viceCaptainId: args.viceCaptainId,
      
      substitutionTokensUsed: existingTeam?.substitutionTokensUsed || 0,
      totalPoints: existingTeam?.totalPoints || 0,
      isSubmitted: true,
      submittedAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    if (existingTeam) {
      // Update existing team
      await ctx.db.patch(existingTeam._id, teamData);
      return existingTeam._id;
    } else {
      // Create new team
      teamData.createdAt = Date.now();
      return await ctx.db.insert("userTeams", teamData);
    }
  },
});

// Get user's fantasy team for a specific gameweek and league
export const getUserTeam = query({
  args: {
    userId: v.id("users"),
    gameweekId: v.id("gameweeks"),
    fantasyLeagueId: v.id("fantasyLeagues"),
  },
  
  handler: async (ctx, args) => {
    const team = await ctx.db
      .query("userTeams")
      .withIndex("by_user_gameweek", (q) => q.eq("userId", args.userId).eq("gameweekId", args.gameweekId))
      .filter((q) => q.eq(q.field("fantasyLeagueId"), args.fantasyLeagueId))
      .first();
    
    if (!team) {
      return null;
    }
    
    // Get all player details
    const playerIds = [
      team.goalkeeper,
      ...team.defenders,
      ...team.midfielders,
      ...team.forwards,
      team.benchGoalkeeper,
      team.benchDefender,
      team.benchMidfielder,
      team.benchForward,
    ];
    
    const players = await Promise.all(
      playerIds.map(async (playerId) => {
        const player = await ctx.db.get(playerId);
        if (player) {
          const team = await ctx.db.get(player.realTeamId);
          return { ...player, realTeam: team };
        }
        return null;
      })
    );
    
    // Organize players by position
    const playersMap = {};
    players.forEach((player, index) => {
      if (player) {
        playersMap[playerIds[index]] = player;
      }
    });
    
    return {
      ...team,
      players: {
        goalkeeper: playersMap[team.goalkeeper],
        defenders: team.defenders.map(id => playersMap[id]),
        midfielders: team.midfielders.map(id => playersMap[id]),
        forwards: team.forwards.map(id => playersMap[id]),
        benchGoalkeeper: playersMap[team.benchGoalkeeper],
        benchDefender: playersMap[team.benchDefender],
        benchMidfielder: playersMap[team.benchMidfielder],
        benchForward: playersMap[team.benchForward],
        captain: playersMap[team.captainId],
        viceCaptain: playersMap[team.viceCaptainId],
      },
    };
  },
});

// Update captain and vice-captain
export const updateCaptains = mutation({
  args: {
    userId: v.id("users"),
    gameweekId: v.id("gameweeks"),
    fantasyLeagueId: v.id("fantasyLeagues"),
    captainId: v.id("players"),
    viceCaptainId: v.id("players"),
  },
  
  handler: async (ctx, args) => {
    const team = await ctx.db
      .query("userTeams")
      .withIndex("by_user_gameweek", (q) => q.eq("userId", args.userId).eq("gameweekId", args.gameweekId))
      .filter((q) => q.eq(q.field("fantasyLeagueId"), args.fantasyLeagueId))
      .first();
    
    if (!team) {
      throw new Error("Team not found");
    }
    
    // Check if gameweek deadline has passed
    const gameweek = await ctx.db.get(args.gameweekId);
    if (!gameweek) {
      throw new Error("Gameweek not found");
    }
    if (Date.now() > gameweek.deadline) {
      throw new Error("Gameweek deadline has passed");
    }
    
    // Validate captain and vice-captain are in the starting XI
    const startingXI = [team.goalkeeper, ...team.defenders, ...team.midfielders, ...team.forwards];
    if (!startingXI.includes(args.captainId)) {
      throw new Error("Captain must be in the starting XI");
    }
    if (!startingXI.includes(args.viceCaptainId)) {
      throw new Error("Vice-captain must be in the starting XI");
    }
    if (args.captainId === args.viceCaptainId) {
      throw new Error("Captain and vice-captain must be different players");
    }
    
    await ctx.db.patch(team._id, {
      captainId: args.captainId,
      viceCaptainId: args.viceCaptainId,
      updatedAt: Date.now(),
    });
    
    return team._id;
  },
});

// Get user's team summary (for dashboard)
export const getUserTeamSummary = query({
  args: {
    userId: v.id("users"),
    fantasyLeagueId: v.optional(v.id("fantasyLeagues")),
  },
  
  handler: async (ctx, args) => {
    // Get current gameweek (assume Premier League for now)
    const currentGameweek = await ctx.db
      .query("gameweeks")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .filter((q) => q.eq(q.field("league"), "premier_league"))
      .first();
    
    if (!currentGameweek) {
      return null;
    }
    
    // If no league specified, get user's first league
    let leagueId = args.fantasyLeagueId;
    if (!leagueId) {
      const membership = await ctx.db
        .query("leagueMemberships")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .first();
      if (membership) {
        leagueId = membership.fantasyLeagueId;
      }
    }
    
    if (!leagueId) {
      return { gameweek: currentGameweek, team: null };
    }
    
    const team = await ctx.db
      .query("userTeams")
      .withIndex("by_user_gameweek", (q) => q.eq("userId", args.userId).eq("gameweekId", currentGameweek._id))
      .filter((q) => q.eq(q.field("fantasyLeagueId"), leagueId))
      .first();
    
    return {
      gameweek: currentGameweek,
      team: team,
      hasSubmittedTeam: !!team?.isSubmitted,
    };
  },
});

// Make substitution (using substitution tokens)
export const makeSubstitution = mutation({
  args: {
    userId: v.id("users"),
    gameweekId: v.id("gameweeks"),
    fantasyLeagueId: v.id("fantasyLeagues"),
    playerOutId: v.id("players"),
    playerInId: v.id("players"),
  },
  
  handler: async (ctx, args) => {
    const team = await ctx.db
      .query("userTeams")
      .withIndex("by_user_gameweek", (q) => q.eq("userId", args.userId).eq("gameweekId", args.gameweekId))
      .filter((q) => q.eq(q.field("fantasyLeagueId"), args.fantasyLeagueId))
      .first();
    
    if (!team) {
      throw new Error("Team not found");
    }
    
    // Check substitution tokens (max 2 per gameweek)
    if (team.substitutionTokensUsed >= 2) {
      throw new Error("No substitution tokens remaining");
    }
    
    // Validate that we can make this substitution
    // (This would need more complex logic for substitution windows)
    
    // For now, just increment the token count
    await ctx.db.patch(team._id, {
      substitutionTokensUsed: team.substitutionTokensUsed + 1,
      updatedAt: Date.now(),
    });
    
    return team._id;
  },
});

// Check if team is valid for submission
export const validateTeamForSubmission = query({
  args: {
    formation: v.string(),
    defenders: v.array(v.id("players")),
    midfielders: v.array(v.id("players")),
    forwards: v.array(v.id("players")),
  },
  
  handler: async (ctx, args) => {
    try {
      validateFormation(args.formation, args.defenders.length, args.midfielders.length, args.forwards.length);
      return { isValid: true, errors: [] };
    } catch (error) {
      return { isValid: false, errors: [error.message] };
    }
  },
}); 