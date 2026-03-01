from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import FileResponse
from typing import List, Dict, Any
import tempfile
import os
import zipfile
from pathlib import Path

from app.schemas.certificate import ExcelUploadMappingSchema
from app.core.excel_parser import ExcelSchemaValidator
from app.core.pdf_engine import get_pdf_engine
from app.api.pdf import generate_template_html

router = APIRouter(prefix="/excel", tags=["excel"])


@router.post("/parse", response_model=dict)
async def parse_excel(file: UploadFile = File(...)):
    """Parse Excel file and extract columns"""
    if not file.filename.endswith((".xlsx", ".xls", ".csv")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be Excel (.xlsx, .xls) or CSV",
        )

    try:
        # Save temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        # Parse
        df = ExcelSchemaValidator.parse_excel(tmp_path)
        if df is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to parse Excel file",
            )

        os.unlink(tmp_path)

        return {
            "columns": list(df.columns),
            "row_count": len(df),
            "preview": df.head(5).to_dict("records"),
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/map", response_model=List[ExcelUploadMappingSchema])
async def map_columns(
    template_variables: List[str], excel_columns: List[str]
):
    """Auto-map Excel columns to template variables"""
    try:
        mappings = ExcelSchemaValidator.auto_map_columns(
            template_variables, excel_columns
        )

        result = []
        for variable, column in mappings.items():
            score = ExcelSchemaValidator.calculate_similarity(variable, column)
            result.append(
                ExcelUploadMappingSchema(
                    target_variable=variable,
                    source_column=column,
                    match_score=score,
                )
            )

        return sorted(result, key=lambda x: x.match_score, reverse=True)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/generate-bulk")
async def generate_bulk_from_excel(request_data: Dict[str, Any]) -> FileResponse:
    """
    Generate bulk certificates from Excel data

    Request body:
    {
        "template": { ... CertificateTemplate ... },
        "data": [
            { "{{Name}}": "John Doe", "{{Date}}": "2024-01-15" },
            { "{{Name}}": "Jane Smith", "{{Date}}": "2024-01-15" },
            ...
        ],
        "fileName": "certificates"
    }

    Returns:
        ZIP file containing all generated PDFs
    """
    try:
        template = request_data.get("template")
        data_array = request_data.get("data", [])
        file_name_prefix = request_data.get("fileName", "certificates")

        if not template:
            raise HTTPException(status_code=400, detail="Template is required")

        if not data_array:
            raise HTTPException(status_code=400, detail="Data array is required")

        if not isinstance(data_array, list):
            raise HTTPException(status_code=400, detail="Data must be a list")

        pdf_engine = await get_pdf_engine()

        # Create temporary zip file
        with tempfile.NamedTemporaryFile(suffix=".zip", delete=False) as zip_tmp:
            zip_path = zip_tmp.name

        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for idx, data in enumerate(data_array, 1):
                # Generate HTML
                html_content = generate_template_html(template, data)

                # Create temporary PDF file
                with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as pdf_tmp:
                    pdf_output_path = pdf_tmp.name

                # Render to PDF
                success = await pdf_engine.render_html_to_pdf(html_content, pdf_output_path)

                if success:
                    # Get name from data if available
                    name = data.get("{{Name}}", f"Certificate_{idx}")
                    # Clean name for filename
                    safe_name = "".join(c for c in name if c.isalnum() or c in (' ', '-', '_')).rstrip()
                    pdf_filename = f"{file_name_prefix}_{idx:03d}_{safe_name}.pdf"

                    # Add to ZIP
                    zf.write(pdf_output_path, arcname=pdf_filename)

                # Clean up PDF temp file
                Path(pdf_output_path).unlink(missing_ok=True)

        # Return ZIP file
        return FileResponse(
            zip_path,
            media_type="application/zip",
            filename=f"{file_name_prefix}_batch.zip",
            headers={"Content-Disposition": f"attachment; filename={file_name_prefix}_batch.zip"},
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bulk generation failed: {str(e)}")
