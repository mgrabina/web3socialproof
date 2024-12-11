import { Log, presetQueryLogsOfEvent } from "@envio-dev/hypersync-client";
import { db, eq, inArray, logsTable, SelectLog } from "@web3socialproof/db";
import { ethers } from "ethers";
import keccak256 from "keccak256";
import { createClients } from "../utils/hypersync";
import logger from "../utils/logger";

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
  let logsToTrack;
  if (variableIds) {
    logsToTrack = await db
      .select()
      .from(logsTable)
      .where(inArray(logsTable.id, variableIds));
  } else {
    logsToTrack = await db.select().from(logsTable);
  }

  // todo - make parallel
  for (const logToTrack of logsToTrack) {
    const blockEnd = endBlock;
    let blockStart = Math.max(
      logToTrack.last_block_indexed ??
        Math.max(logToTrack.start_block ?? 0, startBlock ?? 0),
      0
    );

    const getEventTopic = (eventSignature: string) => {
      return "0x" + keccak256(eventSignature).toString("hex");
    };

    logger.debug(
      `Fetching block range: ${blockStart} - ${blockEnd ?? "latest"} for variable ID ${logToTrack.id}`
    );

    const query = presetQueryLogsOfEvent(
      logToTrack.contract_address,
      getEventTopic(logToTrack.event_name),
      blockStart,
      blockEnd
    );

    const getValue = (config: SelectLog, received: Log): bigint => {
      if (
        (!config.topic_index && config.data_key) ||
        config.topic_index === 0
      ) {
        return 1n; // Just counting the number of logs, not the value
      } else if (
        config.topic_index !== null &&
        config.topic_index !== undefined &&
        config.topic_index > 0
      ) {
        return BigInt(received.topics[config.topic_index] ?? 0);
      } else if (config.data_key) {
        const schema = config.data_schema;
        const schemaItems = config.data_schema?.split(",") ?? [];
        if (!schema || !schemaItems || schemaItems.length === 0) {
          logger.error(`No schema found for variable ${config.id}`);
          return 0n;
        }
        // Find the index of data_key within the schema
        const keyIndex = schemaItems.findIndex(
          (key) => key === config.data_key?.split(".")[0]
        );
        if (keyIndex === -1) {
          logger.error(
            `data_key ${config.data_key} not found in schema for variable ${config.id}`
          );
          return 0n;
        }
        if (!received.data) {
          logger.error(`No data found in log for variable ${config.id}`);
          return 0n;
        }

        const decoder = ethers.AbiCoder.defaultAbiCoder();
        const decodedData = decoder.decode([schema], received.data);
        return BigInt(decodedData[keyIndex]);
      }

      logger.error(
        `Could not get value from log: ${JSON.stringify(received)} for config ${JSON.stringify(config)}`
      );
      return 0n;
    };

    try {
      logger.debug(
        `Calling Envio API for chain ${logToTrack.chain_id} with query params: ${JSON.stringify(
          {
            contract_address: logToTrack.contract_address,
            event_name: getEventTopic(logToTrack.event_name),
            blockStart,
            blockEnd,
          },
          null,
          2
        )}`
      );
      const queryResponse = await clients[logToTrack.chain_id].collect(
        query,
        {}
      );
      logger.debug(
        `Query responded in ${queryResponse.totalExecutionTime}ms with ${queryResponse.data.logs.length} logs`
      );

      const newValues: bigint[] = queryResponse.data.logs.map(
        (logFromResponse) => getValue(logToTrack, logFromResponse)
      );
      let newTotalValue: bigint;
      if (logToTrack.calculation_type === "count") {
        newTotalValue = BigInt(newValues.length);
      } else if (logToTrack.calculation_type === "sum") {
        newTotalValue = newValues.reduce((acc, value) => acc + value, 0n);
      } else if (logToTrack.calculation_type === "count_unique") {
        newTotalValue = BigInt(new Set(newValues).size);
      } else {
        logger.error(
          `Unknown calculation type ${logToTrack.calculation_type} for variable ${logToTrack.id}`
        );
        continue;
      }

      const lastBlockIndexed = queryResponse.data.logs.reduce(
        (acc, log) => Math.max(acc, log.blockNumber ?? 0),
        0
      );

      logger.debug(
        `Added value for variable ${logToTrack.id}: ${newTotalValue} (from ${newValues.length} logs). Adding to current value ${logToTrack.current_result}, final value: ${(logToTrack.current_result ?? 0n) + newTotalValue}`
      );

      const updated = await db
        .update(logsTable)
        .set({
          current_result: (logToTrack.current_result ?? 0n) + newTotalValue,
          last_block_indexed: lastBlockIndexed,
        })
        .where(eq(logsTable.id, logToTrack.id))
        .returning();

      if (!updated.length) {
        logger.error(`No results updated for log ${logToTrack.id}`);
      }

      logger.info(`Log ${logToTrack.id} updated successfully`);
    } catch (error) {
      logger.error(
        `Error fetching events for variable ${logToTrack.id}: ${JSON.stringify(error, null, 2)}`
      );
    }
  }

  logger.info("Event fetching process completed");
}
