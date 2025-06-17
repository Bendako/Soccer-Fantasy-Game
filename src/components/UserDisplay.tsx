"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function UserDisplay() {
  const { user: clerkUser } = useUser();
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkUser ? { clerkId: clerkUser.id } : "skip"
  );

  return (
    <div className="space-y-2 text-sm">
      <div>
        <span className="font-medium">Clerk User:</span>{" "}
        <span className="text-green-600">
          {clerkUser ? `✅ ${clerkUser.fullName || clerkUser.firstName}` : "❌ Not found"}
        </span>
      </div>
      <div>
        <span className="font-medium">Convex User:</span>{" "}
        <span className={convexUser ? "text-green-600" : "text-red-600"}>
          {convexUser ? `✅ ${convexUser.name} (${convexUser.email})` : "❌ Not synced yet"}
        </span>
      </div>
      {!convexUser && clerkUser && (
        <div className="text-xs text-gray-500 mt-2">
          User sync in progress... Refresh the page if this persists.
        </div>
      )}
    </div>
  );
} 