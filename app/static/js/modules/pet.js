/**
 * @class PetAssistant
 * @description Controla o comportamento do assistente ZAPT (Mascote 100% CSS).
 * Gerencia diálogos dinâmicos, animações de nado e acompanhamento ocular.
 */
export class PetAssistant {
    constructor() {
        this.el = document.getElementById('pet');
        this.summonBtn = document.getElementById('pet-summon');
        this.speechBubble = document.getElementById('pet-speech');
        this.messageEl = document.getElementById('pet-message');
        this.pupils = document.querySelectorAll('.pupil');
        
        // --- DIÁLOGOS ATUALIZADOS PARA O NOVO MOTOR ---
        this.dialogs = {
            'welcome': 'Olá, sou o ZAPT! 🐙 Pronto para dar vida nova aos seus documentos com a Sinerg.IA?',
            'dashboard': 'Aqui é o centro de comando. Escolha uma ferramenta para começarmos a mágica!',
            'compress': 'A compressão reduz o peso dos arquivos sem quebrar os pixels. Qualidade pura! ⚡',
            'scan': 'Vou agrupar suas imagens em um PDF único, limpo e profissional. Pode mandar as fotos!',
            'edit': 'Este é o Editor Inteligente. Diferente de outros, eu não apenas anoto: eu reconstruo o texto para você mudar o que quiser! ✍️',
            'pdf-loaded': 'Consegui! O PDF foi desconstruído. Agora você pode clicar em qualquer linha para apagar, reescrever ou formatar.',
            'edit-start': 'Segura a onda! Estou usando IA para ler esses pixels e transformar o PDF em um documento editável de verdade... 🐙🧠',
            'edit-ready': 'Feito! Agora o documento é fluxo vivo. Pode editar o texto, mudar fontes ou adicionar tabelas da verdade no final! 📄✨',
            'celebrate': 'XABLAU! Sinerg.IA em ação! Processamento concluído com sucesso. Ficou perfeito! 🎉',
            'error': 'Ops! Ocorreu um erro na matriz. Verifique o arquivo e tente novamente, humano.'
        };

        this.init();
    }

    init() {
        // Movimento dos olhos seguindo o cursor
        document.addEventListener('mousemove', (e) => this.followMouse(e));
        
        // Inicia na posição do Dashboard com um delay suave
        setTimeout(() => {
            if (this.el) {
                this.el.classList.add('pet-pos-dashboard');
                this.toggle(true);
                this.speak('welcome');
            }
        }, 800);
    }

    /**
     * Faz as pupilas do ZAPT seguirem o movimento do mouse para dar vida ao mascote.
     */
    followMouse(e) {
        if (!this.el || this.el.classList.contains('closed')) return;

        this.pupils.forEach(pupil => {
            const rect = pupil.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            const angle = Math.atan2(e.clientX - x, e.clientY - y);
            const rot = (angle * (180 / Math.PI) * -1) + 90;
            pupil.parentElement.style.transform = `rotate(${rot}deg)`;
        });
    }

    /**
     * Faz o ZAPT falar. O balão só aparece após o término do "nado" (transição CSS).
     * @param {string} key - Chave do diálogo ou texto personalizado.
     */
    speak(key) {
        if (!this.speechBubble || !this.messageEl) return;

        const msg = this.dialogs[key] || key;
        
        // 1. Esconde o balão enquanto o ZAPT se desloca
        this.speechBubble.classList.remove('active');

        const showBubble = () => {
            // Lógica de inversão: se o ZAPT estiver muito à esquerda, inverte o balão para não cortar na tela
            const rect = this.el.getBoundingClientRect();
            if (rect.left < 450) {
                this.el.classList.add('pet-invert-bubble');
            } else {
                this.el.classList.remove('pet-invert-bubble');
            }

            this.messageEl.innerText = msg;
            this.speechBubble.classList.add('active');
            
            // Remove o listener para evitar execuções duplicadas
            this.el.removeEventListener('transitionend', showBubble);
        };

        // 2. Escuta o fim do movimento (nado) para falar
        this.el.addEventListener('transitionend', showBubble);

        // Fallback: Se o ZAPT já estiver na posição, dispara a fala em breve
        setTimeout(() => {
            if (!this.speechBubble.classList.contains('active')) showBubble();
        }, 1850);

        // Auto-hide: O balão some após 8 segundos para não poluir a tela
        if (this.speechTimeout) clearTimeout(this.speechTimeout);
        this.speechTimeout = setTimeout(() => {
            this.speechBubble.classList.remove('active');
        }, 8000);
    }

    /**
     * Alterna a visibilidade do assistente.
     */
    toggle(force = null) {
        if (!this.el) return;
        const isClosed = this.el.classList.contains('closed');
        const show = force !== null ? force : isClosed;
        
        if (show) {
            this.el.classList.remove('closed');
            if (this.summonBtn) this.summonBtn.style.display = 'none';
        } else {
            this.el.classList.add('closed');
            if (this.summonBtn) this.summonBtn.style.display = 'block';
            this.speechBubble.classList.remove('active');
        }
    }

    /**
     * Aciona a animação de comemoração e fala de sucesso.
     */
    celebrate() {
        this.speak('celebrate');
        this.el.classList.add('celebrating');
        setTimeout(() => {
            if (this.el) this.el.classList.remove('celebrating');
        }, 3500);
    }
}