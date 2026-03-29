/**
 * @class PetAssistant
 * @description Controla o comportamento do assistente ZAPT (Mascote 100% CSS).
 */
export class PetAssistant {
    constructor() {
        this.el = document.getElementById('pet');
        this.summonBtn = document.getElementById('pet-summon');
        this.speechBubble = document.getElementById('pet-speech');
        this.messageEl = document.getElementById('pet-message');
        this.pupils = document.querySelectorAll('.pupil');
        
        this.dialogs = {
            'welcome': 'Olá! Sou o ZAPT. Preparado para otimizar seus arquivos? 🐙',
            'dashboard': 'No Dashboard você vê o resumo do sistema. Escolha uma ferramenta no menu lateral!',
            'compress': 'A ferramenta Comprimir reduz o peso (KB) das imagens sem perder a qualidade cibernética!',
            'scan': 'Em Digitalizar, eu agrupo suas fotos em um PDF único e profissional para você.',
            'edit': 'No Editor, você pode carregar um PDF e escrever por cima dele. Ótimo para assinar documentos! ✍️🐙',
            'pdf-loaded': 'PDF carregado! Clique em "Adicionar Texto" e depois clique na folha para escrever.',
            'edit-start': 'Segura aí! Estou desconstruindo os pixels desse PDF para deixar tudo editável para você... 🐙⚡',
            'edit-ready': 'Prontinho! O arquivo agora é seu. Pode apagar, escrever ou mudar o que quiser direto na folha! ✍️',
            'celebrate': 'YAY! Sinerg.IA em ação! Seu arquivo foi processado com sucesso! 🎉',
            'error': 'Ops! Algo deu errado no processamento. Tente novamente, humano.'
        };

        this.init();
    }

    init() {
        document.addEventListener('mousemove', (e) => this.followMouse(e));
        
        // Inicia imediatamente na posição do Dashboard
        setTimeout(() => {
            this.el.classList.add('pet-pos-dashboard');
            this.toggle(true);
            this.speak('welcome');
        }, 800);
    }

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

    speak(key) {
        if (!this.speechBubble || !this.messageEl) return;

        const msg = this.dialogs[key] || key;
        
        // 1. Esconde o balão enquanto a lula nada
        this.speechBubble.classList.remove('active');

        // 2. Função para mostrar o balão após o nado
        const showBubble = () => {
            // Checa se a lula parou no lado esquerdo (perto da sidebar)
            const rect = this.el.getBoundingClientRect();
            if (rect.left < 450) {
                this.el.classList.add('pet-invert-bubble');
            } else {
                this.el.classList.remove('pet-invert-bubble');
            }

            this.messageEl.innerText = msg;
            this.speechBubble.classList.add('active');
            
            // Limpa o escutador para não duplicar
            this.el.removeEventListener('transitionend', showBubble);
        };

        // 3. Escuta o fim da transição CSS para disparar o balão
        this.el.addEventListener('transitionend', showBubble);

        // Fallback: se ela já estiver no lugar, dispara em 200ms
        setTimeout(() => {
            if (!this.speechBubble.classList.contains('active')) showBubble();
        }, 1700);

        if (this.speechTimeout) clearTimeout(this.speechTimeout);
        this.speechTimeout = setTimeout(() => {
            this.speechBubble.classList.remove('active');
        }, 8000);
    }

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

    celebrate() {
        this.speak('celebrate');
        this.el.classList.add('celebrating');
        setTimeout(() => this.el.classList.remove('celebrating'), 3500);
    }
}