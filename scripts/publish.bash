#!/usr/bin/env bash

SITE="whitebrick"
if [[ $(basename $(pwd)) != "$SITE" ]]; then
  echo -e "\nError: Run this script from the top level '$SITE' directory.\n"
  exit 1
fi

echo -e "\n* Checking user: npm whoami"
npm whoami
if [ $? -ne 0 ]; then
  echo -e "\nError: Are you logged in?\n"
  exit 1
fi

echo -e "\n* Checking for np: which np"
which np
if [ $? -ne 0 ]; then
  echo -e "\nError: publishing requires the np package\n"
  exit 1
fi

echo -e "\n* Publishing: np --no-2fa"
np --no-2fa
