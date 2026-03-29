/**
 * @class UIController
 * @description Gerencia a navegação entre seções e interações de formulários.
 * Sincroniza as ações do usuário com as respostas do assistente PetAssistant.
 */
export class UIController {
    constructor(pet, sidebar) {
        this.pet = pet;
        this.sidebar = sidebar;
    }

    /**
     * Alterna a visualização entre as seções da SPA (Single Page Application).
     * @param {string} sectionId - O ID da div de seção no HTML.
     */
    showSection(sectionId) {
        // Oculta todas as seções ativas
        document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
        
        // Exibe a seção alvo
        const target = document.getElementById(sectionId);
        if (target) {
            target.style.display = 'block';

            // --- LÓGICA DE MOVIMENTAÇÃO DO ZAPT (NADO) ---
            // Remove as classes de posições anteriores para resetar o estado
            this.pet.el.classList.remove('pet-pos-dashboard', 'pet-pos-compress', 'pet-pos-edit', 'pet-pos-scan');
            
            // Adiciona a nova classe de posição baseada no ID da seção
            // Isso aciona a transição CSS para os pontos que você definiu
            this.pet.el.classList.add(`pet-pos-${sectionId}`);
            
            // O assistente ZAPT contextualiza a ferramenta atual
            this.pet.toggle(true); 
            this.pet.speak(sectionId);
        }

        this.sidebar.closeOnMobile();
    }

    /**
     * Processa o PDF para o modo de edição inteligente.
     * Faz a ponte entre o upload do arquivo e a desconstrução feita pelo Python.
     * @param {HTMLInputElement} input - O input de arquivo do editor.
     */
    async processPdfForEdit(input) {
        if (!input.files[0]) return;

        // ZAPT avisa que começou o trabalho pesado
        this.pet.speak('edit-start'); 
        
        const formData = new FormData();
        formData.append('file', input.files[0]);

        try {
            // Requisição AJAX para o backend Flask
            const response = await fetch('/convert-to-edit', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Erro na conversão');

            const data = await response.json();
            
            // Injeta o HTML desconstruído na área editável
            const container = document.getElementById('editable-content');
            if (container) {
                container.innerHTML = data.html;
                // ZAPT comemora a conversão bem-sucedida
                this.pet.speak('edit-ready');
            }
            
        } catch (error) {
            console.error("Erro no Editor:", error);
            this.pet.speak('error');
        }
    }

    /**
     * Gerencia o feedback visual durante o processamento de arquivos (Compressão/Scan).
     * @param {HTMLFormElement} form - O formulário submetido.
     */
    handleConversion(form) {
        const btn = form.querySelector('button');
        const originalText = btn.innerHTML;

        // Feedback visual e animação de comemoração do assistente
        this.pet.celebrate();
        btn.innerHTML = "Sinerg.IA Processando...";
        btn.disabled = true;

        // Restauração do estado do botão após o tempo de resposta estimado
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 3500);

        return true; // Prossegue com o submit para o Flask
    }
}