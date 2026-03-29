/**
 * @class Sidebar
 * @description Gerencia o estado e as animações do menu lateral retrátil.
 */
export class Sidebar {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.content = document.getElementById('main-content');
        this.toggleBtn = document.querySelector('.menu-toggle');
    }

    /**
     * Alterna o estado da barra lateral (Aberta/Fechada).
     */
    toggle() {
        this.sidebar.classList.toggle('closed');
        this.content.classList.toggle('full-width');
        
        const isClosed = this.sidebar.classList.contains('closed');
        
        // Ajuste dinâmico do botão toggle para não ser coberto pela sidebar
        if (this.toggleBtn) {
            this.toggleBtn.style.left = isClosed ? '20px' : '260px';
        }
    }

    /**
     * Fecha automaticamente em dispositivos móveis após a seleção de uma ferramenta.
     */
    closeOnMobile() {
        if (window.innerWidth < 768 && !this.sidebar.classList.contains('closed')) {
            this.toggle();
        }
    }
}