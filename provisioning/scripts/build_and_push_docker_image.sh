#!/bin/bash

IMAGE_NAME=$1
IMAGE_TAG=$2
ENVIRONMENT=$3

#get token for registry in the AWS

LOGIN=`aws ecr get-login | sed 's/-e none //g' | cut -d ' ' -f 4`
TOKEN=`aws ecr get-login | sed 's/-e none //g' | cut -d ' ' -f 6`
API_URL=`aws ecr get-login | sed 's/-e none //g' | cut -d ' ' -f 7`

#push image to amazon registry

REGISTERY=`aws ecr get-login | sed 's/-e none //g' | cut -d ' ' -f 7| sed 's/https:\/\///g'`
docker login -u $LOGIN -p $TOKEN $REGISTERY

TARGET_IMAGE="$REGISTERY/$ENVIRONMENT/$IMAGE_NAME:$IMAGE_TAG"
LATEST_IMAGE="$REGISTERY/$ENVIRONMENT/$IMAGE_NAME:latest"
SOURCE_IMAGE="$IMAGE_NAME/$ENVIRONMENT:$IMAGE_TAG"

if [ $(aws ecr describe-repositories | jq -c '.repositories[] | select (.repositoryName == "$ENVIRONMENT/$IMAGE_NAME")') -z ]; then
    echo -e "Create AWS ECR: $ENVIRONMENT/$IMAGE_NAME"
    aws ecr create-repository --repository-name $ENVIRONMENT/$IMAGE_NAME
fi

echo -e "Build docker image with tags: $TARGET_IMAGE $LATEST_IMAGE"
docker buildx build --progress plain --platform linux/amd64,linux/arm64 -t $TARGET_IMAGE -t $LATEST_IMAGE provisioning/docker/$IMAGE_NAME/ --push .
