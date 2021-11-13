#!/usr/bin/env bash

SITE="whitebrick"
if [[ $(basename $(pwd)) != "$SITE" ]]; then
  echo -e "\nError: Run this script from the top level '$SITE' directory.\n"
  exit 1
fi

# for osx: brew install gnu-sed; brew info gnu-sed

FROM_FILES_CLOUD="../whitebrick-cloud/*.md"
FROM_FILES_WEB="../whitebrick-web/docs/docs/*.md"
TO_FILE="README.md"
FROM_IMAGES="../whitebrick-cloud/doc/whitebrick-*.png"
TO_IMAGES="doc/"

PARTIALS_CLOUD=(
  "HEADER"
  "LICENSING"
  "SUMMARY"
  "TECHNICAL_OVERVIEW"
  "LINKS"
)

PARTIALS_WEB=(
  "FRONTEND_SETUP"
)

read_txt() {
  cat $2 > temp.md
  gsed -i 's/`/__BT__/g' temp.md
  gsed -i "s/'/__SQ__/g" temp.md
  gsed -i 's/"/__DQ__/g' temp.md
  gsed -i 's/ /__WS__/g' temp.md
  gsed -i 's/&/__AM__/g' temp.md
  local cmd="gsed -n '/START:$1/,/END:$1/{/START:$1/!{/END:$1/!p}}' temp.md"
  eval "$cmd"
}

find_replace() {
  local cmd="gsed -n -i '/START:'$1'/{p;:a;N;/END:'$1'/!ba;s^.*\n^'\"${2//$'\n'/\\n}\"'\n^};p' $3"
  echo "* find_replace"
  echo "===================================================================================================="
  echo $cmd
  echo "===================================================================================================="
  eval $cmd
}

update_txt() {
  echo -e "\nProcessing $1 from $2 to $3"
  local txt="$(read_txt "$1" "$2")"
  local preview=$(echo $txt | gsed -z 's/\n/ /g')
  echo "* read_txt ~ ${preview:0:50}..."
  find_replace "$1" "$txt\n" "$3"
}

for i in "${PARTIALS_CLOUD[@]}"
do
  update_txt "$i" "$FROM_FILES_CLOUD" "$TO_FILE"
done

for i in "${PARTIALS_WEB[@]}"
do
  update_txt "$i" "$FROM_FILES_WEB" "$TO_FILE"
done

# copy images
cp $FROM_IMAGES $TO_IMAGES

gsed -i 's/__BT__/`/g' $TO_FILE
gsed -i "s/__SQ__/'/g" $TO_FILE
gsed -i 's/__DQ__/"/g' $TO_FILE
gsed -i 's/__WS__/ /g' $TO_FILE
gsed -i 's/__AM__/\&/g' $TO_FILE

rm temp.md
