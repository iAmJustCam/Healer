#!/usr/bin/env python3
"""
domain-constitutional-cleanup.py
Systematic constitutional cleanup for all domains
"""

import os
import glob
import re
from pathlib import Path

def extract_types_from_file(filepath):
    """Extract all type definitions from a file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find export interface/type statements
        interface_pattern = r'export interface\s+(\w+)[^{]*\{[^}]*\}'
        type_pattern = r'export type\s+(\w+)[^=]*=[^;]*;'

        interfaces = re.findall(interface_pattern, content, re.DOTALL | re.MULTILINE)
        types = re.findall(type_pattern, content, re.DOTALL | re.MULTILINE)

        # Extract full definitions
        interface_defs = re.findall(r'export interface[^{]*\{[^}]*\}', content, re.DOTALL | re.MULTILINE)
        type_defs = re.findall(r'export type[^=]*=[^;]*;', content, re.DOTALL | re.MULTILINE)

        return {
            'interfaces': list(zip(interfaces, interface_defs)),
            'types': list(zip(types, type_defs)),
            'file': filepath
        }
    except Exception as e:
        return {'error': str(e), 'file': filepath}

def analyze_domain_violations():
    """Analyze constitutional violations by domain"""

    domains = {
        'ai-verification': 'ai-verification/*.ts',
        'configuration': 'configuration/*.ts',
        'migration-engine': 'migration-engine/*.ts',
        'transformation-engine': 'transformation-engine/*.ts',
        'analysis-reporting': 'analysis-reporting/**/*.ts',
        'pattern-detection': 'pattern-detection/*.ts',
        'shared-foundation': 'shared-foundation/**/*.ts'
    }

    domain_violations = {}

    for domain_name, pattern in domains.items():
        files = glob.glob(pattern, recursive=True)
        violations = []

        for filepath in files:
            # Skip if it's already a types file or pipeline file
            if '/types/' in filepath or '/pipelines/' in filepath:
                continue

            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                if 'export interface' in content or 'export type' in content:
                    extracted = extract_types_from_file(filepath)
                    if 'error' not in extracted:
                        violations.append(extracted)
            except Exception as e:
                print(f"Error processing {filepath}: {e}")

        if violations:
            domain_violations[domain_name] = violations

    return domain_violations

def create_domain_types_file(domain_name, violations):
    """Create canonical types file for a domain"""

    os.makedirs('types', exist_ok=True)

    # Generate types filename
    types_filename = f'types/{domain_name.replace("-", "-")}.types.ts'

    # Header
    content = f'''/**
 * {domain_name.replace("-", " ").title()} Domain Types
 *
 * Constitutional compliance: Canonical SSOT for {domain_name} domain
 * Extracted from domain files and centralized here
 */

import type {{ ApiResponse, ValidationError }} from "./foundation.types";

'''

    # Add all extracted types
    all_interfaces = []
    all_types = []

    for violation in violations:
        if 'interfaces' in violation:
            all_interfaces.extend(violation['interfaces'])
        if 'types' in violation:
            all_types.extend(violation['types'])

    # Write interfaces
    if all_interfaces:
        content += "/// ============================================================================//\n"
        content += "// INTERFACES\n"
        content += "/// ============================================================================//\n\n"

        for name, definition in all_interfaces:
            # Clean up the definition
            cleaned_def = definition.replace('export ', '').strip()
            content += f"{cleaned_def}\n\n"

    # Write types
    if all_types:
        content += "/// ============================================================================//\n"
        content += "// TYPE ALIASES\n"
        content += "/// ============================================================================//\n\n"

        for name, definition in all_types:
            # Clean up the definition
            cleaned_def = definition.replace('export ', '').strip()
            content += f"{cleaned_def}\n\n"

    # Export section
    interface_names = [name for name, _ in all_interfaces]
    type_names = [name for name, _ in all_types]

    if interface_names or type_names:
        content += "/// ============================================================================//\n"
        content += "// EXPORTS\n"
        content += "/// ============================================================================//\n\n"
        content += "export type {\n"

        for name in interface_names:
            content += f"  {name},\n"
        for name in type_names:
            content += f"  {name},\n"

        content += "};\n"

    # Write file
    with open(types_filename, 'w', encoding='utf-8') as f:
        f.write(content)

    return types_filename

def remove_types_from_domain_file(filepath):
    """Remove type definitions from domain file and add imports"""

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Remove export interface blocks
        content = re.sub(r'export interface[^{]*\{[^}]*\}\s*', '', content, flags=re.DOTALL | re.MULTILINE)

        # Remove export type lines
        content = re.sub(r'export type[^=]*=[^;]*;\s*', '', content, flags=re.DOTALL | re.MULTILINE)

        # Add import if not present and content has substance
        if content.strip() and 'import type' not in content:
            domain_name = filepath.split('/')[0].replace('-', '-')
            import_statement = f'''import type {{ }} from "@/types/{domain_name}.types";\n\n'''
            content = import_statement + content

        # Clean up excessive whitespace
        content = re.sub(r'\n\s*\n\s*\n+', '\n\n', content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content.strip() + '\n')

        return True

    except Exception as e:
        print(f"Error cleaning {filepath}: {e}")
        return False

def main():
    print("🚨 DOMAIN CONSTITUTIONAL CLEANUP")
    print("📊 Systematic violation resolution across all domains")
    print("")

    # Step 1: Analyze violations
    print("🔍 ANALYZING CONSTITUTIONAL VIOLATIONS BY DOMAIN...")
    violations = analyze_domain_violations()

    if not violations:
        print("✅ No violations found! All domains are constitutionally compliant.")
        return

    # Report violations
    total_files = sum(len(v) for v in violations.values())
    print(f"❌ Found violations in {len(violations)} domains ({total_files} files)")

    for domain, domain_violations in violations.items():
        print(f"  📁 {domain}: {len(domain_violations)} files")
        for violation in domain_violations[:3]:  # Show first 3
            filename = os.path.basename(violation['file'])
            interface_count = len(violation.get('interfaces', []))
            type_count = len(violation.get('types', []))
            print(f"    → {filename}: {interface_count} interfaces, {type_count} types")

    print("")

    # Step 2: Create canonical types files
    print("🏗️ CREATING CANONICAL TYPES FILES...")
    created_files = []

    for domain_name, domain_violations in violations.items():
        print(f"  📝 Processing {domain_name}...")
        types_file = create_domain_types_file(domain_name, domain_violations)
        created_files.append(types_file)
        print(f"    ✅ Created: {types_file}")

    print("")

    # Step 3: Clean domain files
    print("🧹 CLEANING DOMAIN FILES...")
    cleaned_files = 0

    for domain_violations in violations.values():
        for violation in domain_violations:
            filepath = violation['file']
            if remove_types_from_domain_file(filepath):
                cleaned_files += 1
                print(f"    ✅ Cleaned: {os.path.basename(filepath)}")
            else:
                print(f"    ❌ Failed: {os.path.basename(filepath)}")

    print("")

    # Step 4: Validation
    print("🛡️ CONSTITUTIONAL VALIDATION...")
    remaining_violations = analyze_domain_violations()

    if not remaining_violations:
        print("🎉 CONSTITUTIONAL SUCCESS!")
        print(f"✅ Created {len(created_files)} canonical types files")
        print(f"✅ Cleaned {cleaned_files} domain files")
        print(f"✅ Eliminated violations in {len(violations)} domains")
        print("")
        print("📋 CREATED CANONICAL FILES:")
        for filepath in created_files:
            size = os.path.getsize(filepath)
            print(f"  📄 {filepath} ({size} bytes)")

    else:
        remaining_count = sum(len(v) for v in remaining_violations.values())
        print(f"⚠️  {remaining_count} violations remain - manual review required")

    print("")
    print("🎯 NEXT STEPS:")
    print("1. Review generated canonical types files")
    print("2. Update imports in domain files")
    print("3. Run constitutional validator")
    print("4. Fix any remaining TypeScript errors")

if __name__ == "__main__":
    main()
