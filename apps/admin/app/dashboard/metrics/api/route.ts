import { getUserProtocol } from "@/utils/database/users";
import {
  db,
  metricsTable,
  variablesTable,
  metricsVariablesTable,
  eq,
} from "@web3socialproof/db";
import {
  InsertMetric,
  InsertVariable,
  InsertMetricsVariable,
} from "@web3socialproof/db";
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

    const metrics = await db
      .select()
      .from(metricsTable)
      .where(eq(metricsTable.protocol_id, protocol.id));

    return NextResponse.json(metrics, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch metrics." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const {
    name,
    description,
    calculation_type,
    enabled = true,
    variables,
  } = await req.json();

  const protocol = await getUserProtocol();

  if (!protocol) {
    return NextResponse.json(
      { error: "No protocol found for the user." },
      { status: 404 }
    );
  }

  if (!name || !calculation_type) {
    return NextResponse.json(
      { error: "Name and calculation_type are required." },
      { status: 400 }
    );
  }

  // Insert the new metric
  const newMetric: InsertMetric = {
    name,
    description: description || "",
    calculation_type,
    enabled,
    protocol_id: protocol.id,
    created_at: new Date(),
    updated_at: new Date(),
  };

  try {
    const [insertedMetric] = await db
      .insert(metricsTable)
      .values(newMetric)
      .returning();

    // Prepare variables for bulk insert
    const variableRecords: InsertVariable[] = variables.map(
      (variable: any) => ({
        protocol_id: protocol.id,
        chain_id: parseInt(variable.chain_id, 10),
        contract_address: variable.contract_address,
        event_name: variable.event_name,
        topic_index:
          variable.topic_index === "N/A"
            ? null
            : parseInt(variable.topic_index, 10),
        data_key: variable.data_key,
        start_block: variable.start_block,
        enabled: true,
        created_at: new Date(),
        updated_at: new Date(),
      })
    );

    // Bulk insert variables and get inserted IDs
    const insertedVariables = await db
      .insert(variablesTable)
      .values(variableRecords)
      .returning();

    // Prepare relationships for bulk insert
    const relationRecords: InsertMetricsVariable[] = insertedVariables.map(
      (variable) => ({
        metric_id: insertedMetric.id,
        variable_id: variable.id,
        created_at: new Date(),
      })
    );

    // Bulk insert relations
    await db.insert(metricsVariablesTable).values(relationRecords);

    return NextResponse.json(
      { metric: insertedMetric, variables: insertedVariables },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating metric with variables:", error);
    return NextResponse.json(
      { error: "Failed to create the metric and variables." },
      { status: 500 }
    );
  }
}
