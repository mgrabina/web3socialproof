import {
  HypersyncClient,
  Log,
  presetQueryLogsOfEvent,
} from "@envio-dev/hypersync-client";
import {
  db,
  eventsTable,
  InsertEvent,
  variablesTable,
} from "@web3socialproof/db";
import logger from "../utils/logger";
import keccak256 from "keccak256";
import { createClients } from "../utils/hypersync";

if (!process.env.HYPERSYNC_BEARER_TOKEN) {
  throw new Error("HYPERSYNC_BEARER_TOKEN environment variable not set");
}

async function fetchAndSaveNewEvents() {
  logger.info("Starting event fetching process");

  const clients = await createClients();

  const variablesToTrack = await db.select().from(variablesTable);

  for (const variable of variablesToTrack) {
    const query = presetQueryLogsOfEvent(
      variable.contract_address,
      keccak256(variable.event_name).toString(),
      variable.start_block ?? 0
    );

    logger.debug(`Processing event: ${JSON.stringify(variable)}`);

    const getValue = (log: Log): number => {
      if (
        variable.topic_index !== null &&
        variable.topic_index !== undefined &&
        variable.topic_index > 0
      ) {
        return Number(log.topics[variable.topic_index]);
      } else if (variable.data_key) {
        return Number(log.data); // todo : decode and select by key
      }

      logger.error(`Could not get value from log: ${JSON.stringify(log)}`);

      return 0;
    };

    try {
      const queryResponse = await clients[variable.chain_id].get(query);

      const eventsToInsert: InsertEvent[] = queryResponse.data.logs.map(
        (log) => {
          return {
            chain_id: variable.chain_id,
            variable_id: variable.id,
            transaction_hash: log.transactionHash,
            block_number: log.blockNumber,
            timestamp: new Date(1000),
            value: getValue(log),
          } as InsertEvent;
        }
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

setInterval(fetchAndSaveNewEvents, 60000); // Poll every minute
