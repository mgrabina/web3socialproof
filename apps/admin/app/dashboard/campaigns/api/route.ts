// pages/api/campaigns/index.ts
import { getUserProtocol } from "@/utils/database/users";
import { db, campaignsTable, eq } from "@web3socialproof/db";
import { InsertCampaign } from "@web3socialproof/db";
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

    const campaigns = await db
      .select()
      .from(campaignsTable)
      .where(eq(campaignsTable.protocol_id, protocol.id));

    return NextResponse.json(campaigns, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch campaigns." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { name, enabled, type, mainText, subText } = await req.json();

  const protocol = await getUserProtocol();

  if (!protocol) {
    return NextResponse.json(
      { error: "No protocol found for the user." },
      { status: 404 }
    );
  }

  console.log("Name: ", name);
  console.log("Type: ", type);
  console.log(req.body);
  if (!name || !type) {
    return NextResponse.json(
      { error: "Name and type are required." },
      { status: 400 }
    );
  }

  const newCampaign: InsertCampaign = {
    name,
    message: mainText,
    sub_message: subText,
    enabled: true,
    protocol_id: protocol.id,
    type,
    created_at: new Date(),
    updated_at: new Date(),
  };

  try {
    await db.insert(campaignsTable).values(newCampaign);
    return NextResponse.json(newCampaign, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create the campaign." },
      { status: 500 }
    );
  }
}
