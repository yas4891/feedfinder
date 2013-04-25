#!/bin/sh

until node extract-feeds.js; do
    echo "Extract Feeds from Technorati crashed with exit code$?. Respawning.." >&2
    sleep 1
done
