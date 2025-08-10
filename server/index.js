const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup for security and logging
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for React frontend
app.use(morgan("combined")); // Request logging
app.use(express.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname, "../client/build"))); // Serve React build

// Data storage path - using JSON file for persistence
const DATA_FILE = path.join(__dirname, "data/tasks.json");

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  const initialData = {
    tasks: [],
    lastReset: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
    history: [],
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

// Utility function to read tasks from file
function readTasks() {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading tasks:", error);
    return {
      tasks: [],
      lastReset: new Date().toISOString().split("T")[0],
      history: [],
    };
  }
}

// Utility function to write tasks to file
function writeTasks(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("Error writing tasks:", error);
    return false;
  }
}

// Function to check if daily reset is needed
// IMPORTANT: This function now preserves tasks but resets their completion status
// Instead of clearing all tasks daily, it keeps the task list persistent
// and only marks all tasks as incomplete at midnight
function checkDailyReset() {
  const data = readTasks();
  const today = new Date().toISOString().split("T")[0]; // Current date in YYYY-MM-DD format

  // If last reset was not today, perform daily reset
  if (data.lastReset !== today) {
    console.log(`Performing daily reset: ${data.lastReset} -> ${today}`);

    // Move current tasks to history before resetting
    if (data.tasks.length > 0) {
      const completedTasks = data.tasks.filter((task) => task.completed);
      if (completedTasks.length > 0) {
        data.history.push({
          date: data.lastReset,
          completedTasks: completedTasks,
          totalTasks: data.tasks.length,
          completedCount: completedTasks.length,
        });
      }
    }

    // Instead of clearing tasks, keep them but mark all as incomplete
    // This allows users to have persistent daily tasks that reset completion status
    data.tasks.forEach((task) => {
      task.completed = false;
      task.completedAt = null;
    });

    data.lastReset = today;

    // Save the updated data
    writeTasks(data);
    return true; // Reset was performed
  }

  return false; // No reset needed
}

// API Routes

// GET /api/tasks - Get all tasks for current day
app.get("/api/tasks", (req, res) => {
  // Check for daily reset before returning tasks
  checkDailyReset();

  const data = readTasks();
  res.json({
    tasks: data.tasks,
    lastReset: data.lastReset,
    today: new Date().toISOString().split("T")[0],
  });
});

// POST /api/tasks - Create a new task
app.post("/api/tasks", (req, res) => {
  const { title, description, priority = "medium" } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Task title is required" });
  }

  // Check for daily reset before adding task
  checkDailyReset();

  const data = readTasks();

  const newTask = {
    id: Date.now().toString(), // Simple ID generation using timestamp
    title: title.trim(),
    description: description ? description.trim() : "",
    priority: priority,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };

  data.tasks.push(newTask);

  if (writeTasks(data)) {
    res.status(201).json(newTask);
  } else {
    res.status(500).json({ error: "Failed to save task" });
  }
});

// PUT /api/tasks/:id - Update a task (mark as complete/incomplete)
app.put("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { completed, title, description, priority } = req.body;

  const data = readTasks();
  const taskIndex = data.tasks.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  // Update task properties
  if (completed !== undefined) {
    data.tasks[taskIndex].completed = completed;
    data.tasks[taskIndex].completedAt = completed
      ? new Date().toISOString()
      : null;
  }

  if (title !== undefined) {
    data.tasks[taskIndex].title = title.trim();
  }

  if (description !== undefined) {
    data.tasks[taskIndex].description = description.trim();
  }

  if (priority !== undefined) {
    data.tasks[taskIndex].priority = priority;
  }

  if (writeTasks(data)) {
    res.json(data.tasks[taskIndex]);
  } else {
    res.status(500).json({ error: "Failed to update task" });
  }
});

// DELETE /api/tasks/:id - Delete a task
app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;

  const data = readTasks();
  const taskIndex = data.tasks.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  data.tasks.splice(taskIndex, 1);

  if (writeTasks(data)) {
    res.json({ message: "Task deleted successfully" });
  } else {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// GET /api/history - Get task history
app.get("/api/history", (req, res) => {
  const data = readTasks();
  res.json(data.history || []);
});

// GET /api/stats - Get current day statistics
app.get("/api/stats", (req, res) => {
  const data = readTasks();
  const today = data.lastReset;

  const totalTasks = data.tasks.length;
  const completedTasks = data.tasks.filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  res.json({
    today,
    totalTasks,
    completedTasks,
    pendingTasks,
    completionRate,
  });
});

// Serve React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Daily Task Tracker is ready!`);
  console.log(`Frontend will be available at: http://localhost:${PORT}`);
  console.log(`API endpoints available at: http://localhost:${PORT}/api`);

  // Perform initial daily reset check on startup
  if (checkDailyReset()) {
    console.log("Daily reset performed on startup");
  }
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  process.exit(0);
});
