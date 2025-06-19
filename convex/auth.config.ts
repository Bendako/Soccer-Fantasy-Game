export default {
  providers: [
    {
      domain: process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL || "https://sweet-mastodon-40.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
}; 