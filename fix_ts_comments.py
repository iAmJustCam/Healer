#!/usr/bin/env python3
"""
Comprehensive TypeScript Comment Format Fixer

This script fixes various comment formatting issues in TypeScript files:
1. Single-slash section headers (/ ===) -> (// ===)
2. Section headers without slashes on title line (// === \n TITLE \n // ===) -> (// === \n // TITLE \n // ===)
3. Single-slash comments in objects (/ Comment) -> (// Comment)
4. Naked section headers (SECTION) -> (// SECTION)

Usage: python3 fix_ts_comments.py [directory]
"""

import os
import re
import sys
from concurrent.futures import ProcessPoolExecutor, as_completed


def fix_file(file_path):
    """Fix comment formatting issues in a TypeScript file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Pattern 1: Single-slash section headers (/ ===) -> (// ===)
        pattern1 = re.compile(r'^\/(\s*=+)', re.MULTILINE)
        content = pattern1.sub(r'//\1', content)
        
        # Pattern 2: Single-slash section names (/ SECTION) -> (// SECTION)
        pattern2 = re.compile(r'^\/(\s+[A-Z][A-Z0-9 _-]+)', re.MULTILINE)
        content = pattern2.sub(r'//\1', content)
        
        # Pattern 3: Section headers missing slashes on title line
        pattern3 = re.compile(r'(\/\/\s*=+)\s*\n([A-Z][A-Z0-9 _-]+)\s*\n(\/\/\s*=+)', re.MULTILINE)
        content = pattern3.sub(r'\1\n// \2\n\3', content)
        
        # Pattern 4: Single-slash comments in objects
        pattern4 = re.compile(r'(\s+)\/(\s+[A-Za-z])', re.MULTILINE)
        content = pattern4.sub(r'\1//\2', content)
        
        # Pattern 5: Naked uppercase section headers
        pattern5 = re.compile(r'^([A-Z][A-Z0-9 _-]{5,})$', re.MULTILINE)
        content = pattern5.sub(r'// \1', content)
        
        # Pattern 6: Fix section dividers with equals but no slashes
        pattern6 = re.compile(r'^(=+)$', re.MULTILINE)
        content = pattern6.sub(r'// \1', content)
        
        # Check if any changes were made
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return file_path, True
        return file_path, False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return file_path, False


def find_ts_files(directory):
    """Find all TypeScript files in a directory tree."""
    ts_files = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx'):
                ts_files.append(os.path.join(root, file))
    return ts_files


def main():
    """Main function."""
    if len(sys.argv) > 1:
        directory = sys.argv[1]
    else:
        directory = os.getcwd()
    
    print(f"Finding TypeScript files in {directory}...")
    ts_files = find_ts_files(directory)
    print(f"Found {len(ts_files)} TypeScript files.")
    
    print("Fixing comment formatting issues...")
    fixed_files = 0
    
    # Process files in parallel for speed
    with ProcessPoolExecutor(max_workers=os.cpu_count()) as executor:
        futures = [executor.submit(fix_file, file_path) for file_path in ts_files]
        for future in as_completed(futures):
            file_path, was_fixed = future.result()
            if was_fixed:
                fixed_files += 1
                print(f"Fixed: {os.path.basename(file_path)}")
    
    print(f"\nFixed comment formatting in {fixed_files} files.")
    print("Run TypeScript compiler to verify all errors are resolved.")


if __name__ == "__main__":
    main()