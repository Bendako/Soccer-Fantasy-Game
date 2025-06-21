/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as dataFetching from "../dataFetching.js";
import type * as fantasyLeagues from "../fantasyLeagues.js";
import type * as fantasyTeams from "../fantasyTeams.js";
import type * as gameweeks from "../gameweeks.js";
import type * as imageUpdateUtility from "../imageUpdateUtility.js";
import type * as playerImageService from "../playerImageService.js";
import type * as players from "../players.js";
import type * as realDataFetcher from "../realDataFetcher.js";
import type * as realPlayerDataFetcher from "../realPlayerDataFetcher.js";
import type * as realTeams from "../realTeams.js";
import type * as seedData from "../seedData.js";
import type * as setupFootballData from "../setupFootballData.js";
import type * as updatePlayerImages from "../updatePlayerImages.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  dataFetching: typeof dataFetching;
  fantasyLeagues: typeof fantasyLeagues;
  fantasyTeams: typeof fantasyTeams;
  gameweeks: typeof gameweeks;
  imageUpdateUtility: typeof imageUpdateUtility;
  playerImageService: typeof playerImageService;
  players: typeof players;
  realDataFetcher: typeof realDataFetcher;
  realPlayerDataFetcher: typeof realPlayerDataFetcher;
  realTeams: typeof realTeams;
  seedData: typeof seedData;
  setupFootballData: typeof setupFootballData;
  updatePlayerImages: typeof updatePlayerImages;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
