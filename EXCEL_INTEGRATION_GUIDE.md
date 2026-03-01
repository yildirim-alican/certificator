# Excel Integration & Bulk Generation Guide

This guide explains the complete Excel integration workflow for bulk certificate generation in CertifyPro.

## Feature Overview

The Excel integration allows you to:
- Upload Excel files (.xlsx, .xls, .csv) with certificate data
- Automatically map Excel columns to certificate template variables
- Preview generated certificates before bulk generation
- Generate and download all certificates as a ZIP file

## Workflow Steps

### Step 1: Upload Excel File

Access bulk generation from the editor:
1. Open a certificate template in the editor
2. Click the **"Bulk Generate"** button in the header
3. You'll be taken to the bulk generation page

Upload your Excel file:
- Drag and drop or click to browse
- Supported formats: .xlsx, .xls, .csv
- Maximum file size: 5 MB
- First row should contain column headers

**Example Excel Structure:**

```
| Full Name    | Date          | Company     | Completion Date |
|--------------|---------------|-------------|-----------------|
| John Doe     | 2024-01-15    | ACME Corp   | January 15, 2024|
| Jane Smith   | 2024-01-16    | Tech Inc    | January 16, 2024|
| Bob Johnson  | 2024-01-17    | Global Co   | January 17, 2024|
```

### Step 2: Map Columns to Variables

After uploading, you'll map Excel columns to template variables:

**Mapping Interface:**
- Left side: Excel column names
- Right side: Template variable dropdowns
- Confidence indicators show match quality:
  - 🟢 **High match** (≥0.8): Auto-mapped with confidence
  - 🟡 **Manual match** (0.5): Manually selected
  - 🔴 **Low match** (<0.5): Needs review

**Auto-Mapping Rules:**
- Algorithm: Similarity scoring (Levenshtein distance)
- Threshold: Auto-maps if similarity > 0.5
- Manual mapping required for unmapped columns

**Example Mapping:**

```
Excel Column           →  Template Variable
"Full Name"                {{Name}}
"Date"                     {{Date}}
"Company"                  {{Company}}
"Completion Date"          {{CompletionDate}}
```

### Step 3: Preview Data

Review the data that will be used:

**Preview Shows:**
- Table with first 5 records by default
- "Show All" button to view all records
- Statistics: Total records, columns mapped, certificates
- Validation: Checks for empty rows

**Statistics Displayed:**
- 📊 **Total Records**: Number of data rows to process
- ✅ **Columns Mapped**: Number of mapped columns
- 📄 **Certificates**: Total certificates to be generated

### Step 4: Generate and Download

Final step generates all certificates:

**Generation Process:**
1. Frontend prepares mapped data
2. Sends to backend PDF generation API
3. Backend renders each certificate
4. PDFs are zipped and returned as single file
5. File automatically downloads to your device

**Output File:**
- Format: ZIP archive
- Naming: `{template-name}_batch.zip`
- Contents: Individual PDF files named `{template-name}_{number}_{name}.pdf`
- Size: ~50-100KB per certificate (varies by complexity)

## Frontend Components

### ExcelUploader
Location: `frontend/src/components/excel/ExcelUploader.tsx`

Features:
- Drag-and-drop interface
- File type validation
- File size validation (5MB max)
- Visual feedback states
- Error handling with user-friendly messages

Props:
```typescript
interface ExcelUploaderProps {
  onFileSelect: (file: File) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
}
```

### ColumnMapper
Location: `frontend/src/components/excel/ColumnMapper.tsx`

Features:
- Auto-mapping with confidence scoring
- Manual column selection
- Validation of all mapped columns
- Confidence indicators
- Visual feedback for completion status

Props:
```typescript
interface ColumnMapperProps {
  excelColumns: string[];
  templateVariables: string[];
  onMappingComplete: (mappings: ColumnMapping[]) => void;
  isLoading?: boolean;
  autoMappings?: ColumnMapping[];
}
```

### DataPreview
Location: `frontend/src/components/excel/DataPreview.tsx`

Features:
- Expandable data table
- First N records preview
- "Show All" functionality
- Statistics dashboard
- Confirmation before generation

Props:
```typescript
interface DataPreviewProps {
  data: Record<string, string>[];
  columns: string[];
  totalRecords: number;
  previewLimit?: number;
  onConfirm: () => void;
  isLoading?: boolean;
}
```

### BulkGenerationWorkflow
Location: `frontend/src/components/excel/BulkGenerationWorkflow.tsx`

Features:
- Multi-step workflow management
- Progress indicator
- Status tracking
- Error handling
- Completion feedback

