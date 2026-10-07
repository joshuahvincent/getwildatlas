#!/bin/bash
# usage: shotlong.sh name height [transparent]
cd "$(dirname "$0")"
BG=""; [ "$3" = "t" ] && BG="--default-background-color=00000000"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars $BG --force-device-scale-factor=3 --window-size=402,$2 --virtual-time-budget=4000 --screenshot="$PWD/$1.png" "file://$PWD/$1.html" >/dev/null 2>&1
