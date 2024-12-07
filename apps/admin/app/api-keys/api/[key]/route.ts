// pages/api/apiKeys/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { apiKeyTable, db, eq } from "@web3socialproof/db";

// Handle DELETE requests
export async function DELETE(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  const { key } = params; // Get the key from the URL path parameter

  if (!key) {
    return NextResponse.json(
      { error: "API key ID is required" },
      { status: 400 }
    );
  }

  try {
    await db.delete(apiKeyTable).where(eq(apiKeyTable.api_key, key));
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse(null, { status: 500 });
  }
}
