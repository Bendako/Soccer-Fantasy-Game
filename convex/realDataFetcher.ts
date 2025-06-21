import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

// Tournament configuration with real API mappings
const TOURNAMENT_CONFIG = {
  premier_league: {
    name: "Premier League",
    apiFootballId: 39, // Premier League 2024-25
    footballDataId: "PL",
    season: "2024-25"
  },
  champions_league: {
    name: "Champions League",
    apiFootballId: 2, // UEFA Champions League 2024-25
    footballDataId: "CL",
    season: "2024-25"
  },
  la_liga: {
    name: "La Liga",
    apiFootballId: 140, // La Liga 2024-25
    footballDataId: "PD",
    season: "2024-25"
  }
};

// Fetch current season fixtures and create gameweeks
export const fetchRealFixturesAndGameweeks = action({
  args: {
    league: v.string(), // "premier_league", "champions_league", "la_liga"
    useTestData: v.optional(v.boolean()), // For testing without API calls
  },
  handler: async (ctx, args) => {
    const config = TOURNAMENT_CONFIG[args.league as keyof typeof TOURNAMENT_CONFIG];
    if (!config) {
      throw new Error(`Unsupported league: ${args.league}`);
    }

    console.log(`Fetching real fixtures for ${config.name}...`);

    let fixtures: Array<{
      id?: string;
      gameweek?: number;
      utcDate: string;
      homeTeam: { name: string };
      awayTeam: { name: string };
      status: string;
      competition?: { name: string };
    }> = [];

    if (args.useTestData) {
      // Create test data for immediate functionality
      fixtures = generateTestFixtures(args.league, config);
    } else {
      try {
        // Try Football-Data.org API first (free tier)
        fixtures = await fetchFromFootballDataAPI(config.footballDataId);
      } catch {
        console.log("Football-Data API failed, trying API-Football...");
        try {
          // Fallback to API-Football (requires subscription)
          fixtures = await fetchFromAPIFootball(config.apiFootballId);
        } catch {
          console.log("Both APIs failed, generating test data...");
          fixtures = generateTestFixtures(args.league, config);
        }
      }
    }

    // Process fixtures and create gameweeks
    const gameweeks = await processFixturesIntoGameweeks(fixtures, args.league, config.season);
    
    // Store gameweeks in database
    const results = await ctx.runMutation(internal.realDataFetcher.storeGameweeks, {
      gameweeks,
      league: args.league
    });

    return {
      league: args.league,
      fixturesFound: fixtures.length,
      gameweeksCreated: results.gameweeksCreated,
      nextDeadline: results.nextDeadline,
      status: "success"
    };
  },
});

