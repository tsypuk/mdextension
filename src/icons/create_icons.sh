#!/bin/bash

# This script creates simple placeholder icons for the Chrome extension
# It requires ImageMagick to be installed

# Create a simple colored square for each icon size
convert -size 16x16 xc:#4285f4 icon16.png
convert -size 48x48 xc:#4285f4 icon48.png
convert -size 128x128 xc:#4285f4 icon128.png

echo "Icons created successfully!"
