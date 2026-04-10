import express from "express";
import {
  getRecentTrades,
  getTicker,
  get24hVolume,
} from "../../services/trading/marketDataService.js";

const router = express.Router();

router.get("/trades/:batchId", async (req, res, next) => {
  try {
    const trades = await getRecentTrades(req.params.batchId);
    res.json(trades);
  } catch (err) {
    next(err);
  }
});

router.get("/ticker/:batchId", async (req, res, next) => {
  try {
    const ticker = await getTicker(req.params.batchId);
    res.json(ticker);
  } catch (err) {
    next(err);
  }
});

router.get("/volume/:batchId", async (req, res, next) => {
  try {
    const volume = await get24hVolume(req.params.batchId);
    res.json({ volume });
  } catch (err) {
    next(err);
  }
});

export default router;
