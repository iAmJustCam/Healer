# TypeScript Comment Formatter

This utility helps maintain consistent comment formatting across TypeScript files in the codebase, ensuring constitutional compliance with comment style standards.

## Overview

The TypeScript Comment Formatter (`ts-comment-fixer.py`) is a Python script that fixes various comment formatting issues in TypeScript files, including:

1. Single-slash section headers (`/ ===` → `// ===`)
2. Section headers without slashes on title line (`// === \n TITLE \n // ===` → `// === \n // TITLE \n // ===`)
3. Single-slash comments in objects (`/ Comment` → `// Comment`)
4. Naked section headers (`SECTION` → `// SECTION`)
5. Mixed slash styles in section headers (`/ === \n // TITLE \n / ===` → `// === \n // TITLE \n // ===`)

## Usage

```bash
# Run in dry-run mode to preview changes without modifying files
./ts-comment-fixer.py --dry-run

# Fix comment formatting in the current directory
./ts-comment-fixer.py

# Fix comment formatting in a specific directory
./ts-comment-fixer.py --path /path/to/directory

# Show detailed information about fixes
./ts-comment-fixer.py --verbose

# Exclude specific directories
./ts-comment-fixer.py --exclude node_modules,dist,build

# Fix a specific file
./ts-comment-fixer.py --fix-file path/to/file.ts

# Use force mode for stubborn issues
./ts-comment-fixer.py --fix-file path/to/file.ts --force
```

## Options

- `--dry-run`: Preview changes without modifying files
- `--verbose`: Show detailed information about fixes
- `--path`: Directory to process (default: current directory)
- `--exclude`: Comma-separated list of directories to exclude (default: node_modules,.git,dist,build)
- `--fix-file`: Fix a specific file instead of a directory
- `--force`: Force direct replacement of single slashes with double slashes (for stubborn cases)

## Examples

### Basic Usage

```bash
cd /path/to/project
./ts-comment-fixer.py
```

### Preview Changes

```bash
./ts-comment-fixer.py --dry-run --verbose
```

### Fix Comments in a Specific Module

```bash
./ts-comment-fixer.py --path ./src/modules/auth
```

### Fix a Specific File with Stubborn Issues

```bash
./ts-comment-fixer.py --fix-file ./problematic-file.ts --force
```

## Comment Style Guidelines

To maintain constitutional compliance, TypeScript comments should follow these guidelines:

1. Section headers should use double slashes with equals signs:
   ```typescript
   // ============================================================================
   // SECTION NAME
   // ============================================================================
   ```

2. All comments should use double slashes (`//`), not single slashes (`/`).

3. Object property comments should use double slashes:
   ```typescript
   const config = {
     // Comment about property
     property: value,
   };
   ```

4. In-line comments should use double slashes with proper spacing:
   ```typescript
   const value = 42; // This is a comment
   ```

## Common Errors Fixed

The script fixes several comment-related TypeScript errors, including:

- `TS1109: Expression expected` - Caused by single forward slashes being interpreted as division operators
- `TS1128: Declaration or statement expected` - Often caused by malformed comment sections
- `TS1131: Property or signature expected` - Can occur with improper comment formatting in object literals

## Maintenance

If you identify new comment formatting patterns that need fixing, update the `ts-comment-fixer.py` script to add new regex patterns. The script is designed to be extensible with new patterns as needed.