#!/bin/bash

set -e

echo "Installing scriptory..."

OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case $ARCH in
  x86_64)
    ARCH="amd64"
    ;;
  aarch64|arm64)
    ARCH="arm64"
    ;;
  i386|i686)
    ARCH="386"
    ;;
  *)
    echo "Unsupported architecture: $ARCH"
    exit 1
    ;;
esac

case $OS in
  darwin*)
    OS="macos"
    echo "Detected macOS"
    ;;
  linux*)
    OS="linux"
    echo "Detected Linux"
    ;;
  msys*|mingw*|cygwin*)
    OS="windows"
    echo "Detected Windows (Git Bash/MSYS)"
    ;;
  *)
    echo "Unsupported operating system: $OS"
    exit 1
    ;;
esac

if command -v npm &> /dev/null; then
  echo "Installing via npm..."
  npm install -g @anandpilania/scriptory
  echo ""
  echo "✓ scriptory installed successfully!"
  echo ""
  echo "Run 'scriptory' to get started"
else
  echo "Error: npm not found."
  echo ""
  echo "Please install Node.js and npm first:"
  echo ""
  case $OS in
    macos)
      echo "  • Using Homebrew: brew install node"
      echo "  • Or download from: https://nodejs.org/"
      ;;
    linux)
      echo "  • Ubuntu/Debian: sudo apt-get install nodejs npm"
      echo "  • Fedora: sudo dnf install nodejs npm"
      echo "  • Or download from: https://nodejs.org/"
      ;;
    windows)
      echo "  • Download from: https://nodejs.org/"
      echo "  • Or using Chocolatey: choco install nodejs"
      ;;
  esac
  echo ""
  exit 1
fi
