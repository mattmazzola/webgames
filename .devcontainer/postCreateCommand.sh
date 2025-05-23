#! /bin/bash

set -ex

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