Props:
```typescript
interface BulkGenerationProps {
  template: CertificateTemplate;
  onGenerationStart: (data: Record<string, string>[]) => Promise<void>;
  onGenerationComplete?: () => void;
}
```

## Backend APIs

### POST /api/v1/excel/parse
Parse Excel file and extract columns

**Request:**
```
POST /api/v1/excel/parse
Content-Type: multipart/form-data

file: [Excel file]
```

**Response:**
```json
{
  "columns": ["Full Name", "Date", "Company"],
  "row_count": 150,
  "preview": [
    {"Full Name": "John Doe", "Date": "2024-01-15", ...},
    ...
  ]
}
```

### POST /api/v1/excel/map
Auto-map Excel columns to template variables

**Request:**
```json
{
  "template_variables": ["{{Name}}", "{{Date}}", "{{Company}}"],
  "excel_columns": ["Full Name", "Date", "Company"]
}
```

**Response:**
```json
[
  {
    "target_variable": "{{Name}}",
    "source_column": "Full Name",
    "match_score": 0.92
  },
  ...
]
```

### POST /api/v1/excel/generate-bulk
Generate bulk certificates from Excel data

**Request:**
```json
{
  "template": {
    "name": "Achievement Certificate",
    "orientation": "landscape",
    "width": 210,
    "height": 297,
    "backgroundColor": "#ffffff",
    "elements": [...]
  },
  "data": [
    {"{{Name}}": "John Doe", "{{Date}}": "2024-01-15"},
    {"{{Name}}": "Jane Smith", "{{Date}}": "2024-01-16"},
    ...
  ],
  "fileName": "certificates"
}
```

**Response:**
```
HTTP/1.1 200 OK
Content-Type: application/zip
Content-Disposition: attachment; filename=certificates_batch.zip

[Binary ZIP content]
```

## Data Processing

### Column Mapping Algorithm

The auto-mapping uses similarity scoring:

```python
def calculate_similarity(excel_col: str, template_var: str) -> float:
    # Clean both strings
    col_clean = excel_col.lower().replace(/[^a-z0-9]/, '')
    var_clean = template_var.lower().replace(/[{}]/, '')
    
    # Perfect match
    if col_clean == var_clean:
        return 1.0
    
    # Substring match
    if col_clean in var_clean or var_clean in col_clean:
        return 0.8
    
    # Levenshtein distance
    distance = lev_distance(col_clean, var_clean)
    max_len = max(len(col_clean), len(var_clean))
    return 1 - (distance / max_len)
```

**Scoring Ranges:**
- **≥ 0.8**: High confidence auto-mapping
- **0.5 - 0.8**: Manual mapping suggested
- **< 0.5**: No auto-mapping suggested

### Variable Substitution

Variables in certificate templates:
- Format: `{{VariableName}}` (double curly braces)
- Exact match required with Excel-mapped data
- Case-sensitive
- All matches replaced in text elements

**Example:**
```
Excel Data:     {"{{Name}}": "John Doe", "{{Date}}": "2024-01-15"}
Template Text:  "This certifies that {{Name}} on {{Date}}"
Result:         "This certifies that John Doe on 2024-01-15"
```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid file type" | Wrong file format | Upload .xlsx, .xls, or .csv |
| "File size exceeds 5MB" | File too large | Compress or split data into smaller files |
| "Failed to parse Excel" | Corrupted file or unsupported format | Re-save Excel file and try again |
| "Column unmapped" | Missing mapping selection | Select a variable for each column |
| "No data to generate" | Empty data array | Ensure Excel file has data rows |
| "Bulk generation failed" | Backend error | Check browser console and server logs |

### Validation Rules

Frontend validates:
- File type and size
- Column mappings (all must be assigned)
- Data not empty
- JSON structure valid

Backend validates:
- Template exists and is valid
- Data array not empty
- Template has elements
- All variables in template

## Performance

### Benchmarks

| Operation | Typical Time | Notes |
|-----------|-------------|-------|
| File parsing | ~500ms | For 500 rows |
| Column mapping | ~100ms | Auto-suggest |
| Data preview | Instant | In-memory |
| Single PDF generation | ~500ms | Per certificate |
| 10 PDF generation | ~5s | Sequential |
| ZIP compression | ~300ms | For 10 PDFs |
| Total (10 certs) | ~5-6s | End-to-end |

### Optimization Tips

- **Smaller files**: Split large datasets (1000+ rows) into multiple batches
- **Naming**: Keep certificate names short to reduce filename length
- **Templates**: Simpler templates render faster
- **Images**: Optimize image sizes in templates

## Troubleshooting

