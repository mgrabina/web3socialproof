// pages/api/campaigns/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import { db, campaignsTable, eq, impressionsTable } from "@web3socialproof/db";
import { NextRequest, NextResponse } from "next/server";
import { getUserProtocol } from "@/utils/database/users";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { name, enabled, type } = await req.json();

  const protocol = await getUserProtocol();

  if (!protocol) {
    return NextResponse.json(
      { error: "No protocol found for the user." },
      { status: 404 }
    );
  }

  const campaignInDb = await db
    .select()
    .from(campaignsTable)
    .where(eq(campaignsTable.id, Number(id)));

  if (campaignInDb.length === 0) {
    return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
  }

  if (campaignInDb[0].protocol_id !== protocol.id) {
    return NextResponse.json(
      { error: "Campaign not found for the user." },
      { status: 404 }
    );
  }

  try {
    const updatedCampaign = await db
      .update(campaignsTable)
      .set({ name, enabled, type, updated_at: new Date() })
      .where(eq(campaignsTable.id, Number(id)));
    return NextResponse.json(updatedCampaign, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update the campaign." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const protocol = await getUserProtocol();

  if (!protocol) {
    return NextResponse.json(
      { error: "No protocol found for the user." },
      { status: 404 }
    );
  }

  const campaignInDb = await db
    .select()
    .from(campaignsTable)
    .where(eq(campaignsTable.id, Number(id)));

  if (campaignInDb.length === 0) {
    return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
  }

  if (campaignInDb[0].protocol_id !== protocol.id) {
    return NextResponse.json(
      { error: "Campaign not found for the user." },
      { status: 404 }
    );
  }

  try {
    await db.delete(impressionsTable).where(eq(impressionsTable.campaign_id, Number(id)));
    await db.delete(campaignsTable).where(eq(campaignsTable.id, Number(id)));
    
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete the campaign." },
      { status: 500 }
    );
  }
}
