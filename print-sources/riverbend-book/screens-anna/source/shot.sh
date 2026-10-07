#!/bin/bash
# usage: shot.sh name  -> name.png at 1206x2622
cd "$(dirname "$0")"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=3 --window-size=402,874 --virtual-time-budget=4000 --screenshot="$PWD/$1.png" "file://$PWD/$2.html" >/dev/null 2>&1
