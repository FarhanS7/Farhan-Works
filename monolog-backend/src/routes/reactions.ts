import express from "express";
import { z } from "zod";
import { invalidateCache } from "../lib/cache.js";
import { query } from "../lib/db.js";

const router = express.Router();

const VALID_REACTION_TYPES = ["like", "heart", "clap"] as const;

const reactionSchema = z.object({
  post_id: z.string().uuid({ message: "Invalid post ID" }),
  type: z.enum(VALID_REACTION_TYPES, {
    errorMap: () => ({ message: "Invalid reaction type" }),
  }),
});

const getClientIp = (req: express.Request) => {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.ip ||
    "unknown"
  );
};

// Public: Get reactions for a post + current user state
router.get("/:post_id", async (req, res) => {
  const { post_id } = req.params;
  const ip = getClientIp(req);

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      post_id,
    )
  ) {
    return res.status(400).json({ message: "Invalid post ID format" });
  }

  try {
    const counts = await query(
      "SELECT reaction_type, COUNT(*) as count FROM reactions WHERE post_id = $1 GROUP BY reaction_type",
      [post_id],
    );

    const userState = await query(
      "SELECT reaction_type FROM reactions WHERE post_id = $1 AND ip_address = $2 LIMIT 1",
      [post_id, ip],
    );

    res.json({
      reactions: counts.rows,
      userReaction: userState.rows[0]?.reaction_type || null,
    });
  } catch (err) {
    console.error("Error fetching reactions:", err);
    res.status(500).json({ message: "Error fetching reactions" });
  }
});

// Public: React to a post (IP-based, unique per reaction type)
router.post("/", async (req, res) => {
  const parsed = reactionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const { post_id, type } = parsed.data;
  const ip = getClientIp(req);

  try {
    await query(
      "INSERT INTO reactions (post_id, ip_address, reaction_type) VALUES ($1, $2, $3)",
      [post_id, ip, type],
    );

    res.status(201).json({ message: "Reaction recorded" });
  } catch (err: any) {
    if (err.code === "23505") {
      return res
        .status(400)
        .json({ message: "You have already reacted this way" });
    }
    console.error("Error recording reaction:", err);
    res.status(500).json({ message: "Error recording reaction" });
  }
});

export default router;
