#\!/bin/bash

# Target file
FILE="./type-migration-matrix.ts"

if [[ ! -f "$FILE" ]]; then
    echo "File not found: $FILE"
    exit 1
fi

echo "Fixing enum values in $FILE"

# Backup the file
cp "$FILE" "${FILE}.bak"

# Replace enum string values
sed -i "" "s/'ERROR'/Severity.ERROR/g" "$FILE"
sed -i "" "s/'WARNING'/Severity.WARNING/g" "$FILE" 
sed -i "" "s/'INFO'/Severity.INFO/g" "$FILE"
sed -i "" "s/'REACT'/Framework.REACT19/g" "$FILE"
sed -i "" "s/'NEXT'/Framework.NEXTJS15/g" "$FILE"
sed -i "" "s/'TYPESCRIPT'/Framework.TYPESCRIPT5/g" "$FILE"
sed -i "" "s/'TAILWIND'/Framework.TAILWIND4/g" "$FILE"
sed -i "" "s/'IN_PLACE'/TransformationStrategy.IN_PLACE/g" "$FILE"
sed -i "" "s/'COPY_MODIFY'/TransformationStrategy.COPY_MODIFY/g" "$FILE"
sed -i "" "s/'CREATE_NEW'/TransformationStrategy.CREATE_NEW/g" "$FILE"
sed -i "" "s/'HYBRID'/TransformationStrategy.HYBRID/g" "$FILE"
sed -i "" "s/'INCREMENTAL'/TransformationStrategy.INCREMENTAL/g" "$FILE"
sed -i "" "s/'PENDING'/TransformationStatus.PENDING/g" "$FILE"
sed -i "" "s/'IN_PROGRESS'/TransformationStatus.RUNNING/g" "$FILE"
sed -i "" "s/'COMPLETED'/TransformationStatus.COMPLETED/g" "$FILE"
sed -i "" "s/'FAILED'/TransformationStatus.FAILED/g" "$FILE"
sed -i "" "s/'SKIPPED'/TransformationStatus.SKIPPED/g" "$FILE"
sed -i "" "s/'CANCELLED'/TransformationStatus.CANCELLED/g" "$FILE"

echo "Enum values updated successfully"
echo "Backup saved as ${FILE}.bak"
