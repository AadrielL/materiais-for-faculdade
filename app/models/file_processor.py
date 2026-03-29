from PIL import Image
import os
import fitz  # PyMuPDF

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
        """Desconstrói o PDF para exibição editável organizada por páginas."""
        doc = fitz.open(pdf_path)
        html_pages = ""
        
        for page_num, page in enumerate(doc):
            # Obtemos as dimensões da página para o contêiner
            width = page.rect.width
            height = page.rect.height
            
            # Cada página ganha um ID único e posição relativa
            # margin-bottom e border ajudam a separar visualmente as páginas na tela
            page_html = (
                f'<div class="pdf-page-canvas" id="page-{page_num}" style="'
                f'position: relative; '
                f'width: {width}px; '
                f'height: {height}px; '
                f'background: white; '
                f'margin: 20px auto; '
                f'border: 1px solid #ccc; '
                f'box-shadow: 0 4px 8px rgba(0,0,0,0.1);">'
            )
            
            blocks = page.get_text("dict")["blocks"]
            
            for b in blocks:
                if "lines" in b:
                    for l in b["lines"]:
                        for s in l["spans"]:
                            # Tratamento de cores
                            color_hex = hex(s['color'])[2:].zfill(6)
                            if color_hex == "ffffff": 
                                color_hex = "333333" # Garante que texto branco não suma no fundo branco
                            
                            # O segredo: os 'tops' e 'lefts' agora são relativos à DIV pai (page-canvas)
                            style = (
                                f"position: absolute; "
                                f"left: {s['origin'][0]}px; "
                                f"top: {s['origin'][1]}px; "
                                f"font-size: {s['size']}px; "
                                f"color: #{color_hex}; "
                                f"font-family: sans-serif; "
                                f"white-space: pre; "
                                f"line-height: 1;"
                            )
                            
                            # Usamos span com contenteditable para permitir a edição
                            page_html += f'<span contenteditable="true" style="{style}">{s["text"]}</span>'
            
            page_html += '</div>'
            html_pages += page_html
            
        doc.close()
        return html_pages