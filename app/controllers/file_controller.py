import os
from flask import Blueprint, send_file, request, current_app
from app.models.file_processor import ImageProcessor, PDFProcessor

# O Blueprint que o seu __init__.py procura
file_bp = Blueprint('file', __name__)

def get_upload_dir():
    """Busca a pasta uploads na raiz do projeto"""
    base_dir = os.path.dirname(current_app.root_path)
    upload_dir = os.path.join(base_dir, 'uploads')
    
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    return upload_dir

@file_bp.route('/compress', methods=['POST'])
def compress():
    # No seu HTML o name é "file" (singular)
    file = request.files.get('file')
    if not file: return "Nenhum arquivo enviado", 400

    path = get_upload_dir()
    input_p = os.path.join(path, file.filename)
    output_p = os.path.join(path, f"otimizado_{file.filename}")

    file.save(input_p)
    ImageProcessor.compress_image(input_p, output_p)

    return send_file(os.path.abspath(output_p), as_attachment=True)

@file_bp.route('/scan-pdf', methods=['POST'])
def scan_pdf():
    # No seu HTML o name é "files" (plural)
    files = request.files.getlist('files')
    if not files or files[0].filename == '': return "Erro", 400

    path = get_upload_dir()
    image_paths = []

    for f in files:
        p = os.path.join(path, f.filename)
        f.save(p)
        image_paths.append(p)

    out_p = os.path.join(path, "digitalizado_final.pdf")
    PDFProcessor.scan_to_pdf(image_paths, out_p)

    return send_file(os.path.abspath(out_p), as_attachment=True)

@file_bp.route('/convert-to-edit', methods=['POST'])
def convert_to_edit():
    """Rota para o Editor Inteligente"""
    file = request.files.get('file')
    if not file:
        return {"error": "Nenhum arquivo enviado"}, 400

    path = get_upload_dir()
    input_p = os.path.join(path, file.filename)
    file.save(input_p)

    try:
        html_content = PDFProcessor.pdf_to_html_edit(input_p)
        return {"html": html_content}
    except Exception as e:
        print(f"Erro na conversão do PDF: {e}")
        return {"error": str(e)}, 500