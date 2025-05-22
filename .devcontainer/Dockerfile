FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

# Add Microsoft package repository
RUN curl -sSL -O https://packages.microsoft.com/config/debian/12/packages-microsoft-prod.deb

RUN sudo dpkg -i packages-microsoft-prod.deb
RUN rm packages-microsoft-prod.deb
RUN sudo apt-get update

# Install AzCopy
RUN sudo apt-get install azcopy