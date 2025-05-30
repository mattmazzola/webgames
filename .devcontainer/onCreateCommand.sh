#! /bin/bash

set -ex

echo "CONFIGURING GIT"
git config --global safe.directory '*'
git config --global core.editor "code --wait"
git config --global pager.branch false

cd webgames

echo "INSTALLING PROJECT DEPENDENCIES"
pnpm install

echo "postCreateCommand.sh finished!"
