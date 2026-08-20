@echo off
cd /d "%~dp0"
echo ==============================================
echo  BUILD INSTALLER SIM SARPRAS SMP (WINDOWS)
echo ==============================================
echo.
echo Pastikan Anda sudah menginstal Node.js
echo.

echo 1. Menginstal dependensi utama...
call npm install

echo.
echo 2. Menginstal library untuk membuat aplikasi desktop (Electron)...
call npm install electron electron-builder --save-dev

echo.
echo 3. Membangun aplikasi web...
call npm run build

echo.
echo 4. Membuat file executable (Installer)...
call npx electron-builder --win -c.extraMetadata.main=dist/electron.cjs

echo.
echo Selesai! Buka folder "release" untuk melihat file Installernya (.exe).
pause
