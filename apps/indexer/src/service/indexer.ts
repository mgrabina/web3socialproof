import {
  HypersyncClient,
  Log,
  presetQueryLogsOfEvent,
} from "@envio-dev/hypersync-client";
import {
  db,
  eventsTable,
  inArray,
  InsertEvent,
  variablesTable,
} from "@web3socialproof/db";
import logger from "../utils/logger";
import keccak256 from "keccak256";
import { createClients } from "../utils/hypersync";

if (!process.env.HYPERSYNC_BEARER_TOKEN) {
  throw new Error("HYPERSYNC_BEARER_TOKEN environment variable not set");
}

export async function fetchAndSaveNewEvents({
  startBlock,
  endBlock,
  variableIds,
}: {
  startBlock?: number;
  endBlock?: number;
  variableIds?: number[];
}) {
  logger.info("Starting event fetching process");

  const clients = await createClients();

  // Fetch variables from the database, optionally filtered by specific variable IDs
  let variablesToTrack;
  if (variableIds) {
    variablesToTrack = await db
      .select()
      .from(variablesTable)
      .where(inArray(variablesTable.id, variableIds));
  } else {
    variablesToTrack = await db.select().from(variablesTable);
  }

  for (const variable of variablesToTrack) {
    const blockStart = startBlock ?? variable.start_block ?? 0;
    const blockEnd = endBlock; // Replace "latest" with the max block if using integer values

    const query = presetQueryLogsOfEvent(
      variable.contract_address,
      keccak256(variable.event_name).toString(),
      blockStart,
      blockEnd
    );

    logger.debug(
      `Processing event for variable ID ${variable.id}: ${JSON.stringify(variable)}`
    );

    const getValue = (log: Log): number => {
      if (
        variable.topic_index !== null &&
        variable.topic_index !== undefined &&
        variable.topic_index > 0
      ) {
        return Number(log.topics[variable.topic_index]);
      } else if (variable.data_key) {
        return Number(log.data); // TODO: decode and select by key
      }

      logger.error(`Could not get value from log: ${JSON.stringify(log)}`);
      return 0;
    };

    try {
      const queryResponse = await clients[variable.chain_id].get(query);

      const eventsToInsert: InsertEvent[] = queryResponse.data.logs.map(
        (log) => ({
          chain_id: variable.chain_id,
          variable_id: variable.id,
          transaction_hash: log.transactionHash ?? "",
          block_number: log.blockNumber ?? 0,
          timestamp: new Date(1000), // replace with actual log timestamp if available
          value: getValue(log),
        })
      );

      logger.debug("Events to insert: ", eventsToInsert);

      const inserted = await db
        .insert(eventsTable)
        .values(eventsToInsert)
        .returning();

      if (!inserted.length) {
        logger.error(`No events inserted for event ${variable.id}`);
      }
    } catch (error) {
      logger.error(`Error fetching events for variable ${variable.id}`, error);
    }
  }

  logger.info("Event fetching process completed");
}
