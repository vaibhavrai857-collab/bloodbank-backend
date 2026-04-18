const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   NEON DB CONNECTION
========================= */
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("Blood Bank API Running 🚀");
});

/* =========================
   ADD DONOR
========================= */
app.post("/add-donor", async (req, res) => {
  try {
    const d = req.body;

    await db.query(
      "INSERT INTO donors (name, age, blood, phone, city, aadhaar) VALUES ($1,$2,$3,$4,$5,$6)",
      [d.name, d.age, d.blood, d.phone, d.city, d.aadhaar]
    );

    res.json({ message: "Donor Added ✅" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error adding donor ❌" });
  }
});

/* =========================
   GET DONORS
========================= */
app.get("/donors", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM donors ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json([]);
  }
});

/* =========================
   DELETE DONOR
========================= */
app.delete("/delete-donor/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM donors WHERE id=$1", [req.params.id]);
    res.json({ message: "Donor Deleted ✅" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Delete Failed ❌" });
  }
});

/* =========================
   SEARCH DONOR
========================= */
app.get("/search", async (req, res) => {
  try {
    const { blood, city } = req.query;

    const result = await db.query(
      `SELECT * FROM donors 
       WHERE LOWER(blood) = LOWER($1)
       AND LOWER(city) = LOWER($2)`,
      [blood, city]
    );

    res.json(result.rows);

  } catch (err) {
    console.log(err);
    res.status(500).json([]);
  }
});

/* =========================
   REQUEST BLOOD
========================= */
app.post("/request-blood", async (req, res) => {
  try {
    const r = req.body;

    await db.query(
      "INSERT INTO requests (name, blood, phone, city) VALUES ($1,$2,$3,$4)",
      [r.name, r.blood, r.phone, r.city]
    );

    res.json({ message: "Request Saved ✅" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error ❌" });
  }
});

/* =========================
   GET REQUESTS
========================= */
app.get("/requests", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM requests ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json([]);
  }
});

/* =========================
   DELETE REQUEST
========================= */
app.delete("/delete-request/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM requests WHERE id=$1", [req.params.id]);
    res.json({ message: "Request Deleted ✅" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Delete Failed ❌" });
  }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
