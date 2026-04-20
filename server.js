const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "job_portal"
});

db.connect(err => {
    if (err) console.error("DB connection error:", err);
    else console.log("DB connected!");
});

app.get("/jobs", (req, res) => {
    db.query("SELECT * FROM jobs", (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.get("/jobs/:id", (req, res) => {
    const id = parseInt(req.params.id);

    db.query("SELECT * FROM jobs WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.status(404).send("Job not found");
        res.json(results[0]);
    });
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        [username, password],
        (err, results) => {
            if (err) return res.status(500).json({ success: false });

            if (results.length > 0) {
                res.json({ success: true, user: results[0] });
            } else {
                res.json({ success: false, message: "Invalid credentials" });
            }
        }
    );
});

app.post("/register", (req, res) => {
    const { username, password } = req.body;

    const sql = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";

    db.query(sql, [username, password, "user"], (err) => {
        if (err) {
            console.error(err);
            return res.json({ success: false });
        }

        res.json({ success: true });
    });
});

app.post("/apply", (req, res) => {
    console.log("BODY:", req.body);

    const { user_id, job_id } = req.body;

    if (!user_id || !job_id) {
        return res.json({ success: false, message: "Missing data" });
    }

    db.query(
        "INSERT INTO applications (user_id, job_id) VALUES (?, ?)",
        [user_id, job_id],
        (err) => {
            if (err) {
                console.error("DB ERROR:", err);
                return res.status(500).json({ success: false });
            }
            res.json({ success: true });
        }
    );
});

app.listen(3000, () => console.log("Server running on port 3000"));