#! /bin/bash

me=$1

if wmctrl -l | awk '{print $2}' | sort -u | grep -q $me; then
   echo "matched"
fi
