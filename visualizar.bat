@echo off
REM Abre o site no seu computador em http://localhost:8000 (Ctrl+C para parar)
cd /d "%~dp0"
start "" http://localhost:8000
python -m http.server 8000
