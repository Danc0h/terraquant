import express from "express";
import ordersRoutes from "./routes/trading/orders.js";
import batchesRoutes from "./routes/trading/batches.js";
import ledgerRoutes from "./routes/trading/ledger.js";
import RegistryProjectsRoutes from "./routes/trading/RegistryProjects.js";

const app = express();
app.use(express.json());

// Trading routes
app.use("/trading/orders", ordersRoutes);
app.use("/trading/batches", batchesRoutes);
app.use("/trading/ledger", ledgerRoutes);
app.use("/trading/verified-projects", RegistryProjectsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
