# Daily Task Tracker

A beautiful and intuitive daily task tracking application built with React frontend and Node.js/Express backend. The app automatically resets task completion status daily at midnight while keeping your task list persistent, so you don't need to recreate tasks every day. All data is saved locally and persists between sessions.

## ✨ Features

- **Daily Task Management**: Add, complete, and delete tasks with priorities
- **Automatic Daily Reset**: Task completion status automatically resets at midnight every day
- **Data Persistence**: All data is saved locally and persists between sessions
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Task Statistics**: Real-time progress tracking with completion rates
- **Priority Levels**: Set high, medium, or low priority for tasks
- **Task Descriptions**: Optional detailed descriptions for each task
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download this project**

   ```bash
   cd DailyTasks
   ```

2. **Install dependencies for both backend and frontend**

   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Start the application**

   ```bash
   # Start both backend and frontend in development mode
   npm run dev
   ```

   Or start them separately:

   ```bash
   # Start backend only
   npm run server

   # Start frontend only (in another terminal)
   npm run client
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
DailyTasks/
├── server/
│   ├── index.js          # Express server with API endpoints
│   └── data/             # Data storage directory (auto-created)
│       └── tasks.json    # Local JSON database
├── client/
│   ├── public/
│   │   └── index.html    # Main HTML file
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   ├── App.css       # Styles for the application
│   │   ├── index.js      # React entry point
│   │   └── index.css     # Base styles
│   └── package.json      # Frontend dependencies
├── package.json          # Backend dependencies and scripts
└── README.md            # This file
```

## 🎯 Key Features Explained

### Daily Reset Logic

The application automatically resets tasks every day at midnight:

1. **Server-side Check**: The backend checks the current date against the last reset date on every API request
2. **Automatic Reset**: If the date has changed, completed tasks are moved to history and all tasks are marked as incomplete
3. **Task Persistence**: Tasks persist from day to day - only their completion status resets, so you don't need to recreate them daily
4. **Data Preservation**: Completed tasks are preserved in the history for future reference

### Data Persistence

- **Local Storage**: All data is stored in a JSON file (`server/data/tasks.json`)
- **Automatic Backup**: Data is automatically saved on every change
- **Cross-session**: Data persists between app restarts and computer reboots

### API Endpoints

- `GET /api/tasks` - Get all tasks for current day
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task (mark complete/incomplete)
- `DELETE /api/tasks/:id` - Delete a task
- `GET /api/stats` - Get current day statistics
- `GET /api/history` - Get task history

## 🎨 UI/UX Features

- **Modern Design**: Clean, modern interface with gradient backgrounds
- **Smooth Animations**: Hover effects, transitions, and loading animations
- **Responsive Layout**: Works on all device sizes
- **Intuitive Interface**: Easy-to-use task management with clear visual feedback
- **Progress Tracking**: Real-time statistics and completion rates
- **Accessibility**: Keyboard navigation and screen reader friendly

## 🔧 Customization

### Changing Port Numbers

To change the default ports:

1. **Backend port** (default: 5000):

   - Edit `server/index.js` line 9: `const PORT = process.env.PORT || 5000;`

2. **Frontend port** (default: 3000):
   - Edit `client/package.json` proxy field: `"proxy": "http://localhost:YOUR_BACKEND_PORT"`

### Styling

The application uses CSS for styling. Main styles are in:

- `client/src/App.css` - Component-specific styles
- `client/src/index.css` - Global styles

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**:

   - Kill the process using the port or change the port number
   - For Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID>`

2. **Module not found errors**:

   - Make sure all dependencies are installed: `npm install` in both root and client directories

3. **Data not persisting**:
   - Check if the `server/data` directory exists and is writable
   - Ensure the application has write permissions

### Development Mode

For development, the app runs with:

- Frontend on port 3000 with hot reload
- Backend on port 5000 with nodemon for auto-restart

## 📝 Usage

1. **Adding Tasks**:

   - Type a task title in the input field
   - Optionally add a description
   - Select priority level (low, medium, high)
   - Click "Add Task"

2. **Managing Tasks**:

   - Click the checkbox to mark tasks as complete
   - Click the trash icon to delete tasks
   - Tasks are automatically organized by priority

3. **Viewing Progress**:
   - Check the statistics card for completion rates
   - Monitor your daily progress in real-time

## 🤝 Contributing

Feel free to contribute to this project by:

- Reporting bugs
- Suggesting new features
- Submitting pull requests

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with React and Node.js/Express
- Styled with modern CSS and gradients
- Icons and emojis for enhanced UX
- Date handling with date-fns library
