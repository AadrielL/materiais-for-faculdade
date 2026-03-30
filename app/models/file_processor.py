import os
import pytesseract
from pdf2image import convert_from_path
import unicodedata
import re
from PIL import Image

TESS_PATH = r'C:\python\bin\Tesseract-OCR\tesseract.exe'
pytesseract.pytesseract.tesseract_cmd = TESS_PATH

class PDFProcessor:
    @staticmethod
    def pdf_to_html_edit(pdf_path):
        POPPLER_BIN = r'C:\python\bin\poppler\Library\bin'
        try:
            pages = convert_from_path(pdf_path, 300, poppler_path=POPPLER_BIN)
            final_html_pages = ""

            for i, page_img in enumerate(pages):
                # Extração bruta com PSM 6 para manter a ordem das linhas
                raw_text = pytesseract.image_to_string(page_img, lang='por+eng', config='--psm 6')
                clean_text = unicodedata.normalize("NFC", raw_text)
                
                lines = clean_text.split('\n')
                page_content = ""
                buffer = ""

                for line in lines:
                    line = line.strip()
                    
                    if not line:
                        # Linha vazia detectada: se o buffer terminar em ponto, quebra. 
                        # Se terminar em vírgula ou nada, mantém o buffer aberto.
                        if buffer:
                            if buffer.endswith(('.', ':', '?', '!')):
                                page_content += f'<p class="editable-pdf-text">{buffer}</p>'
                                buffer = ""
                        continue

                    # REGEX: Identifica se é o início de uma nova questão (Ex: (4), (a), 5.)
                    is_new_question = re.match(r'^\(?\d+[\.\)]', line) or re.match(r'^\([a-z]\)', line)

                    if is_new_question:
                        # Se havia um texto sendo montado, fecha ele antes de começar a questão
                        if buffer:
                            page_content += f'<p class="editable-pdf-text">{buffer}</p>'
                        
                        # Inicia a questão (geralmente em negrito no PDF da UFT)
                        page_content += f'<p class="editable-pdf-text" style="font-weight:bold; margin-top:15px;">{line}</p>'
                        buffer = ""
                    else:
                        # LÓGICA DE PONTUAÇÃO:
                        # Se o buffer atual termina em vírgula, ponto e vírgula ou letra,
                        # ele "suga" a linha de baixo para o mesmo bloco.
                        if buffer:
                            # Se a linha anterior termina com caracteres de continuidade, junta sem medo
                            buffer += " " + line
                        else:
                            buffer = line

                # Fecha o último bloco de texto da página
                if buffer:
                    page_content += f'<p class="editable-pdf-text">{buffer}</p>'

                # Reconstrução da Folha A4 com Justificativa (Estilo Acadêmico)
                final_html_pages += (
                    f'<div class="pdf-page-canvas" id="page-{i}" style="'
                    f'width: 595px; min-height: 842px; padding: 70px 80px; '
                    f'background: white; margin: 20px auto; border: 1px solid #ccc; '
                    f'font-family: \"Times New Roman\", serif; color: #111; '
                    f'line-height: 1.6; text-align: justify; overflow-wrap: break-word;">'
                    f'<style>'
                    f'  .editable-pdf-text {{ font-size: 14px !important; margin: 0 0 10px 0; color: #000; border: none; outline: none; }}'
                    f'</style>'
                    f'<div contenteditable="true" style="outline:none; height: 100%;">{page_content}</div>'
                    f'</div>'
                )
                
            return final_html_pages
        except Exception as e:
            return f"<div style='background:red; color:white;'>Erro: {str(e)}</div>"

class ImageProcessor:
    @staticmethod
    def compress_image(input_path, output_path, quality=70):
        with Image.open(input_path) as img:
            if img.mode in ("RGBA", "P"): img = img.convert("RGB")
            img.save(output_path, "JPEG", optimize=True, quality=quality)
            return os.path.getsize(output_path)