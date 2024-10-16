#!/bin/bash

# Define the output file
OUTPUT_FILE="project-tree.md"

# Write the header to the output file
echo "# Project Directory Structure" > $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# Generate the tree structure and append to the output file
tree -a -I 'node_modules|.git|*.log|*.md' >> $OUTPUT_FILE

# Print a success message
echo "Project tree has been written to $OUTPUT_FILE"
