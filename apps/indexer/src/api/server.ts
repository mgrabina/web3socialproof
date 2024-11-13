// src/server.ts
import express from "express";
import { fetchAndSaveNewEvents } from "../service/indexer";
import logger from "../utils/logger";
import { db, eq, logsTable } from "@web3socialproof/db";

const app = express();
app.use(express.json());

let isPaused = false;
let interval: NodeJS.Timeout | null = null;

// Function to start the indexer
const startIndexer = () => {
  if (!interval) {
    // Run immediately the first time
    fetchAndSaveNewEvents({});

    // Set the interval to run subsequently
    interval = setInterval(() => {
      if (!isPaused) {
        fetchAndSaveNewEvents({});
      }
    }, 1000 * 60 * 5); // Poll every 5 minutes
  }
};

// Function to stop the indexer
const stopIndexer = () => {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
};

// Start indexer at server start
startIndexer();

// Pause indexer
app.post("/indexer/pause", (req, res) => {
  isPaused = true;
  logger.info("Indexer paused");
  res.json({ status: "Indexer paused" });
});

// Resume indexer
app.post("/indexer/play", (req, res) => {
  isPaused = false;
  logger.info("Indexer resumed");
  res.json({ status: "Indexer resumed" });
});

// Force index specific range of blocks
app.post("/indexer/index-range", async (req: any, res: any) => {
  const { startBlock, endBlock } = req.body;
  if (startBlock === undefined || endBlock === undefined) {
    return res
      .status(400)
      .json({ error: "startBlock and endBlock are required" });
  }
  logger.info(
    `Manual indexing of block range from ${startBlock} to ${endBlock} initiated`
  );
  try {
    // Fetch events in the specified block range
    await fetchAndSaveNewEvents({ startBlock, endBlock });
    res.json({ status: "Block range indexing completed successfully" });
    logger.info("Manual block range indexing completed successfully");
  } catch (error: any) {
    logger.error(`Error indexing block range: ${error?.message}`);
    res.status(500).json({ error: "Failed to index block range" });
  }
});

// Force re-index specific variables
app.post("/indexer/reindex", async (req: any, res: any) => {
  const { variableIds } = req.body;
  if (
    !variableIds ||
    !Array.isArray(variableIds) ||
    typeof variableIds[0] !== "number"
  ) {
    return res.status(400).json({ error: "variableIds array is required" });
  }
  logger.info(`Re-indexing initiated for variables: ${variableIds.join(", ")}`);
  try {
    // Filter and fetch events for the specified variables
    await fetchAndSaveNewEvents({
      variableIds: variableIds as number[],
    });
    res.json({ status: "Re-indexing completed successfully" });
    logger.info("Re-indexing completed successfully");
  } catch (error: any) {
    logger.error(`Error re-indexing variables: ${error?.message}`);
    res.status(500).json({ error: "Failed to re-index variables" });
  }
});

app.listen(3002, () => {
  logger.info("API server running on http://localhost:3002");
});
