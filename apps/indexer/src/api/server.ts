// src/server.ts
import express from "express";
import { fetchAndSaveEvents } from "../service/indexer";
import logger from "../utils/logger";

const app = express();
app.use(express.json());

app.post("/indexer/run", async (req, res) => {
  logger.info("Manual run of the indexer initiated");
  try {
    await fetchAndSaveEvents();
    res.json({ status: "Indexer run successfully" });
    logger.info("Manual run of the indexer completed successfully");
  } catch (error) {
    logger.error(`Error running indexer manually: ${error.message}`);
    res.status(500).json({ error: "Indexer run failed" });
  }
});

app.get("/indexer/status", async (req, res) => {
  logger.info("Fetching indexer status");
  try {
    const events = await db
      .select()
      .from(trackedEvents)
      .leftJoin(eventResults, trackedEvents.id.equals(eventResults.eventId));
    res.json(events);
    logger.info("Indexer status retrieved successfully");
  } catch (error) {
    logger.error(`Error fetching indexer status: ${error.message}`);
    res.status(500).json({ error: "Failed to retrieve status" });
  }
});

app.listen(3000, () => {
  logger.info("API server running on http://localhost:3000");
});
