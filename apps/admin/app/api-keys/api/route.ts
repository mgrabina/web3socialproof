// pages/api/apiKeys/route.ts
import { NextRequest, NextResponse } from "next/server";
import { apiKeyTable, db } from "@web3socialproof/db";

// Generate a random API key
function generateRandomKey() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const prefix = "sk_test_51";
  let result = prefix;
  for (let i = 0; i < 32; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Handle GET requests
export async function GET() {
  try {
    const keys = await db.select().from(apiKeyTable);
    return NextResponse.json(keys, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

// Handle POST requests
export async function POST(req: NextRequest) {
  const { name, protocol_id } = await req.json();

  if (!name || !protocol_id) {
    return NextResponse.json(
      { error: "Name and protocol_id are required" },
      { status: 400 }
    );
  }

  const newKey = {
    api_key: generateRandomKey(),
    protocol_id,
    name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    enabled: true,
  };

  try {
    await db.insert(apiKeyTable).values(newKey);
    return NextResponse.json(newKey, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}
