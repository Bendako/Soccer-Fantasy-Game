"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function SeedPage() {
  const seedDatabase = useMutation(api.seedData.seedDatabase);
  const checkSeededData = useMutation(api.seedData.checkSeededData);

  const handleSeedDatabase = async () => {
    try {
      const result = await seedDatabase();
      alert(`Database seeded successfully! 
      Teams created: ${result.teamsCreated}
      Players created: ${result.playersCreated}`);
    } catch (error) {
      alert(`Error seeding database: ${error}`);
    }
  };

  const handleCheckData = async () => {
    try {
      const result = await checkSeededData();
      alert(`Database status:
      Teams: ${result.teams}
      Players: ${result.players}
      Is Seeded: ${result.isSeeded}`);
    } catch (error) {
      alert(`Error checking database: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Seeding Admin</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Database Management</h2>
            <p className="text-gray-600">
              Use these tools to seed the database with Premier League teams and players.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleCheckData}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Check Database Status
            </button>
            
            <button
              onClick={handleSeedDatabase}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Seed Database
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes:</h3>
            <ul className="text-yellow-700 space-y-1 text-sm">
              <li>• Always check database status before seeding</li>
              <li>• Seeding will add Premier League teams and players</li>
              <li>• This includes ~70 players from 10 teams</li>
              <li>• Each player has realistic stats and data</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">What gets seeded:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-800">Teams (10):</h4>
                <ul className="space-y-1">
                  <li>• Manchester City</li>
                  <li>• Arsenal</li>
                  <li>• Liverpool</li>
                  <li>• Manchester United</li>
                  <li>• Chelsea</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">More Teams:</h4>
                <ul className="space-y-1">
                  <li>• Tottenham Hotspur</li>
                  <li>• Newcastle United</li>
                  <li>• Brighton & Hove Albion</li>
                  <li>• Aston Villa</li>
                  <li>• West Ham United</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 