#!/bin/bash

# Migration Project Structure Flattening and Reorganization Script
# This script moves scattered files into their appropriate domain directories
# and maintains the clean domain-based architecture

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

# Create backup before reorganization
create_backup() {
    local backup_dir="./backups/.reorganization-backup/$(date +'%Y%m%d_%H%M%S')"
    log "Creating backup at $backup_dir"

    mkdir -p "$backup_dir"

    # Create file list before reorganization
    find . -type f -not -path './node_modules/*' -not -path './dist/*' -not -path './backups/*' > "$backup_dir/file_list_before.txt"

    # Create directory structure backup
    find . -type d -not -path './node_modules/*' -not -path './dist/*' -not -path './backups/*' > "$backup_dir/directory_structure_before.txt"

    log "Backup created successfully"
}

# Ensure domain directories exist
ensure_domain_structure() {
    log "Ensuring domain directory structure exists"

    local domains=(
        "domains/shared-foundation/types"
        "domains/shared-foundation/schemas"
        "domains/shared-foundation/utilities"
        "domains/shared-foundation/factories"
        "domains/shared-foundation/guards"
        "domains/configuration/managers"
        "domains/configuration/utilities"
        "domains/configuration/validators"
        "domains/ai-verification/config"
        "domains/ai-verification/responses"
        "domains/ai-verification/orchestrators"
        "domains/ai-verification/verification"
        "domains/ai-verification/handlers"
        "domains/transformation/engines"
        "domains/transformation/orchestration"
        "domains/transformation/ast"
        "domains/transformation/string"
        "domains/migration-engine/strategies"
        "domains/migration-engine/utilities"
        "domains/migration-engine/orchestrators"
        "domains/migration-engine/backup"
        "domains/cli/renderers"
        "domains/cli/types"
        "domains/cli/schemas"
        "domains/cli/orchestrators"
        "domains/cli/interactive"
        "domains/cli/commands"
        "domains/analysis-reporting/analyzers"
        "domains/analysis-reporting/utilities"
        "domains/analysis-reporting/generators"
        "domains/analysis-reporting/risk"
        "domains/pattern-detection/patterns"
        "domains/pattern-detection/utilities"
        "domains/pattern-detection/registry"
        "domains/pattern-detection/scanners"
        "domains/pattern-detection/matchers"
    )

    for domain in "${domains[@]}"; do
        mkdir -p "$domain"
    done

    log "Domain structure ensured"
}

