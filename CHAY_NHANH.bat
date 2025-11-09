@echo off
echo ========================================
echo    CHAY DU AN STAR SOCIAL
echo ========================================
echo.

echo [1/3] Dang khoi dong Backend...
start "Backend Server" cmd /k "cd Back-end && npm start"
timeout /t 3 /nobreak >nul

echo [2/3] Dang khoi dong Website...
start "Website" cmd /k "npm run dev"
timeout /t 2 /nobreak >nul

echo [3/3] Dang khoi dong Mobile App...
start "Mobile App" cmd /k "cd AppMobile\AppMobile && npm start"

echo.
echo ========================================
echo    DA KHOI DONG TAT CA!
echo ========================================
echo.
echo Backend:    http://localhost:5000
echo Website:    http://localhost:5173
echo Mobile App: Expo Dev Tools se mo tu dong
echo.
echo Nhan phim bat ky de dong cua so nay...
pause >nul

