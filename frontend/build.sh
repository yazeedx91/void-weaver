#!/bin/bash
set -e
npm install
npx vite build
node build-server.mjs
