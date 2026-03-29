from PIL import Image
import os
import fitz  # PyMuPDF
import unicodedata

# REMOVA qualquer linha que tente importar ImageProcessor ou PDFProcessor aqui!

class ImageProcessor:
    @staticmethod
    def compress_image(input_path, output_path, quality=70):
        """Reduz o tamanho da imagem (KB) mantendo a proporção."""
        with Image.open(input_path) as img:
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            
            img.save(output_path, "JPEG", optimize=True, quality=quality)
            return os.path.getsize(output_path)

class PDFProcessor:
    @staticmethod
    def scan_to_pdf(image_paths, output_pdf_path):
        """Transforma uma lista de imagens em um único PDF."""
        images = []
        for f in image_paths:
            try:
                img = Image.open(f).convert("RGB")
                images.append(img)
            except Exception as e:
                print(f"Erro ao processar imagem para PDF: {e}")
        
        if images:
            images[0].save(output_pdf_path, save_all=True, append_images=images[1:])

    @staticmethod
    def pdf_to_html_edit(pdf_path):
        """Desconstrói o PDF com correção de fonte fantasma (solda de acentos)."""
        doc = fitz.open(pdf_path)
        html_pages = ""
        
        # Mapa de correção para fontes "fantasmas" (comum em LaTeX/UFT)
        correcoes = {
            "˜ao": "ão", "˜aes": "ães", "¸c": "ç", "˜a": "ã", "˜o": "õ",
            "´o": "ó", "´a": "á", "´e": "é", "´ı": "í", "´u": "ú",
            "ˆe": "ê", "ˆa": "â", "ˆo": "ô", "`a": "à"
        }
        
        for page_num, page in enumerate(doc):
            width = page.rect.width
            height = page.rect.height
            
            page_html = (
                f'<div class="pdf-page-canvas" id="page-{page_num}" style="'
                f'position: relative; width: {width}px; height: {height}px; '
                f'background: white; margin: 20px auto; border: 1px solid #ccc; '
                f'box-shadow: 0 4px 8px rgba(0,0,0,0.1);">'
            )
            
            blocks = page.get_text("dict")["blocks"]
            
            for b in blocks:
                if "lines" in b:
                    for l in b["lines"]:
                        for s in l["spans"]:
                            # 1. Normalização Unicode para tentar juntar caracteres
                            texto = unicodedata.normalize("NFKC", s["text"])
                            
                            # 2. Correção Manual de "Fonte Fantasma" (Solda dos acentos LaTeX)
                            for erro, correto in correcoes.items():
                                if erro in texto:
                                    texto = texto.replace(erro, correto)
                            
                            color_hex = hex(s['color'])[2:].zfill(6)
                            if color_hex == "ffffff": 
                                color_hex = "333333"
                            
                            style = (
                                f"position: absolute; "
                                f"left: {s['origin'][0]}px; "
                                f"top: {s['origin'][1]}px; "
                                f"font-size: {s['size']}px; "
                                f"color: #{color_hex}; "
                                f"font-family: Arial, sans-serif; "
                                f"white-space: pre; "
                                f"line-height: 1;"
                            )
                            
                            page_html += f'<span contenteditable="true" style="{style}">{texto}</span>'
            
            page_html += '</div>'
            html_pages += page_html
            
        doc.close()
        return html_pages