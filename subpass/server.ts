import "dotenv/config";
import express, { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_KEY as string,
);

const app = express();
app.use(express.json());

app.get("/ingredients", async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("ingredients").select("*");

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
  return res.json(data);
});

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
