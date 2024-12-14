import { getUserProtocol } from "@/utils/database/users";
import { db, eq, InsertVariant, variantsTable } from "@web3socialproof/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET endpoint: Retrieve a specific variant by ID
 * Verifies the variant belongs to the user's protocol before returning it.
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
    const variant = await db
      .select()
      .from(variantsTable)
      .where(eq(variantsTable.id, Number(id)))
      .then((result) => result[0]);

    if (!variant) {
      return NextResponse.json(
        { error: "Variant not found." },
        { status: 404 }
      );
    }

    if (variant.protocol_id !== protocol.id) {
      return NextResponse.json(
        { error: "Variant not found for the user." },
        { status: 404 }
      );
    }

    return NextResponse.json(variant, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch variant:", error);
    return NextResponse.json(
      { error: "Failed to fetch variant." },
      { status: 500 }
    );
  }
}

/**
 * PATCH endpoint: Update a variant
 * Allows editing all fields of a variant, provided they match the user's protocol.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const updates: InsertVariant = await req.json();

  const protocol = await getUserProtocol();

  if (!protocol) {
    return NextResponse.json(
      { error: "No protocol found for the user." },
      { status: 404 }
    );
  }

  const variantInDb = await db
    .select()
    .from(variantsTable)
    .where(eq(variantsTable.id, Number(id)));

  if (variantInDb.length === 0) {
    return NextResponse.json({ error: "Variant not found." }, { status: 404 });
  }

  if (variantInDb[0].protocol_id !== protocol.id) {
    return NextResponse.json(
      { error: "Variant not found for the user." },
      { status: 404 }
    );
  }

  // Add updated_at field
  updates.updated_at = new Date().toISOString();

  try {
    const updatedVariant = await db
      .update(variantsTable)
      .set({ ...updates })
      .where(eq(variantsTable.id, Number(id)));

    return NextResponse.json(updatedVariant, { status: 200 });
  } catch (error) {
    console.error("Failed to update variant:", error);
    return NextResponse.json(
      { error: "Failed to update the variant." },
      { status: 500 }
    );
  }
}

/**
 * DELETE endpoint: Delete a variant
 * Deletes the variant and associated impressions if it matches the user's protocol.
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

  const variantInDb = await db
    .select()
    .from(variantsTable)
    .where(eq(variantsTable.id, Number(id)));

  if (variantInDb.length === 0) {
    return NextResponse.json({ error: "Variant not found." }, { status: 404 });
  }

  if (variantInDb[0].protocol_id !== protocol.id) {
    return NextResponse.json(
      { error: "Variant not found for the user." },
      { status: 404 }
    );
  }

  try {
    await db.delete(variantsTable).where(eq(variantsTable.id, Number(id)));
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error("Failed to delete variant:", error);
    return NextResponse.json(
      { error: "Failed to delete the variant." },
      { status: 500 }
    );
  }
}