### Excel Parsing Issues

**Problem**: "Failed to parse Excel file"
- Ensure first row contains column headers
- Remove blank columns
- Use standard Excel format (not custom formatting)
- Try saving as xlsx

**Problem**: "File appears empty"
- Confirm data rows exist below headers
- Check for hidden rows (unhide if needed)
- Verify column content is not blank

### Mapping Issues

**Problem**: No auto-mappings appear
- Column names must be similar to variable names
- Try renaming columns to match variable names
- Use "Show All Variables" to see all options
- Manual mapping is always available

**Problem**: Wrong variable auto-mapped
- Use manual mapping to override
- Click the variable dropdown for selected column
- Confidence indicator shows match quality

### Generation Issues

**Problem**: "Bulk generation failed"
- Check template has at least one element
- Verify all variables used in template exist in data
- Check file size (large images cause issues)
- Try smaller batch first (10-20 certificates)

**Problem**: Downloaded ZIP file is empty or corrupted
- Check browser console for errors
- Verify network connection
- Clear browser cache and retry
- Try different browser

## Advanced Usage

### Handling Special Characters

Excel data with special characters:
```
Name: John O'Reilly    → Renders as: John O'Reilly
Date: 2024-01-15       → Renders as: 2024-01-15
Company: "ABC Inc."    → Renders as: ABC Inc.
```

### Large Batch Processing

For 1000+ certificates:
1. Split into smaller batches (500 per batch)
2. Generate each batch separately
3. Collect all ZIP files
4. Combine if needed

### Custom Variable Names

To use custom variables:
1. Add variable to template: `{{CustomVar}}`
2. Map Excel column to custom variable
3. Ensure Excel column contains the data
4. Generate normally

## Best Practices

### Before Uploading

- ✅ Use clear, descriptive column headers
- ✅ Verify data accuracy (especially dates, names)
- ✅ Remove duplicate rows if needed
- ✅ Use consistent formatting (all caps, title case, etc.)
- ✅ Test with small batch first

### Column Naming

- ✅ Match column names to variable names when possible
  - "Name" maps to "{{Name}}"
  - "Certificate Date" maps to "{{CertificateDate}}"
- ✅ Use clear, unambiguous names
- ❌ Avoid special characters that may not match

### Template Preparation

- ✅ Define all variables used in template
- ✅ Use meaningful variable names
- ✅ Test template with sample data
- ✅ Optimize images for web (file size)

### Generation Workflow

1. **Validate**: Check template and data
2. **Preview**: Test with first few rows
3. **Generate**: Start with small batch
4. **Monitor**: Watch for completion
5. **Verify**: Check downloaded ZIP contents
6. **Archive**: Save certificates securely

## API Examples

### Example 1: Generate 3 Certificates

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/excel/generate-bulk \
  -H "Content-Type: application/json" \
  -d '{
    "template": {
      "name": "Completion Certificate",
      "orientation": "landscape",
      "backgroundColor": "#f5f5f5",
      "elements": [{
        "type": "text",
        "content": "Presented to {{Name}}",
        "x": 50, "y": 40,
        "fontSize": 36,
        "color": "#000000"
      }]
    },
    "data": [
      {"{{Name}}": "Alice Johnson"},
      {"{{Name}}": "Bob Smith"},
      {"{{Name}}": "Carol Davis"}
    ],
    "fileName": "completion_certs"
  }'
```

**Response:**
```
HTTP/1.1 200 OK
Content-Type: application/zip
Content-Disposition: attachment; filename=completion_certs_batch.zip

[ZIP file with 3 PDFs]
```

## Limits & Quotas

| Feature | Limit | Notes |
|---------|-------|-------|
| File size | 5 MB | Practical limit for browser |
| Rows per file | 1000 | Recommended split point |
| Batch size | 500 | Performance optimal |
| Column count | 20 | Template design limit |
| Cell content | 1000 chars | Per cell maximum |

## Future Enhancements

- [ ] Template preview during mapping
- [ ] Batch verification (validation before generation)
- [ ] Progress bar for bulk generation
- [ ] Resume interrupted generations
- [ ] Database integration for Excel history
- [ ] Google Sheets integration
- [ ] Scheduled batch generation
- [ ] Email delivery of certificates

## Support & Resources

- **Documentation**: See PDF_GENERATION_GUIDE.md
- **API Reference**: See backend/app/api/excel.py
- **Components**: frontend/src/components/excel/
- **Hooks**: frontend/src/hooks/useExcelParser.ts
- **Examples**: See test data in Examples/ folder

---

Last Updated: March 2026
Status: Production Ready ✅
