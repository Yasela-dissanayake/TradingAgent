import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import analyzeRoutes from "./routes/analyze";
import signalRoutes from "./routes/signals";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const corsOptions = {
  origin: true, // reflect the request origin — allows all origins
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/analyze", analyzeRoutes);
app.use("/signals", signalRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
