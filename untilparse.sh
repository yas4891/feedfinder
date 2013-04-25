#!/bin/sh

until node parse.js; do
    echo "Twitter-Parse  crashed with exit code$?. Respawning.." >&2
    sleep 1
done
