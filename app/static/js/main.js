/**
 * @file main.js
 * @description Orquestrador principal do SaaS Conversor Pro.
 * Gerencia a inicialização dos módulos e expõe funções globais para o HTML.
 */

import { Sidebar } from './modules/sidebar.js';
import { PetAssistant } from './modules/pet.js';
import { UIController } from './modules/ui_controller.js';

// Inicialização das dependências modulares
const sidebar = new Sidebar();
const pet = new PetAssistant();
const ui = new UIController(pet, sidebar);

/**
 * Interface de Comunicação Global (window)
 * Necessário para os seletores 'onclick', 'onchange' e 'onsubmit' no Jinja2 templates.
 */
window.showSection = (id) => ui.showSection(id);
window.toggleSidebar = () => sidebar.toggle();
window.togglePet = () => pet.toggle();
window.handleConversion = (form) => ui.handleConversion(form);

// Conexão do novo Editor Inteligente (Mágica por trás dos panos)
window.processPdfForEdit = (input) => ui.processPdfForEdit(input); 

/**
 * Gerenciador de Temas (Dark/Light Mode)
 * Utiliza LocalStorage para persistência da preferência do usuário.
 */
window.toggleTheme = () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const btn = document.querySelector('.theme-switch');
    if (btn) btn.innerHTML = newTheme === 'light' ? '🌙' : '💡';
};

document.addEventListener('DOMContentLoaded', () => {
    // Carregamento de preferências salvas
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeBtn = document.querySelector('.theme-switch');
    if (themeBtn) themeBtn.innerHTML = savedTheme === 'light' ? '🌙' : '💡';

    console.log("Sinerg.IA: Arquitetura Modular Ativa! 🐙🚀");
});