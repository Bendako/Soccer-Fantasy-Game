import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table for storing user profiles
  users: defineTable({
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
    imageUrl: v.optional(v.string()),
    favoriteRealTeamId: v.optional(v.id("realTeams")),
    favoriteLeague: v.optional(v.string()), // "premier_league", "la_liga", "champions_league"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),
  
  // Real soccer teams (e.g., Manchester United, Barcelona)
  realTeams: defineTable({
    name: v.string(),
    shortName: v.string(),
    league: v.string(), // "premier_league", "la_liga", "champions_league", etc.
    logoUrl: v.optional(v.string()),
    colors: v.optional(v.object({
      primary: v.string(),
      secondary: v.string(),
    })),
    // Additional optional fields that might exist in database
    externalId: v.optional(v.string()),
    founded: v.optional(v.number()),
    venue: v.optional(v.string()),
    website: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_league", ["league"])
    .index("by_name", ["name"])
    .index("by_external_id", ["externalId"]),
  
  // Real soccer players
  players: defineTable({
    name: v.string(),
    position: v.string(), // "GK", "DEF", "MID", "FWD"
    realTeamId: v.id("realTeams"),
    imageUrl: v.optional(v.string()),
    jerseyNumber: v.optional(v.number()),
    injured: v.boolean(),
    suspended: v.boolean(),
    // Player stats
    totalGoals: v.number(),
    totalAssists: v.number(),
    totalPoints: v.number(),
    averagePoints: v.number(),
    // Additional optional fields that might exist in database
    externalId: v.optional(v.string()),
    minutesPlayed: v.optional(v.number()),
    price: v.optional(v.number()),
    form: v.optional(v.array(v.number())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_team", ["realTeamId"])
    .index("by_position", ["position"])
    .index("by_name", ["name"])
    .index("by_total_points", ["totalPoints"])
    .index("by_external_id", ["externalId"]),
  
  // Fantasy leagues where users compete
  fantasyLeagues: defineTable({
    name: v.string(),
    type: v.string(), // "public", "private", "head_to_head", "classic"
    code: v.optional(v.string()), // Join code for private leagues
    maxParticipants: v.number(),
    currentParticipants: v.number(),
    creatorId: v.id("users"),
    league: v.string(), // Which real league this fantasy league follows
    status: v.string(), // "active", "completed", "upcoming"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_creator", ["creatorId"])
    .index("by_type", ["type"])
    .index("by_code", ["code"])
    .index("by_league", ["league"]),
  
  // User memberships in fantasy leagues
  leagueMemberships: defineTable({
    userId: v.id("users"),
    fantasyLeagueId: v.id("fantasyLeagues"),
    totalPoints: v.number(),
    rank: v.optional(v.number()),
    joinedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_league", ["fantasyLeagueId"])
    .index("by_user_league", ["userId", "fantasyLeagueId"]),
  
  // Gameweeks
  gameweeks: defineTable({
    number: v.number(),
    league: v.string(), // "premier_league", "la_liga", etc.
    season: v.string(), // "2024-25"
    deadline: v.number(), // Timestamp
    status: v.string(), // "upcoming", "active", "completed"
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_league_season", ["league", "season"])
    .index("by_number", ["number"])
    .index("by_status", ["status"])
    .index("by_active", ["isActive"]),
  
  // User's fantasy teams for each gameweek
  userTeams: defineTable({
    userId: v.id("users"),
    gameweekId: v.id("gameweeks"),
    fantasyLeagueId: v.id("fantasyLeagues"),
    formation: v.string(), // "4-3-3", "4-4-2", "3-5-2", etc.
    
    // Starting XI (11 players)
    goalkeeper: v.id("players"),
    defenders: v.array(v.id("players")), // 3-5 players
    midfielders: v.array(v.id("players")), // 3-5 players  
    forwards: v.array(v.id("players")), // 1-3 players
    
    // Bench (4 players)
    benchGoalkeeper: v.id("players"),
    benchDefender: v.id("players"),
    benchMidfielder: v.id("players"),
    benchForward: v.id("players"),
    
    // Captain system
    captainId: v.id("players"),
    viceCaptainId: v.id("players"),
    
    // Substitution tokens
    substitutionTokensUsed: v.number(),
    
    // Points
    totalPoints: v.number(),
    
    // Status
    isSubmitted: v.boolean(),
    submittedAt: v.optional(v.number()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_gameweek", ["userId", "gameweekId"])
    .index("by_user_league", ["userId", "fantasyLeagueId"])
    .index("by_gameweek", ["gameweekId"])
    .index("by_league", ["fantasyLeagueId"]),
  
  // Real soccer matches
  matches: defineTable({
    homeTeamId: v.id("realTeams"),
    awayTeamId: v.id("realTeams"),
    gameweekId: v.id("gameweeks"),
    kickoffTime: v.number(),
    status: v.string(), // "upcoming", "live", "completed", "postponed"
    
    // Match result
    homeScore: v.optional(v.number()),
    awayScore: v.optional(v.number()),
    
    // Special match types
    isBigMatch: v.boolean(),
    isDerby: v.boolean(),
    
    // Live match data
    minute: v.optional(v.number()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_gameweek", ["gameweekId"])
    .index("by_teams", ["homeTeamId", "awayTeamId"])
    .index("by_status", ["status"])
    .index("by_kickoff", ["kickoffTime"]),
  
  // Player performance in specific matches
  playerStats: defineTable({
    playerId: v.id("players"),
    matchId: v.id("matches"),
    gameweekId: v.id("gameweeks"),
    
    // Basic stats
    minutesPlayed: v.number(),
    goals: v.number(),
    assists: v.number(),
    cleanSheet: v.boolean(),
    saves: v.number(),
    
    // Disciplinary
    yellowCards: v.number(),
    redCards: v.number(),
    ownGoals: v.number(),
    penaltiesMissed: v.number(),
    
    // Bonus
    manOfTheMatch: v.boolean(),
    
    // Calculated points
    basicPoints: v.number(),
    bonusPoints: v.number(),
    totalPoints: v.number(),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_player", ["playerId"])
    .index("by_match", ["matchId"])
    .index("by_gameweek", ["gameweekId"])
    .index("by_player_gameweek", ["playerId", "gameweekId"]),
  
  // User team substitutions during gameweek
  substitutions: defineTable({
    userId: v.id("users"),
    userTeamId: v.id("userTeams"),
    gameweekId: v.id("gameweeks"),
    
    playerOutId: v.id("players"),
    playerInId: v.id("players"),
    
    // When the substitution was made
    substitutionWindow: v.string(), // "between_saturday_sunday", "between_matchdays"
    madeAt: v.number(),
    
    createdAt: v.number(),
  })
    .index("by_user_team", ["userTeamId"])
    .index("by_user_gameweek", ["userId", "gameweekId"])
    .index("by_gameweek", ["gameweekId"]),
  
  // Gameweek standings for fantasy leagues
  leagueStandings: defineTable({
    fantasyLeagueId: v.id("fantasyLeagues"),
    gameweekId: v.id("gameweeks"),
    userId: v.id("users"),
    
    gameweekPoints: v.number(),
    totalPoints: v.number(),
    rank: v.number(),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_league_gameweek", ["fantasyLeagueId", "gameweekId"])
    .index("by_league_rank", ["fantasyLeagueId", "rank"])
    .index("by_user", ["userId"]),


});
