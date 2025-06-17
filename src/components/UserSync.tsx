"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";

export default function UserSync() {
  const { user, isLoaded } = useUser();
  const createUser = useMutation(api.users.createUser);

  useEffect(() => {
    if (isLoaded && user) {
      // Sync user with Convex database
      createUser({
        clerkId: user.id,
        name: user.fullName || user.firstName || "User",
        email: user.emailAddresses[0]?.emailAddress || "",
        imageUrl: user.imageUrl,
      }).catch((error) => {
        // If user already exists, this will fail silently
        console.log("User sync:", error.message || "User already exists");
      });
    }
  }, [isLoaded, user, createUser]);

  return null; // This component doesn't render anything
} 