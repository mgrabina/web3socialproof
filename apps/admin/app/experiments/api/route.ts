// pages/api/variants/index.ts
import { getUserProtocol } from "@/utils/database/users";
import { db, eq, InsertVariant, variantsTable } from "@web3socialproof/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const protocol = await getUserProtocol();

    if (!protocol) {
      return NextResponse.json(
        { error: "No protocol found for the user." },
        { status: 404 }
      );
    }

    const variants = await db
      .select()
      .from(variantsTable)
      .where(eq(variantsTable.protocol_id, protocol.id));

    return NextResponse.json(variants, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch variants:", error);
    return NextResponse.json(
      { error: "Failed to fetch variants." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const {
    name,
    enabled,
    type,
    message,
    sub_message,
    iconSrc,
    iconName,
    delay,
    timer,
    styling,
    hostnames,
    pathnames,
  } = await req.json();

  const protocol = await getUserProtocol();

  if (!protocol) {
    return NextResponse.json(
      { error: "No protocol found for the user." },
      { status: 404 }
    );
  }

  if (!name || !type) {
    return NextResponse.json(
      { error: "Name and type are required." },
      { status: 400 }
    );
  }

  const newVariant: InsertVariant = {
    name,
    message,
    sub_message,
    iconSrc,
    iconName,
    delay,
    timer,
    protocol_id: protocol.id,
    styling,
    // hostnames,
    // pathnames,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    await db.insert(variantsTable).values(newVariant);
    return NextResponse.json(newVariant, { status: 201 });
  } catch (error) {
    console.error("Failed to create the variant:", error);
    return NextResponse.json(
      { error: "Failed to create the variant. " },
      { status: 500 }
    );
  }
}
