@echo off
echo Installing dependencies...
cd /d "%~dp0"
npm install
echo.
echo Dependencies installed successfully!
echo.
echo Now run: npm start -- --clear
pause

