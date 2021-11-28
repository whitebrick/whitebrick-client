#!/usr/bin/env bash

SITE="whitebrick"
if [[ $(basename $(pwd)) != "$SITE" ]]; then
  echo -e "\nError: Run this script from the top level '$SITE' directory.\n"
  exit 1
fi

husky install .github/husky