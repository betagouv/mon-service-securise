#!/usr/bin/env bash
set -euo pipefail

PKG="@lab-anssi/ui-kit"
PUG_FILE="src/vues/mss.pug"

# Se placer à la racine du dépôt (le script peut être lancé de n'importe où)
cd "$(git rev-parse --show-toplevel 2>/dev/null || dirname "$0")"

[[ -f "$PUG_FILE" ]] || { echo "❌ Fichier introuvable : $PUG_FILE" >&2; exit 1; }

LATEST="$(npm view "$PKG@latest" version)"
[[ -n "$LATEST" ]] || { echo "❌ Impossible de récupérer la version de $PKG" >&2; exit 1; }

CURRENT="$(sed -n "s/.*UI_KIT_VERSION = '\([^']*\)'.*/\1/p" "$PUG_FILE" || true)"

echo "📦 $PKG : actuelle = ${CURRENT:-?} | dernière = $LATEST"

if [[ "$CURRENT" == "$LATEST" ]]; then
  echo "✓ Déjà à jour. Réinstallation pour garantir node_modules en phase…"
else
  perl -i -pe "s/UI_KIT_VERSION = '[^']*'/UI_KIT_VERSION = '${LATEST}'/" "$PUG_FILE"
  echo "✏️  $PUG_FILE mis à jour → $LATEST"
fi

pnpm add "$PKG@$LATEST"

echo "✅ Terminé : $PKG @ $LATEST"