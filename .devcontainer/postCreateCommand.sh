#! /bin/bash

set -ex

echo "INSTALL PLAYWRIGHT DEPENDENCIES"
sudo env "PATH=$PATH" pnpm exec playwright install-deps

echo "INSTALL PLAYWRIGHT BROWSERS"
pnpm exec playwright install

echo "Print Versions of CLI tools"
lsb_release -a
az version
azcopy --version
node --version
npm --version
pnpm --version
pwsh --version
dotnet --version
gh --version

echo "postStartCommand.sh finished!"
