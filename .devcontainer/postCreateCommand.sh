#! /bin/bash

set -ex

echo "CONFIGURING GIT"
git config --global safe.directory '*'
git config --global core.editor "code --wait"
git config --global pager.branch false

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

cd webgames
pnpm install

echo "postCreateCommand.sh finished!"