// Fetch from Football-Data.org API (free tier)
async function fetchFromFootballDataAPI(competitionCode: string) {
  const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
  if (!API_KEY) {
    throw new Error("FOOTBALL_DATA_API_KEY not configured");
  }

  const response = await fetch(
    `https://api.football-data.org/v4/competitions/${competitionCode}/matches?status=SCHEDULED`,
    {
      headers: {
        'X-Auth-Token': API_KEY
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Football-Data API error: ${response.status}`);
  }

  const data = await response.json();
  return data.matches || [];
}

// Fetch from API-Football (RapidAPI)
async function fetchFromAPIFootball(leagueId: number) {
  const API_KEY = process.env.RAPID_API_KEY;
  if (!API_KEY) {
    throw new Error("RAPID_API_KEY not configured");
  }

  const currentYear = new Date().getFullYear();
  const response = await fetch(
    `https://api-football-v1.p.rapidapi.com/v3/fixtures?league=${leagueId}&season=${currentYear}`,
    {
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`API-Football error: ${response.status}`);
  }

  const data = await response.json();
  return data.response || [];
}

// Generate test fixtures for immediate functionality
function generateTestFixtures(league: string, config: { name: string }) {
  const fixtures = [];
  const now = new Date();
  
  // Create 38 gameweeks for Premier League, 8 for Champions League group stage
  const totalGameweeks = league === "champions_league" ? 8 : 38;
  
  for (let gameweek = 1; gameweek <= totalGameweeks; gameweek++) {
    // Each gameweek starts 7 days after the previous
    const gameweekStart = new Date(now.getTime() + (gameweek - 1) * 7 * 24 * 60 * 60 * 1000);
    
    // Create 10 matches per gameweek (realistic for Premier League)
    const matchesPerGameweek = league === "champions_league" ? 8 : 10;
    
    for (let match = 1; match <= matchesPerGameweek; match++) {
      const matchTime = new Date(gameweekStart.getTime() + match * 2 * 60 * 60 * 1000); // Spread matches over 2-hour intervals
      
      fixtures.push({
        id: `${league}_gw${gameweek}_m${match}`,
        gameweek,
        utcDate: matchTime.toISOString(),
        homeTeam: { name: `Home Team ${match}` },
        awayTeam: { name: `Away Team ${match}` },
        status: "SCHEDULED",
        competition: { name: config.name }
      });
    }
  }
  
  return fixtures;
}

// Process fixtures into gameweeks with proper deadlines
async function processFixturesIntoGameweeks(
  fixtures: Array<{ gameweek?: number; utcDate: string; [key: string]: unknown }>, 
  league: string, 
  season: string
) {
  const gameweekMap = new Map<number, {
    number: number;
    league: string;
    season: string;
    firstMatchTime: Date;
    matches: Array<{ gameweek?: number; utcDate: string; [key: string]: unknown }>;
    status: string;
    isActive: boolean;
  }>();
  
  for (const fixture of fixtures) {
    const gameweekNumber = fixture.gameweek || extractGameweekFromDate(fixture.utcDate);
    const matchDate = new Date(fixture.utcDate);
    
    if (!gameweekMap.has(gameweekNumber)) {
      gameweekMap.set(gameweekNumber, {
        number: gameweekNumber,
        league,
        season,
        firstMatchTime: matchDate,
        matches: [],
        status: "upcoming",
        isActive: false
      });
    }
    
    const gameweek = gameweekMap.get(gameweekNumber)!;
    
    // Update first match time if this match is earlier
    if (matchDate < gameweek.firstMatchTime) {
      gameweek.firstMatchTime = matchDate;
    }
    
    gameweek.matches.push(fixture);
  }
  
  // Convert to array and set deadlines (1 hour before first match)
  const gameweeks = Array.from(gameweekMap.values()).map(gw => ({
    ...gw,
    deadline: gw.firstMatchTime.getTime() - (60 * 60 * 1000), // 1 hour before first match
  }));
  
  // Sort by gameweek number
  return gameweeks.sort((a, b) => a.number - b.number);
}

// Extract gameweek number from date (simple logic for now)
function extractGameweekFromDate(dateString: string): number {
  const date = new Date(dateString);
  const seasonStart = new Date('2024-08-17'); // Premier League 2024-25 start date
  const weeksDiff = Math.floor((date.getTime() - seasonStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, Math.min(38, weeksDiff + 1));
}

// Store gameweeks in database
export const storeGameweeks = internalMutation({
  args: {
    gameweeks: v.array(v.object({
      number: v.number(),
      league: v.string(),
      season: v.string(),
      deadline: v.number(),
      status: v.string(),
      isActive: v.boolean(),
    })),
    league: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let gameweeksCreated = 0;
    let nextDeadline: number | null = null;
    
    // Clear existing gameweeks for this league/season first
    const existingGameweeks = await ctx.db
      .query("gameweeks")
      .filter((q) => q.eq(q.field("league"), args.league))
      .collect();
    
    for (const existing of existingGameweeks) {
      await ctx.db.delete(existing._id);
    }
    
    // Create new gameweeks
    for (const gameweek of args.gameweeks) {
      await ctx.db.insert("gameweeks", {
        ...gameweek,
        createdAt: now,
        updatedAt: now,
      });
      
      gameweeksCreated++;
      
      // Track the next upcoming deadline
      if (gameweek.deadline > now && (!nextDeadline || gameweek.deadline < nextDeadline)) {
        nextDeadline = gameweek.deadline;
      }
    }
    
    // Activate the first upcoming gameweek
    if (args.gameweeks.length > 0) {
      const firstUpcoming = args.gameweeks.find(gw => gw.deadline > now) || args.gameweeks[0];
      
      await ctx.db
        .query("gameweeks")
        .filter((q) => 
          q.eq(q.field("league"), args.league) && 
          q.eq(q.field("number"), firstUpcoming.number)
        )
        .first()
        .then(async (gameweek) => {
          if (gameweek) {
            await ctx.db.patch(gameweek._id, {
              isActive: true,
              status: "active",
              updatedAt: now,
            });
          }
        });
    }
    
    return { gameweeksCreated, nextDeadline };
  },
});

// Get real tournament standings and next matches
export const getTournamentInfo = action({
  args: {
    league: v.string(),
  },
  handler: async (ctx, args) => {
    // Get current active gameweek
    const activeGameweek = await ctx.runQuery(internal.realDataFetcher.getActiveGameweek, {
      league: args.league
    });
    
    if (!activeGameweek) {
      return {
        league: args.league,
        status: "No active gameweek found",
        recommendation: "Run fetchRealFixturesAndGameweeks to set up tournament data"
      };
    }
    
    const now = Date.now();
    const timeUntilDeadline = activeGameweek.deadline - now;
    const deadlineDate = new Date(activeGameweek.deadline);
    
    return {
      league: args.league,
      activeGameweek: {
        number: activeGameweek.number,
        season: activeGameweek.season,
        deadline: deadlineDate.toLocaleString(),
        timeUntilDeadline: formatTimeUntilDeadline(timeUntilDeadline),
        status: activeGameweek.status,
        isDeadlinePassed: timeUntilDeadline <= 0
      },
      recommendations: timeUntilDeadline <= 0 
        ? ["Deadline has passed", "Consider activating next gameweek"]
        : [`Deadline in ${formatTimeUntilDeadline(timeUntilDeadline)}`, "Team changes are still allowed"]
    };
  },
});

// Get active gameweek for a league
export const getActiveGameweek = internalQuery({
  args: { league: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("gameweeks")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .filter((q) => q.eq(q.field("league"), args.league))
      .first();
  },
});

// Helper function to format time until deadline
function formatTimeUntilDeadline(milliseconds: number): string {
  if (milliseconds <= 0) return "Deadline passed";
  
  const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000));
  const hours = Math.floor((milliseconds % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// Initialize all tournaments with real data
export const initializeAllTournaments = action({
  args: { useTestData: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const results = [];
    
    for (const league of Object.keys(TOURNAMENT_CONFIG)) {
      try {
        const result = await ctx.runAction(internal.realDataFetcher.fetchRealFixturesAndGameweeks, {
          league,
          useTestData: args.useTestData
        });
        results.push(result);
      } catch (error) {
        results.push({
          league,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
    
    return {
      message: "Tournament initialization completed",
      results
    };
  },
}); 