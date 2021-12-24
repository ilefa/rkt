#!/bin/bash

if [[ -z "${TOKEN}" ]]; then
    echo "Missing token environment variable - bind it to a valid GitHub PAT with [packages:read] permissions."
    exit -1
fi

docker build -t ilefa/rkt:1.0 --build-arg TOKEN=$TOKEN .
docker run ilefa/rkt:1.0