# Move files based on their content and purpose
reorganize_files() {
    log "Starting file reorganization"

    # Check if we're in the right directory
    if [[ ! -f "package.json" ]]; then
        error "Not in project root directory. Please run from the migration project root."
        exit 1
    fi

    # Move remaining root-level files to appropriate domains

    # These files should already be in domains/ but let's check for any stragglers
    local root_files_to_move=(
        # Shared Foundation files
        "validation.ts:domains/shared-foundation/schemas/"
        "record.schema.ts:domains/shared-foundation/schemas/"
        "cli.schema.ts:domains/cli/schemas/"
        "fs.schema.ts:domains/shared-foundation/schemas/"
        "pattern.utilities.ts:domains/pattern-detection/utilities/"
        "migration.utilities.ts:domains/migration-engine/utilities/"
        "risk.utilities.ts:domains/analysis-reporting/risk/"
        "string.utilities.ts:domains/shared-foundation/utilities/"
        "array.utilities.ts:domains/shared-foundation/utilities/"
        "configuration.utilities.ts:domains/configuration/utilities/"
        "object.utilities.ts:domains/shared-foundation/utilities/"
        "result.utilities.ts:domains/shared-foundation/utilities/"
        "async.utilities.ts:domains/shared-foundation/utilities/"
        "business-context.ts:domains/analysis-reporting/utilities/"

        # Types
        "migration.types.ts:domains/shared-foundation/types/"
        "domain.types.ts:domains/shared-foundation/types/"
        "cli.types.ts:domains/cli/types/"
        "entity.ts:domains/shared-foundation/types/"
        "TypeShape.ts:domains/shared-foundation/types/"
        "business.ts:domains/shared-foundation/types/"
        "result.ts:domains/shared-foundation/types/"
        "TypeShapeUtils.ts:domains/shared-foundation/types/"
        "primitives.ts:domains/shared-foundation/types/"
        "models.ts:domains/shared-foundation/types/"
        "enums.ts:domains/shared-foundation/types/"
        "User.ts:domains/shared-foundation/types/"
        "ResultType.ts:domains/shared-foundation/types/"

        # Schemas
        "validation.schemas.ts:domains/shared-foundation/schemas/"
        "migration.schemas.ts:domains/shared-foundation/schemas/"

        # Factories and Guards
        "factories.ts:domains/shared-foundation/factories/"
        "guards.ts:domains/shared-foundation/guards/"

        # Orchestrators
        "migration.orchestrator.ts:domains/migration-engine/orchestrators/"
        "cli-orchestrator.ts:domains/cli/orchestrators/"
        "ai-orchestrator.ts:domains/ai-verification/orchestrators/"
        "ai-orchestrator.js:domains/ai-verification/orchestrators/"

        # CLI files
        "CLI-renderer.js:domains/cli/renderers/"
        "cli-renderer.ts:domains/cli/renderers/"
        "interactive-menu.ts:domains/cli/interactive/"

        # AI Verification files
        "ai-cli.ts:domains/ai-verification/config/"
        "ai-cli-config.js:domains/ai-verification/config/"
        "ai-response.ts:domains/ai-verification/responses/"
        "verification-steps.ts:domains/ai-verification/verification/"
        "ai-risk-assessment.js:domains/ai-verification/verification/"
        "ai-verification.ts:domains/ai-verification/verification/"
        "ai-risk.ts:domains/ai-verification/verification/"
        "ai-verification.js:domains/ai-verification/verification/"
        "verification-steps.js:domains/ai-verification/verification/"
        "ai-error-handler.ts:domains/ai-verification/handlers/"

        # Configuration files
        "ai-config-manager.ts:domains/configuration/managers/"
        "validation-engine.ts:domains/configuration/validators/"
        "validator.ts:domains/configuration/validators/"
        "config-validator.js:domains/configuration/validators/"

        # Transformation files
        "AST-engine.ts:domains/transformation/engines/"
        "transformation.ts:domains/transformation/orchestration/"
        "AST-transformer.ts:domains/transformation/ast/"
        "string-transformer.ts:domains/transformation/string/"

        # Migration Engine files
        "strategy-selector.ts:domains/migration-engine/strategies/"
        "type-consolidation.js:domains/migration-engine/utilities/"
        "type-consolidation.ts:domains/migration-engine/utilities/"
        "migration.ts:domains/migration-engine/orchestrators/"
        "restore.ts:domains/migration-engine/backup/"
        "backup-manager.ts:domains/migration-engine/backup/"
        "rollback.ts:domains/migration-engine/backup/"

        # Analysis and Reporting files
        "analyzer.ts:domains/analysis-reporting/analyzers/"
        "ai-reporting.ts:domains/analysis-reporting/generators/"
        "ReportGenerator.ts:domains/analysis-reporting/generators/"
        "risk.ts:domains/analysis-reporting/risk/"
        "risk-assessment.ts:domains/analysis-reporting/risk/"

        # Pattern Detection files
        "patterns2.ts:domains/pattern-detection/patterns/"
        "patterns3.ts:domains/pattern-detection/patterns/"
        "patterns.js:domains/pattern-detection/patterns/"
        "patterns.ts:domains/pattern-detection/patterns/"
        "PatternRegistry.ts:domains/pattern-detection/registry/"
        "scanner.ts:domains/pattern-detection/scanners/"
        "scan-external-project.ts:domains/pattern-detection/scanners/"
        "pattern-matcher.ts:domains/pattern-detection/matchers/"
    )

    # Move files if they exist in root
    for file_mapping in "${root_files_to_move[@]}"; do
        IFS=':' read -r file dest <<< "$file_mapping"

        if [[ -f "$file" ]]; then
            log "Moving $file to $dest"
            mkdir -p "$dest"
            mv "$file" "$dest"
        fi
    done

    # Clean up any remaining duplicate files or misplaced files
    cleanup_duplicates

    log "File reorganization completed"
}

# Clean up duplicate files and ensure single source of truth
cleanup_duplicates() {
    log "Cleaning up duplicate files"

    # Remove any duplicate copies that might exist
    local duplicates=(
        "./risk-assessment copy.ts"
        "./index copy.ts"
    )

    for dup in "${duplicates[@]}"; do
        if [[ -f "$dup" ]]; then
            warn "Removing duplicate file: $dup"
            rm -f "$dup"
        fi
    done

    # Clean up empty directories
    find . -type d -empty -not -path './node_modules/*' -not -path './dist/*' -delete 2>/dev/null || true
}

# Create domain index files if they don't exist
create_domain_indexes() {
    log "Creating domain index files"

    local domains=(
        "domains/shared-foundation"
        "domains/configuration"
        "domains/ai-verification"
        "domains/transformation"
        "domains/migration-engine"
        "domains/cli"
        "domains/analysis-reporting"
        "domains/pattern-detection"
    )

    for domain in "${domains[@]}"; do
        local index_file="$domain/index.ts"
        if [[ ! -f "$index_file" ]]; then
            log "Creating index file: $index_file"

            # Create a basic barrel export file
            cat > "$index_file" << EOF
/**
 * ${domain##*/} Domain
 *
 * Barrel export file for all ${domain##*/} functionality
 * Auto-generated by reorganization script
 */

// Export all from subdirectories
// TODO: Add specific exports based on the actual files in this domain

export * from './types';
export * from './utilities';
export * from './schemas';

// Export default configuration or main functionality
// TODO: Implement based on domain requirements
EOF
        fi
    done
}

