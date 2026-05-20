@echo off
REM Clean installation script for EduTrack Backend

echo ========================================
echo EduTrack Backend - Clean Installation
echo ========================================
echo.

echo Step 1: Removing node_modules and lock files...
if exist node_modules (
    rmdir /s /q node_modules
    echo ✅ Removed node_modules
)

if exist package-lock.json (
    del package-lock.json
    echo ✅ Removed package-lock.json
)

echo.
echo Step 2: Installing npm dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm install failed
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo Step 3: Generating Prisma client...
echo (This must run AFTER npm install completes)
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Prisma generation failed
    exit /b 1
)
echo ✅ Prisma client generated

echo.
echo ========================================
echo ✅ Setup complete! You can now run:
echo    npm run dev
echo ========================================
pause

