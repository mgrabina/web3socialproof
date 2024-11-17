import { NextApiRequest, NextApiResponse } from "next";
import { db, campaignsTable, eq, InsertCampaign } from "@web3socialproof/db";
import { NextRequest, NextResponse } from "next/server";
import { getUserProtocol } from "@/utils/database/users";

/**
 * GET endpoint: Retrieve a specific campaign by ID
 * Verifies the campaign belongs to the user's protocol before returning it.
 */
export async function GET(
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

  try {
    const campaign = await db
      .select()
      .from(campaignsTable)
      .where(eq(campaignsTable.id, Number(id)))
      .then((result) => result[0]);

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found." },
        { status: 404 }
      );
    }

    if (campaign.protocol_id !== protocol.id) {
      return NextResponse.json(
        { error: "Campaign not found for the user." },
        { status: 404 }
      );
    }

    return NextResponse.json(campaign, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch campaign:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign." },
      { status: 500 }
    );
  }
}

/**
 * PATCH endpoint: Update a campaign
 * Allows editing all fields of a campaign, provided they match the user's protocol.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const updates: InsertCampaign = await req.json();

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

  // Add updated_at field
  updates.updated_at = new Date().toISOString();

  try {
    const updatedCampaign = await db
      .update(campaignsTable)
      .set({ ...updates })
      .where(eq(campaignsTable.id, Number(id)));

    return NextResponse.json(updatedCampaign, { status: 200 });
  } catch (error) {
    console.error("Failed to update campaign:", error);
    return NextResponse.json(
      { error: "Failed to update the campaign." },
      { status: 500 }
    );
  }
}

/**
 * DELETE endpoint: Delete a campaign
 * Deletes the campaign and associated impressions if it matches the user's protocol.
 */
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
    await db.delete(campaignsTable).where(eq(campaignsTable.id, Number(id)));
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error("Failed to delete campaign:", error);
    return NextResponse.json(
      { error: "Failed to delete the campaign." },
      { status: 500 }
    );
  }
}
