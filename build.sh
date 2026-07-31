#!/bin/bash
docker run --rm -v $(pwd):/work -w /work node:24 bash -c "npm i && npm run build"