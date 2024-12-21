// pages/api/apiKeys/route.ts
import { generateRandomKey } from "@/lib/utils";
import { apiKeyTable, db } from "@web3socialproof/db";
import { NextRequest, NextResponse } from "next/server";

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
    key: generateRandomKey(),
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
    console.error("Failed to create API key:", error);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}
