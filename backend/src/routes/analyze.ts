import { Router } from "express";
import axios from "axios";
import { supabase } from "../supabaseClient";

const router = Router();
let AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
if (AI_SERVICE_URL && !AI_SERVICE_URL.startsWith("http")) {
  AI_SERVICE_URL = `https://${AI_SERVICE_URL}`;
}

router.post("/", async (req, res) => {
  const { asset, userId } = req.body;

  if (!userId)
    return res.status(401).json({ error: "Unauthorized: userId is required" });

  try {
    const response = await axios.post(`${AI_SERVICE_URL}/analyze`, {
      asset,
    });
    const { signal, confidence, explanation } = response.data;

    const { data, error } = await supabase
      .from("signals")
      .insert([{ user_id: userId, asset, signal, confidence, explanation }])
      .select();

    if (error) throw new Error(error.message);

    return res.status(200).json(data[0]);
  } catch (err: any) {
    const errorMsg =
      err.response?.data?.detail || err.response?.data?.error || err.message;
    return res.status(500).json({ error: errorMsg });
  }
});

export default router;
