#!/bin/bash

echo "========================================"
echo "Daily Task Tracker - Setup Script"
echo "========================================"
echo

echo "Installing backend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Error installing backend dependencies!"
    exit 1
fi

echo
echo "Installing frontend dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "Error installing frontend dependencies!"
    exit 1
fi
cd ..

echo
echo "========================================"
echo "Installation completed successfully!"
echo "========================================"
echo
echo "To start the application:"
echo "1. Run: npm run dev"
echo "2. Open: http://localhost:3000"
echo
echo "Or start them separately:"
echo "- Backend only: npm run server"
echo "- Frontend only: npm run client"
echo 