#!/usr/bin/env bash
# Double-click me in Finder to rebuild the website's hero film
# from hero-timeline.txt. (First time: right-click → Open.)
cd "$(dirname "$0")"
bash scripts/hero/make-hero.sh
status=$?
echo ""
if [ $status -ne 0 ]; then
  echo "Something went wrong — read the message above, fix hero-timeline.txt, and try again."
fi
read -r -p "Press Enter to close this window… "
