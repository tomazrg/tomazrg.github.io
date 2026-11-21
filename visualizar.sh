#!/usr/bin/env bash
# Abre o site no seu computador em http://localhost:8000 (Ctrl+C para parar)
cd "$(dirname "$0")"
echo "Abra no navegador: http://localhost:8000"
python3 -m http.server 8000
