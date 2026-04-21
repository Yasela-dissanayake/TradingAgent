import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import analyzeRoutes from "./routes/analyze";
import signalRoutes from "./routes/signals";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL, // set to your Vercel URL in Railway env vars
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);
app.options("*", cors()); // handle preflight for all routes
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
