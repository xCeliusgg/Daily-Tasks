import React, { useState, useEffect } from "react";
import axios from "axios";
import { format, isToday, parseISO } from "date-fns";
import "./App.css";

// Main App component that handles the entire task tracking application
function App() {
  // State management for tasks and UI
  const [tasks, setTasks] = useState([]); // Array to store all tasks for current day
  const [newTask, setNewTask] = useState(""); // Input state for new task title
  const [newDescription, setNewDescription] = useState(""); // Input state for task description
  const [priority, setPriority] = useState("medium"); // Priority level for new task
  const [loading, setLoading] = useState(true); // Loading state for API calls
  const [error, setError] = useState(null); // Error state for error handling
  const [stats, setStats] = useState({}); // Statistics for current day
  const [lastReset, setLastReset] = useState(""); // Last reset date for daily refresh tracking

  // API base URL - uses proxy in development
  const API_BASE = process.env.NODE_ENV === "production" ? "" : "";

  // Effect hook to fetch tasks and stats on component mount and when dependencies change
  useEffect(() => {
    fetchTasks();
    fetchStats();

    // Set up interval to check for daily reset every minute
    const interval = setInterval(() => {
      checkDailyReset();
    }, 60000); // Check every minute

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Function to fetch all tasks from the backend
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/tasks`);
      setTasks(response.data.tasks || []);
      setLastReset(response.data.lastReset || "");
      setError(null);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch statistics for current day
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/stats`);
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // Function to check if daily reset is needed
  const checkDailyReset = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/tasks`);
      const currentLastReset = response.data.lastReset;

      // If last reset date changed, refresh the page to get new tasks
      if (currentLastReset !== lastReset && lastReset !== "") {
        window.location.reload();
      }
    } catch (err) {
      console.error("Error checking daily reset:", err);
    }
  };

  // Function to add a new task
  const addTask = async (e) => {
    e.preventDefault();

    if (!newTask.trim()) return; // Don't add empty tasks

    try {
      const response = await axios.post(`${API_BASE}/api/tasks`, {
        title: newTask.trim(),
        description: newDescription.trim(),
        priority: priority,
      });

      // Add new task to local state
      setTasks([...tasks, response.data]);

      // Clear form inputs
      setNewTask("");
      setNewDescription("");
      setPriority("medium");

      // Refresh stats
      fetchStats();

      setError(null);
    } catch (err) {
      console.error("Error adding task:", err);
      setError("Failed to add task. Please try again.");
    }
  };

  // Function to toggle task completion status
  const toggleTask = async (id, completed) => {
    try {
      const response = await axios.put(`${API_BASE}/api/tasks/${id}`, {
        completed: !completed,
      });

      // Update task in local state
      setTasks(tasks.map((task) => (task.id === id ? response.data : task)));

      // Refresh stats
      fetchStats();

      setError(null);
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task. Please try again.");
    }
  };

  // Function to delete a task
  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/tasks/${id}`);

      // Remove task from local state
      setTasks(tasks.filter((task) => task.id !== id));

      // Refresh stats
      fetchStats();

      setError(null);
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task. Please try again.");
    }
  };

  // Function to get priority color for styling
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#dc3545";
      case "medium":
        return "#ffc107";
      case "low":
        return "#28a745";
      default:
        return "#6c757d";
    }
  };

  // Function to format date for display
  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return isToday(date) ? "Today" : format(date, "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  // Render loading state
  if (loading && tasks.length === 0) {
    return (
      <div className="App">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your daily tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Header section with title and current date */}
      <header className="header">
        <h1>📋 Daily Task Tracker</h1>
        <p className="date">{formatDate(new Date().toISOString())}</p>
      </header>

      {/* Statistics section showing completion progress */}
      <div className="stats-container">
        <div className="stats-card">
          <h3>Today's Progress</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{stats.totalTasks || 0}</span>
              <span className="stat-label">Total Tasks</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.completedTasks || 0}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.pendingTasks || 0}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.completionRate || 0}%</span>
              <span className="stat-label">Completion Rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error message display */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Add new task form */}
      <div className="add-task-container">
        <form onSubmit={addTask} className="add-task-form">
          <div className="form-row">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="What needs to be done today?"
              className="task-input"
              maxLength={100}
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="priority-select"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <button type="submit" className="add-button">
              Add Task
            </button>
          </div>
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Optional description..."
            className="description-input"
            maxLength={500}
          />
        </form>
      </div>

      {/* Tasks list section */}
      <div className="tasks-container">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks for today! 🎉</p>
            <p>Add your first task above to get started.</p>
          </div>
        ) : (
          <div className="tasks-list">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`task-item ${task.completed ? "completed" : ""}`}
              >
                <div className="task-content">
                  <div className="task-header">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id, task.completed)}
                      />
                      <span className="checkmark"></span>
                    </label>
                    <h3
                      className={`task-title ${
                        task.completed ? "completed-text" : ""
                      }`}
                    >
                      {task.title}
                    </h3>
                    <span
                      className="priority-badge"
                      style={{
                        backgroundColor: getPriorityColor(task.priority),
                      }}
                    >
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p
                      className={`task-description ${
                        task.completed ? "completed-text" : ""
                      }`}
                    >
                      {task.description}
                    </p>
                  )}
                  <div className="task-meta">
                    <span className="task-date">
                      Created: {formatDate(task.createdAt)}
                    </span>
                    {task.completed && task.completedAt && (
                      <span className="task-completed-date">
                        Completed: {formatDate(task.completedAt)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="delete-button"
                  title="Delete task"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with daily reset information */}
      <footer className="footer">
        <p>
          Tasks reset daily at midnight. Last reset:{" "}
          {lastReset ? formatDate(lastReset) : "Today"}
        </p>
        <p>Your data is saved locally and will persist between sessions.</p>
      </footer>
    </div>
  );
}

export default App;
