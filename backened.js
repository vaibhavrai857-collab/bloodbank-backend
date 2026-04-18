const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());


/* =========================
   NEON POSTGRES CONNECTION
========================= */
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
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

    /* CHECK EXISTING DONOR
       (phone OR aadhaar)
    */
    const existing = await db.query(
      `
      SELECT *
      FROM donors
      WHERE phone = $1
      OR aadhaar = $2
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [d.phone, d.aadhaar]
    );

    /* 3 MONTH RULE */
    if (existing.rows.length > 0) {
      const lastDate = new Date(existing.rows[0].created_at);
      const now = new Date();

      const monthsDiff =
        (now.getFullYear() - lastDate.getFullYear()) * 12 +
        (now.getMonth() - lastDate.getMonth());

      if (monthsDiff < 3) {
        return res.json({
          message: "❌ You can donate again after 3 months"
        });
      }
    }

    /* INSERT NEW DONOR */
    await db.query(
      `
      INSERT INTO donors
      (name, age, blood, phone, city, aadhaar)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        d.name,
        d.age,
        d.blood,
        d.phone,
        d.city,
        d.aadhaar
      ]
    );

    res.json({
      message: "Donor Registered Successfully ✅"
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error ❌"
    });
  }
});


/* =========================
   GET ALL DONORS
========================= */
app.get("/donors", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM donors ORDER BY id DESC"
    );

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
    await db.query(
      "DELETE FROM donors WHERE id = $1",
      [req.params.id]
    );

    res.json({
      message: "Donor Deleted ✅"
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Delete Failed ❌"
    });
  }
});


/* =========================
   SEARCH DONOR
========================= */
app.get("/search", async (req, res) => {
  try {
    let blood = req.query.blood || "";
    let city = req.query.city || "";

    /* CLEAN INPUT */
    blood = blood
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");

    city = city
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");

    const result = await db.query(
      `
      SELECT *
      FROM donors
      WHERE REPLACE(UPPER(blood), ' ', '') = $1
      AND REPLACE(LOWER(city), ' ', '') = $2
      `,
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
      `
      INSERT INTO requests
      (name, blood, phone, city)
      VALUES ($1, $2, $3, $4)
      `,
      [
        r.name,
        r.blood,
        r.phone,
        r.city
      ]
    );

    res.json({
      message: "Request Saved ✅"
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Request Failed ❌"
    });
  }
});


/* =========================
   GET ALL REQUESTS
========================= */
app.get("/requests", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM requests ORDER BY id DESC"
    );

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
    await db.query(
      "DELETE FROM requests WHERE id = $1",
      [req.params.id]
    );

    res.json({
      message: "Request Deleted ✅"
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Delete Failed ❌"
    });
  }
});


/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
/* =========================
   ADD HOSPITAL
========================= */
app.post("/add-hospital", async (req, res) => {
  try {
    const h = req.body;

    await db.query(
      `
      INSERT INTO hospitals
      (hospital_name, contact_person, phone, email, city)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        h.hospital_name,
        h.contact_person,
        h.phone,
        h.email,
        h.city
      ]
    );

    res.json({
      message: "Hospital Connected Successfully ✅"
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Hospital Registration Failed ❌"
    });
  }
});
