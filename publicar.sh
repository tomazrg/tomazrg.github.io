#!/usr/bin/env bash
# ============================================================
#  publicar.sh  —  atualiza o site com um comando (Mac / Linux)
#  Uso:  ./publicar.sh "o que eu mudei"
# ============================================================
set -e
cd "$(dirname "$0")"
MSG="${1:-Atualiza conteúdo do site}"

echo "Verificando arquivos de dados..."
ERRO=0
while IFS= read -r f; do
  if python3 -m json.tool "$f" > /dev/null 2>&1; then
    echo "  OK    $f"
  else
    echo "  ERRO  $f"; python3 -m json.tool "$f" > /dev/null || true; ERRO=1
  fi
done < <(find data -name '*.json')
[ "$ERRO" = 1 ] && { echo "Corrija os erros acima e rode de novo."; exit 1; }

git add .
if [ -z "$(git status --porcelain)" ]; then echo "Nada para publicar — tudo já está atualizado."; exit 0; fi
git commit -m "$MSG"
git push origin main
echo "Publicado! O site atualiza em cerca de 1 minuto."
