# !/usr/bin/env bash

SITE="whitebrick"
S3_DEV="s3://dev.whitebrick.com"
S3_STAGING="s3://staging.whitebrick.com"
S3_PROD="s3://whitebrick.com"
CLOUDFRONT_DEV="E2SMZQYG45APHN"
CLOUDFRONT_STAGING="E3TH44CM96PJ5D"
CLOUDFRONT_PROD="ETADCV7026FAI"
REDIRECT_DEV="https://hello-dev.whitebrick.com"
REDIRECT_STAGING="https://hello-staging.whitebrick.com"
REDIRECT_PROD="https://hello.whitebrick.com"

if [[ $(basename $(pwd)) != "$SITE" ]]; then
  echo -e "\nError: Run this script from the top level '$SITE' directory.\n"
  exit 1
fi

if [[ "$1" != "dev" && "$1" != "staging" && "$1" != "prod" ]]; then
  echo -e "\nError: Either 'dev' or 'staging' or 'prod' must be passed as the first argument.\n"
  exit 1
fi

env=$1
s3=""
cloudfront=""
redirect=""
cmd=""

if [[ "$env" == "prod" ]]; then
  s3=$S3_PROD
  cloudfront=$CLOUDFRONT_PROD
  redirect=$REDIRECT_PROD
  cmd="npm run build:prod"
elif [[ "$env" == "staging" ]]; then
  s3=$S3_STAGING
  cloudfront=$CLOUDFRONT_STAGING
  redirect=$REDIRECT_STAGING
  cmd="npm run build:staging"
else
  env="dev"
  s3=$S3_DEV
  cloudfront=$CLOUDFRONT_DEV
  redirect=$REDIRECT_DEV
  cmd="npm run build:development"
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
  cmd="touch public/.gatsby-build-$env"
  echo -e "\n$cmd\n"
  eval $cmd
fi

echo -e "\n\n==== Deploying $SITE $1 ($s3) ====\n\n"

cd public

if [ ! -f "./.gatsby-build-$env" ]; then
    echo -e "Error: public/.gatsby-build-$env could not be found.\n\nAre you sure you are deploying the correct build?\n\n"
    exit 1
fi

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
