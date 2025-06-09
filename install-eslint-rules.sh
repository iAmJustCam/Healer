#!/bin/bash
# install-eslint-rules.sh
# Installs custom ESLint rules for constitutional enforcement

set -e

echo "🛡️ Installing Constitutional ESLint Rules"

# Create ESLint plugin directory if it doesn't exist
mkdir -p node_modules/eslint-plugin-custom

# Create package.json for the custom plugin
cat > node_modules/eslint-plugin-custom/package.json << EOF
{
  "name": "eslint-plugin-custom",
  "version": "1.0.0",
  "description": "Custom ESLint rules for constitutional enforcement",
  "main": "index.js",
  "license": "UNLICENSED"
}
EOF

# Create the plugin index file
cat > node_modules/eslint-plugin-custom/index.js << EOF
module.exports = {
  rules: {
    'no-local-types': require('../../eslint-rules/no-local-types')
  }
};
EOF

echo "✅ ESLint rules installed successfully"
echo "📋 You can now run 'npx eslint .' to validate constitutional compliance"