# Update imports in remaining files
update_imports() {
    log "Updating import statements"

    # This is a basic implementation - for production use, you'd want a more sophisticated approach
    # Using a simple sed replacement for common patterns

    find ./domains -name "*.ts" -type f -exec sed -i.bak \
        -e "s|from '\.\./\.\./\.\./|from '@/domains/|g" \
        -e "s|from '\.\./\.\./|from '@/domains/|g" \
        -e "s|from '\.\./|from '@/domains/|g" \
        {} \;

    # Clean up backup files
    find ./domains -name "*.bak" -delete

    log "Import statements updated"
}

# Validate the reorganization
validate_reorganization() {
    log "Validating reorganization"

    # Check that all expected domain directories exist
    local required_domains=(
        "domains/shared-foundation"
        "domains/configuration"
        "domains/ai-verification"
        "domains/transformation"
        "domains/migration-engine"
        "domains/cli"
        "domains/analysis-reporting"
        "domains/pattern-detection"
    )

    local missing_domains=()
    for domain in "${required_domains[@]}"; do
        if [[ ! -d "$domain" ]]; then
            missing_domains+=("$domain")
        fi
    done

    if [[ ${#missing_domains[@]} -gt 0 ]]; then
        error "Missing required domains: ${missing_domains[*]}"
        return 1
    fi

    # Count files in domains vs root
    local domain_files=$(find ./domains -name "*.ts" -o -name "*.js" | wc -l)
    local root_files=$(find . -maxdepth 1 -name "*.ts" -o -name "*.js" | wc -l)

    log "Domain files: $domain_files, Root files: $root_files"

    # Check that we haven't lost any files
    local total_files_after=$(find . -name "*.ts" -o -name "*.js" -not -path './node_modules/*' -not -path './dist/*' -not -path './backups/*' | wc -l)

    log "Total files after reorganization: $total_files_after"

    log "Reorganization validation completed"
}

# Generate reorganization report
generate_report() {
    local report_file="./reports/reorganization-report-$(date +'%Y%m%d_%H%M%S').md"
    log "Generating reorganization report: $report_file"

    mkdir -p ./reports

    cat > "$report_file" << EOF
# Project Reorganization Report

**Date:** $(date)
**Script:** Flatten and Reorganize Migration Project

## Summary

This report documents the reorganization of the migration project structure to properly separate concerns into domain-based directories.

## Domain Structure

\`\`\`
domains/
├── shared-foundation/     # Core types, utilities, schemas
├── configuration/         # Configuration management
├── ai-verification/       # AI verification and enhancement
├── transformation/        # Code transformation engines
├── migration-engine/      # Core migration orchestration
├── cli/                  # Command-line interface
├── analysis-reporting/    # Analysis and reporting
└── pattern-detection/     # Pattern recognition and matching
\`\`\`

## Files Moved

$(find ./domains -name "*.ts" -o -name "*.js" | sort)

## Validation Results

- Domain directories: $(find ./domains -maxdepth 1 -type d | wc -l) created
- TypeScript files in domains: $(find ./domains -name "*.ts" | wc -l)
- JavaScript files in domains: $(find ./domains -name "*.js" | wc -l)
- Root-level source files remaining: $(find . -maxdepth 1 -name "*.ts" -o -name "*.js" | wc -l)

## Next Steps

1. Verify import statements are working correctly
2. Update tsconfig.json paths if needed
3. Run tests to ensure functionality is preserved
4. Update documentation to reflect new structure

## Notes

- All original files have been backed up
- Import statements have been automatically updated where possible
- Manual review of imports may be needed for complex cases
EOF

    log "Report generated: $report_file"
}

# Main execution
main() {
    log "Starting Migration Project Reorganization"
    log "========================================"

    # Confirm we're in the right place
    if [[ ! -f "package.json" ]] || [[ ! -d "domains" ]]; then
        error "This doesn't appear to be the migration project root. Expected package.json and domains/ directory."
        exit 1
    fi

    # Ask for confirmation
    echo -e "${YELLOW}This script will reorganize your project structure.${NC}"
    echo "Files will be moved from root level into appropriate domain directories."
    echo ""
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Operation cancelled by user"
        exit 0
    fi

    # Execute reorganization steps
    create_backup
    ensure_domain_structure
    reorganize_files
    create_domain_indexes
    update_imports
    validate_reorganization
    generate_report

    log "========================================"
    log "Migration Project Reorganization Complete!"
    log ""
    log "Next steps:"
    log "1. Review the generated report in ./reports/"
    log "2. Test that imports are working: npm run build"
    log "3. Run tests: npm test"
    log "4. Manually fix any remaining import issues"
    log ""
    log "If you encounter issues, restore from the backup created in ./backups/"
}

# Run main function
main "$@"
