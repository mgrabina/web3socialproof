import { NextResponse } from "next/server";
import { db, contractsTable, eq } from "@web3socialproof/db";
import { getUserProtocol } from "@/utils/database/users";

export async function GET() {
  const protocol = await getUserProtocol();

  if (!protocol) {
    return NextResponse.json(
      { error: "No protocol found for the user." },
      { status: 404 }
    );
  }

  const contracts = await db
    .select()
    .from(contractsTable)
    .where(eq(contractsTable.protocol_id, protocol.id));
    
  return NextResponse.json(contracts);
}
