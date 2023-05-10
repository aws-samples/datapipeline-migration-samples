#!/bin/bash

mkdir node_modules
touch package-lock.json
chown -R ec2-user:ec2-user node_modules/ package-lock.json
# Run commands as ec2-user 

sudo -u ec2-user -i << 'EOF'
cd /stepUserInput
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
. ~/.nvm/nvm.sh && nvm install 16
node --version
npm install 
ls -lrt
node /stepUserInput/job.js
EOF