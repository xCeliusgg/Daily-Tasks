@echo off
echo ========================================
echo Daily Task Tracker - Setup Script
echo ========================================
echo.

echo Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies!
    pause
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies!
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo Installation completed successfully!
echo ========================================
echo.
echo To start the application:
echo 1. Run: npm run dev
echo 2. Open: http://localhost:3000
echo.
echo Or start them separately:
echo - Backend only: npm run server
echo - Frontend only: npm run client
echo.
pause 