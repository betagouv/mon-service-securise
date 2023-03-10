#!/bin/bash

# Copie la police Noto Emoji
mkdir -p /app/.fonts
cp /app/.apt/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf /app/.fonts
chmod 644 /app/.fonts/NotoColorEmoji.ttf
fc-cache -f -v

# Lance le serveur node
node server.js
