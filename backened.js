const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors({
  origin: "*"
}));
app.use(express.json());

/* ================= PLANETSCALE CONNECTION ================= */
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: true }
});

/* SAFE DB CONNECT */
db.connect((err) => {
  if (err) {
    console.log("❌ DB Connection Failed:", err.message);
  } else {
    console.log("✅ PlanetScale Connected");
  }
});

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.send("Blood Bank API Running ✅");
});

/* ================= API ================= */

// ADD DONOR
app.post("/add-donor", (req, res) => {
  const d = req.body;

  const sql =
    "INSERT INTO donors (name, age, blood, phone, city, aadhaar) VALUES (?,?,?,?,?,?)";

  db.query(sql, [d.name, d.age, d.blood, d.phone, d.city, d.aadhaar], (err) => {
    if (err) {
      return res.status(500).json({ message: "Error adding donor ❌" });
    }
    res.json({ message: "Donor Added ✅" });
  });
});

// GET DONORS
app.get("/donors", (req, res) => {
  db.query("SELECT * FROM donors", (err, data) => {
    if (err) return res.json([]);
    res.json(data);
  });
});

// DELETE DONOR
app.delete("/delete-donor/:id", (req, res) => {
  db.query("DELETE FROM donors WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "Delete failed ❌" });

    res.json({ message: "Deleted ✅" });
  });
});

// SEARCH DONOR
app.get("/search", (req, res) => {
  const { blood, city } = req.query;

  db.query(
    "SELECT * FROM donors WHERE blood=? AND city=?",
    [blood, city],
    (err, data) => {
      if (err) return res.json([]);
      res.json(data);
    }
  );
});

// BLOOD REQUEST
app.post("/request-blood", (req, res) => {
  const r = req.body;

  db.query(
    "INSERT INTO requests (name, blood, phone, city) VALUES (?,?,?,?)",
    [r.name, r.blood, r.phone, r.city],
    (err) => {
      if (err) return res.status(500).json({ message: "Error ❌" });

      res.json({ message: "Request Saved ✅" });
    }
  );
});

// COUNTS
app.get("/count-donors", (req, res) => {
  db.query("SELECT COUNT(*) AS total FROM donors", (err, data) => {
    res.json(data[0]);
  });
});

app.get("/count-requests", (req, res) => {
  db.query("SELECT COUNT(*) AS total FROM requests", (err, data) => {
    res.json(data[0]);
  });
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});