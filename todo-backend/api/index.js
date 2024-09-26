require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const port = 4000;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.use(cors());
app.use(express.json());

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    if (password.length <= 6) {
      return res
        .status(400)
        .json({ error: "Password must be longer than 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
      [username, hashedPassword]
    );

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while registering" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username)
      return res.status(400).json({ error: "Username is required" });

    const user = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (user.rows.length === 0) return res.status(401).send("User not found");
    if (!password)
      return res.status(400).json({ error: "Password is required" });

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) return res.status(401).send("Invalid password");

    const token = jwt.sign({ id: user.rows[0].id }, "your_secret_key");
    res.json({ token });
  } catch (error) {
    console.log(error);
  }
});

// Middleware untuk otentikasi
const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).send("Token is required");
  jwt.verify(token, "your_secret_key", (err, decoded) => {
    if (err) return res.status(403).send("Invalid token");
    req.userId = decoded.id;
    next();
  });
};

app.post("/todos", authMiddleware, async (req, res) => {
  const { task } = req.body;

  if (!task) {
    return res.status(400).json({ error: "Task is required" });
  }
  const existingTask = await pool.query(
    "SELECT * FROM todos WHERE LOWER(task) = LOWER($1) AND user_id = $2",
    [task, req.userId]
  );

  if (existingTask.rows.length > 0) {
    return res.status(400).json({ error: "Task already exists" });
  }

  const result = await pool.query(
    "INSERT INTO todos (task, user_id) VALUES ($1, $2) RETURNING *",
    [task, req.userId]
  );

  res.json(result.rows[0]);
});

app.get("/todos", authMiddleware, async (req, res) => {
  const result = await pool.query("SELECT * FROM todos WHERE user_id = $1", [
    req.userId,
  ]);
  res.json(result.rows);
});

app.delete("/todos/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json({ message: "Todo deleted successfully", todo: result.rows[0] });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the todo" });
  }
});

app.patch("/todos/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body; // Mengharapkan { completed: true/false } dalam body
  try {
    const result = await pool.query(
      "UPDATE todos SET completed = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
      [completed, id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json({ message: "Todo updated successfully", todo: result.rows[0] });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the todo" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
