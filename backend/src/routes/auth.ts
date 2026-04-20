import { Router } from "express";
import { supabase } from "../supabaseClient";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return res.status(400).json({ error: error.message });
  return res.status(200).json({ message: "Registration successful", data });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(400).json({ error: error.message });

  const token = jwt.sign(
    { sub: data.user?.id, email: data.user?.email },
    JWT_SECRET,
    { expiresIn: "1d" },
  );

  return res
    .status(200)
    .json({ message: "Login successful", token, user: data.user });
});

export default router;
