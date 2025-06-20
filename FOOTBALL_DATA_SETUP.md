# Football-data.org Integration Guide

## Overview

Your fantasy football app now supports real data from Football-data.org! This free API provides comprehensive football data including teams, players, matches, and statistics.

## Setup Steps

### 1. Get Your API Token

1. Go to [Football-data.org](https://www.football-data.org/client/register)
2. Sign up for a free account
3. Once registered, you'll get an API token
4. Copy your token - you'll need it in step 2

### 2. Add API Token to Environment

Add your Football-data.org token to your Convex environment:

```bash
npx convex env set FOOTBALL_DATA_TOKEN your_token_here
```

### 3. Fetch Real Data

You can now fetch real football data using the Convex dashboard or your app:

#### Option A: Using Convex Dashboard

1. Go to your Convex dashboard
2. Navigate to "Functions"
3. Run these actions:

**Test API Connection:**
```
setupFootballData.checkAPIStatus()
```

**Fetch Premier League Teams:**
```
setupFootballData.setupPremierLeague()
```

**Fetch Teams for Other Leagues:**
```
dataFetching.fetchTeamsForLeague({ league: "la_liga" })
dataFetching.fetchTeamsForLeague({ league: "serie_a" })
dataFetching.fetchTeamsForLeague({ league: "bundesliga" })
dataFetching.fetchTeamsForLeague({ league: "ligue_1" })
```

**Fetch Players for a Team:**
```
dataFetching.fetchPlayersForTeam({ teamId: "57" })  // Arsenal's ID
```

#### Option B: Using Your App

Add buttons to your admin interface to trigger data fetching:

```typescript
// Example React component
const AdminPanel = () => {
  const setupPremierLeague = useMutation(api.setupFootballData.setupPremierLeague);
  const checkAPI = useMutation(api.setupFootballData.checkAPIStatus);

  return (
    <div>
      <button onClick={() => checkAPI()}>Test API</button>
      <button onClick={() => setupPremierLeague()}>Setup Premier League</button>
    </div>
  );
};
```

## Available Leagues

The following leagues are supported:

- **premier_league** - English Premier League
- **la_liga** - Spanish La Liga  
- **serie_a** - Italian Serie A
- **bundesliga** - German Bundesliga
- **ligue_1** - French Ligue 1
- **champions_league** - UEFA Champions League

## API Rate Limits

Football-data.org free tier has these limits:
- **100 requests per day**
- **10 requests per minute**

Our data fetching automatically includes delays to respect these limits.

## Data Structure

### Teams
- External ID (from Football-data.org)
- Name and short name
- League
- Logo URL
- Founded year
- Venue and website

### Players  
- External ID (from Football-data.org)
- Name and position (mapped to GK/DEF/MID/FWD)
- Team association
- Nationality and date of birth

## Troubleshooting

### "API connection failed"
- Check your API token is correct
- Ensure you've set the environment variable
- Verify you haven't exceeded rate limits

### "Team not found in database"
- Fetch teams first before fetching players
- Make sure the team's external ID exists

### Rate Limit Errors
- Wait for the daily/minute limits to reset
- Consider upgrading to a paid plan for higher limits

## Next Steps

1. **Start with Premier League**: Run `setupPremierLeague()` to get started
2. **Add other leagues**: Fetch teams for your preferred leagues
3. **Get players**: Fetch players for specific teams (be mindful of rate limits)
4. **Test your app**: Check that real data appears in your fantasy leagues

## Pro Tips

- **Use the free tier wisely**: Focus on 1-2 leagues initially
- **Cache data**: The data doesn't change frequently, so cache it in your database
- **Monitor usage**: Keep track of your API calls to avoid hitting limits
- **Consider paid plans**: For production apps or more leagues, consider Football-data.org's paid tiers

## Support

- Football-data.org docs: https://www.football-data.org/documentation/quickstart
- API coverage: https://www.football-data.org/coverage

Your fantasy football app is now ready to use real football data! 🚀⚽ 