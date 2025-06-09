#!/usr/bin/env python3
"""
Robust TypeScript Comment Format Fixer

This script fixes various comment formatting issues in TypeScript files:
1. Single-slash section headers (/ ===) -> (// ===)
2. Section headers without slashes on title line (// === \n TITLE \n // ===) -> (// === \n // TITLE \n // ===)
3. Single-slash comments in objects (/ Comment) -> (// Comment)
4. Naked section headers (SECTION) -> (// SECTION)
5. Missing comments in section blocks
6. Mixed slash styles in section headers (/ === \n // SECTION \n / ===)

Usage: 
  python3 ts-comment-fixer.py [--dry-run] [--verbose] [--path DIRECTORY] [--exclude DIR1,DIR2]
  
Options:
  --dry-run   Preview changes without writing to files
  --verbose   Show detailed information about fixes
  --path      Directory to process (default: current directory)
  --exclude   Comma-separated list of directories to exclude
"""

import os
import re
import sys
import time
import argparse
from concurrent.futures import ProcessPoolExecutor, as_completed
from typing import Dict, List, Tuple, Set, Optional


class CommentFixer:
    def __init__(self, dry_run: bool = False, verbose: bool = False):
        self.dry_run = dry_run
        self.verbose = verbose
        self.fixed_files: Dict[str, Dict[str, int]] = {}
        self.error_files: Dict[str, str] = {}
        self.skipped_files: Set[str] = set()
    
    def fix_file(self, file_path: str) -> Tuple[str, bool, Dict[str, int]]:
        """Fix comment formatting issues in a TypeScript file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            fix_counts = {
                "section_headers": 0,
                "section_titles": 0,
                "object_comments": 0,
                "naked_headers": 0,
                "section_dividers": 0,
                "multiline_sections": 0,
                "mixed_slash_headers": 0,
                "standalone_slashes": 0,
                "total": 0
            }
            
            # We'll do multiple passes to catch different cases
            
            # Pattern 1: Fix any standalone '/' at beginning of line
            pattern1 = re.compile(r'^\/(?!\/)(.*)$', re.MULTILINE)
            match_count = len(pattern1.findall(content))
            content = pattern1.sub(r'//\1', content)
            fix_counts["standalone_slashes"] += match_count
            
            # Repeat to catch any that might be left
            pattern1a = re.compile(r'^\/(?!\/)(.*)$', re.MULTILINE)
            match_count = len(pattern1a.findall(content))
            content = pattern1a.sub(r'//\1', content)
            fix_counts["standalone_slashes"] += match_count
            
            # Pattern 2: Section headers missing slashes on title line
            pattern2 = re.compile(r'(\/\/\s*=+)\s*\n([A-Z][A-Z0-9 _-]+)\s*\n(\/\/\s*=+)', re.MULTILINE)
            match_count = len(pattern2.findall(content))
            content = pattern2.sub(r'\1\n// \2\n\3', content)
            fix_counts["multiline_sections"] += match_count
            
            # Pattern 3: Single-slash comments in objects
            pattern3 = re.compile(r'(\s+)\/(\s+[A-Za-z])', re.MULTILINE)
            match_count = len(pattern3.findall(content))
            content = pattern3.sub(r'\1//\2', content)
            fix_counts["object_comments"] += match_count
            
            # Pattern 4: Naked uppercase section headers
            pattern4 = re.compile(r'^([A-Z][A-Z0-9 _-]{5,})$', re.MULTILINE)
            match_count = len(pattern4.findall(content))
            content = pattern4.sub(r'// \1', content)
            fix_counts["naked_headers"] += match_count
            
            # Pattern 5: Fix section dividers with equals but no slashes
            pattern5 = re.compile(r'^(=+)$', re.MULTILINE)
            match_count = len(pattern5.findall(content))
            content = pattern5.sub(r'// \1', content)
            fix_counts["section_dividers"] += match_count
            
            # Pattern 6: Mixed slash styles in multiline section headers
            # More aggressive to catch all variations
            for i in range(3):  # Multiple passes to catch nested patterns
                # Fix any remaining single slashes before equals signs
                pattern6 = re.compile(r'^\/(\s*=+)', re.MULTILINE)
                match_count = len(pattern6.findall(content))
                content = pattern6.sub(r'//\1', content)
                fix_counts["section_headers"] += match_count
            
            # Calculate total fixes
            fix_counts["total"] = sum(v for k, v in fix_counts.items() if k != "total")
            
            # Check if any changes were made
            if content != original_content and not self.dry_run:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                return file_path, True, fix_counts
            elif content != original_content:
                return file_path, False, fix_counts  # Dry run mode
            else:
                return file_path, False, {k: 0 for k in fix_counts}  # No changes needed
        except Exception as e:
            if self.verbose:
                print(f"Error processing {file_path}: {e}")
            self.error_files[file_path] = str(e)
            return file_path, False, {k: 0 for k in fix_counts.keys()}

    def process_directory(self, directory: str, exclude_dirs: Optional[List[str]] = None) -> None:
        """Process all TypeScript files in a directory."""
        exclude_dirs = exclude_dirs or []
        exclude_dirs = [os.path.normpath(os.path.join(directory, d)) for d in exclude_dirs]
        
        # Find all TypeScript files
        ts_files = []
        for root, dirs, files in os.walk(directory):
            # Skip excluded directories
            dirs[:] = [d for d in dirs if os.path.join(root, d) not in exclude_dirs]
            
            for file in files:
                if file.endswith('.ts') or file.endswith('.tsx'):
                    ts_files.append(os.path.join(root, file))
        
        if self.verbose:
            print(f"Found {len(ts_files)} TypeScript files.")
        
        # Process files in parallel
        with ProcessPoolExecutor(max_workers=os.cpu_count()) as executor:
            futures = [executor.submit(self.fix_file, file_path) for file_path in ts_files]
            
            total_files = len(futures)
            processed_files = 0
            
            for future in as_completed(futures):
                file_path, was_fixed, fix_counts = future.result()
                processed_files += 1
                
                if self.verbose:
                    print(f"[{processed_files}/{total_files}] Processing: {os.path.basename(file_path)}")
                
                if was_fixed:
                    self.fixed_files[file_path] = fix_counts
                    if self.verbose:
                        print(f"  Fixed: {os.path.basename(file_path)} ({fix_counts['total']} fixes)")
                elif fix_counts['total'] > 0:
                    self.skipped_files.add(file_path)
                    if self.verbose:
                        print(f"  Skipped (dry run): {os.path.basename(file_path)} ({fix_counts['total']} potential fixes)")
    
    def print_summary(self) -> None:
        """Print a summary of the fixes applied."""
        print("\n" + "=" * 80)
        print("TYPESCRIPT COMMENT FIXER SUMMARY")
        print("=" * 80)
        
        # Files statistics
        print(f"\nFiles:")
        print(f"  - Total processed: {len(self.fixed_files) + len(self.skipped_files) + len(self.error_files)}")
        if self.dry_run:
            print(f"  - Files that would be fixed: {len(self.fixed_files) + len(self.skipped_files)}")
        else:
            print(f"  - Files fixed: {len(self.fixed_files)}")
        print(f"  - Files with errors: {len(self.error_files)}")
        
        # Fix type statistics
        total_fixes = {
            "section_headers": 0,
            "section_titles": 0,
            "object_comments": 0,
            "naked_headers": 0,
            "section_dividers": 0,
            "multiline_sections": 0,
            "mixed_slash_headers": 0,
            "standalone_slashes": 0,
            "total": 0
        }
        
        for file_fixes in self.fixed_files.values():
            for fix_type, count in file_fixes.items():
                total_fixes[fix_type] += count
        
        if self.dry_run:
            # Include skipped files in dry run mode
            for file_path in self.skipped_files:
                # Reprocess to get counts
                _, _, fix_counts = self.fix_file(file_path)
                for fix_type, count in fix_counts.items():
                    total_fixes[fix_type] += count
        
        print(f"\nFix Types:")
        print(f"  - Section headers (/ === → // ===): {total_fixes['section_headers']}")
        print(f"  - Section titles (/ TITLE → // TITLE): {total_fixes['section_titles']}")
        print(f"  - Object comments (/ Comment → // Comment): {total_fixes['object_comments']}")
        print(f"  - Naked headers (TITLE → // TITLE): {total_fixes['naked_headers']}")
        print(f"  - Section dividers (=== → // ===): {total_fixes['section_dividers']}")
        print(f"  - Multiline sections (missing //): {total_fixes['multiline_sections']}")
        print(f"  - Mixed slash headers: {total_fixes['mixed_slash_headers']}")
        print(f"  - Standalone slashes: {total_fixes['standalone_slashes']}")
        print(f"  - Total fixes: {total_fixes['total']}")
        
        # List of top fixed files
        if self.fixed_files:
            print("\nTop Fixed Files:")
            top_files = sorted(self.fixed_files.items(), key=lambda x: x[1]['total'], reverse=True)[:10]
            for file_path, fix_counts in top_files:
                rel_path = os.path.relpath(file_path, os.getcwd())
                print(f"  - {rel_path} ({fix_counts['total']} fixes)")
        
        # Error files
        if self.error_files and self.verbose:
            print("\nFiles With Errors:")
            for file_path, error in self.error_files.items():
                rel_path = os.path.relpath(file_path, os.getcwd())
                print(f"  - {rel_path}: {error}")
        
        print("\n" + "=" * 80)
        if self.dry_run:
            print("DRY RUN: No files were modified. Run without --dry-run to apply changes.")
        else:
            print(f"Successfully fixed {len(self.fixed_files)} files with {total_fixes['total']} comment issues.")
        print("=" * 80)


def main():
    """Main function."""
    parser = argparse.ArgumentParser(description="TypeScript Comment Format Fixer")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without modifying files")
    parser.add_argument("--verbose", action="store_true", help="Show detailed progress")
    parser.add_argument("--path", default=os.getcwd(), help="Directory to process")
    parser.add_argument("--exclude", default="node_modules,.git,dist,build", 
                       help="Comma-separated list of directories to exclude")
    parser.add_argument("--fix-file", help="Fix a specific file instead of a directory")
    parser.add_argument("--force", action="store_true", help="Force direct replacement of single slashes with double slashes")
    
    args = parser.parse_args()
    
    # Convert exclude to list
    exclude_dirs = args.exclude.split(",") if args.exclude else []
    
    print(f"TypeScript Comment Fixer")
    
    if args.fix_file:
        print(f"Processing single file: {args.fix_file}")
        
        start_time = time.time()
        fixer = CommentFixer(dry_run=args.dry_run, verbose=args.verbose)
        file_path, was_fixed, fix_counts = fixer.fix_file(args.fix_file)
        
        print(f"\nResults for {os.path.basename(file_path)}:")
        if args.dry_run and fix_counts['total'] > 0:
            print(f"Would fix {fix_counts['total']} issues")
        elif was_fixed:
            print(f"Fixed {fix_counts['total']} issues")
        else:
            print("No issues found")
            
        # If we're still having issues and force is specified, do a direct replacement
        if args.force and not was_fixed:
            print("\nForce mode activated - applying direct slash replacements")
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Direct replacement of standalone forward slashes at beginning of lines
                direct_fixes = 0
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    if line.startswith('/') and not line.startswith('//'):
                        lines[i] = '/' + line  # Add an extra slash
                        direct_fixes += 1
                
                if direct_fixes > 0:
                    new_content = '\n'.join(lines)
                    if not args.dry_run:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Applied {direct_fixes} direct fixes")
                    else:
                        print(f"Would apply {direct_fixes} direct fixes")
            except Exception as e:
                print(f"Error during force mode: {e}")
            
        elapsed_time = time.time() - start_time
        print(f"\nTotal execution time: {elapsed_time:.2f} seconds")
    else:
        print(f"Processing directory: {args.path}")
        print(f"Mode: {'Dry run (preview only)' if args.dry_run else 'Live (files will be modified)'}")
        print(f"Excluded directories: {', '.join(exclude_dirs)}")
        
        start_time = time.time()
        
        fixer = CommentFixer(dry_run=args.dry_run, verbose=args.verbose)
        fixer.process_directory(args.path, exclude_dirs)
        fixer.print_summary()
        
        elapsed_time = time.time() - start_time
        print(f"\nTotal execution time: {elapsed_time:.2f} seconds")


if __name__ == "__main__":
    main()