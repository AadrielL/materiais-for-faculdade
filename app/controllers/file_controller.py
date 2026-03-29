import os
import uuid
from flask import Blueprint, send_file, request, current_app, after_this_request
from app.models.file_processor import ImageProcessor, PDFProcessor

file_bp = Blueprint('file', __name__)

def get_upload_dir():
    base_dir = os.path.dirname(current_app.root_path)
    upload_dir = os.path.join(base_dir, 'uploads')
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    return upload_dir

def cleanup_files(*paths):
    """Função para deletar arquivos após o envio"""
    for p in paths:
        try:
            if os.path.exists(p):
                os.remove(p)
        except Exception as e:
            print(f"Erro ao deletar temporário: {e}")

@file_bp.route('/compress', methods=['POST'])
def compress():
    file = request.files.get('file')
    if not file: return "Nenhum arquivo enviado", 400

    path = get_upload_dir()
    unique_id = str(uuid.uuid4())
    input_p = os.path.join(path, f"{unique_id}_{file.filename}")
    output_p = os.path.join(path, f"otimizado_{unique_id}_{file.filename}")

    file.save(input_p)
    ImageProcessor.compress_image(input_p, output_p)

    @after_this_request
    def remove_file(response):
        cleanup_files(input_p, output_p)
        return response

    return send_file(os.path.abspath(output_p), as_attachment=True)

@file_bp.route('/scan-pdf', methods=['POST'])
def scan_pdf():
    files = request.files.getlist('files')
    if not files or files[0].filename == '': return "Erro", 400

    path = get_upload_dir()
    image_paths = []
    unique_id = str(uuid.uuid4())

    for f in files:
        p = os.path.join(path, f"{unique_id}_{f.filename}")
        f.save(p)
        image_paths.append(p)

    out_p = os.path.join(path, f"digitalizado_{unique_id}.pdf")
    PDFProcessor.scan_to_pdf(image_paths, out_p)

    @after_this_request
    def remove_file(response):
        cleanup_files(*image_paths, out_p)
        return response

    return send_file(os.path.abspath(out_p), as_attachment=True)

@file_bp.route('/convert-to-edit', methods=['POST'])
def convert_to_edit():
    file = request.files.get('file')
    if not file: return {"error": "Nenhum arquivo enviado"}, 400

    path = get_upload_dir()
    unique_id = str(uuid.uuid4())
    input_p = os.path.join(path, f"{unique_id}_{file.filename}")
    file.save(input_p)

    try:
        html_content = PDFProcessor.pdf_to_html_edit(input_p)
        cleanup_files(input_p)
        return {"html": html_content}
    except Exception as e:
        cleanup_files(input_p)
        return {"error": str(e)}, 500