import { Router } from "express";
import { supabase } from "../supabaseClient";

const router = Router();

router.get("/", async (req, res) => {
  const { userId } = req.query;

  if (!userId)
    return res.status(401).json({ error: "Unauthorized: userId is required" });

  const { data, error } = await supabase
    .from("signals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return res.status(400).json({ error: error.message });

  return res.status(200).json(data);
});

export default router;
