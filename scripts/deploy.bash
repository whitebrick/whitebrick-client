# !/usr/bin/env bash

SITE="whitebrick"
S3_DEV="s3://dev.whitebrick.com"
S3_STAGING="s3://staging.whitebrick.com"
CLOUDFRONT_DEV="E2SMZQYG45APHN"
CLOUDFRONT_STAGING="E3TH44CM96PJ5D"
REDIRECT_DEV="https://hello-dev.whitebrick.com"
REDIRECT_STAGING="https://hello-staging.whitebrick.com"

if [[ $(basename $(pwd)) != "$SITE" ]]; then
  echo -e "\nError: Run this script from the top level '$SITE' directory.\n"
  exit 1
fi

if [[ "$1" != "dev" && "$1" != "staging" ]]; then
  echo -e "\nError: Either 'dev' or 'staging' must be passed as the first argument.\n"
  exit 1
fi

s3=""
cloudfront=""
redirect=""
cmd=""

if [[ "$1" == "dev" ]]; then
  s3=$S3_DEV
  cloudfront=$CLOUDFRONT_DEV
  redirect=$REDIRECT_DEV
  cmd="DEVELOPMENT=true gatsby build"
else
  s3=$S3_STAGING
  cloudfront=$CLOUDFRONT_STAGING
  redirect=$REDIRECT_STAGING
  cmd="STAGING=true gatsby build"
fi

if [[ "$2" != "skipBuild" ]]; then
  echo -e "\nChecking for gatsby..."
  which gatsby
  if [ $? -ne 0 ]; then
    echo -e "\nError: The command 'gatsby' could not be found.\n"
    exit 1
  fi
  echo -e "\n\n==== Building $SITE $1 ====\n\n"
  echo -e "\n$cmd\n"
  eval $cmd
  if [ $? -ne 0 ]; then
    echo -e "\nGatsby build failed.\n"
    exit 1
  fi
fi

echo -e "\n\n==== Deploying $SITE $1 ($s3) ====\n\n"

cd public
cmd="aws s3 sync . $s3 --delete --profile wb-client-deploy"
echo -e "\n$cmd\n"
eval $cmd
if [ ! -z "$redirect" ]; then
  cmd="aws s3 cp index.html $s3 --website-redirect '$redirect' --profile wb-client-deploy"
  echo -e "\n$cmd\n"
  eval $cmd
fi
cmd="aws cloudfront create-invalidation --distribution-id $cloudfront --paths '/*' --profile wb-client-deploy"
echo -e "\n$cmd\n"
eval $cmd
