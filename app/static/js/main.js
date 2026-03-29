/**
 * @file main.js
 * @description Orquestrador principal do SaaS Conversor Pro.
 */

import { Sidebar } from './modules/sidebar.js';
import { PetAssistant } from './modules/pet.js';
import { UIController } from './modules/ui_controller.js';

const sidebar = new Sidebar();
const pet = new PetAssistant();
const ui = new UIController(pet, sidebar);

// Interface de Comunicação Global
window.showSection = (id) => ui.showSection(id);
window.toggleSidebar = () => sidebar.toggle();
window.togglePet = () => pet.toggle();
window.handleConversion = (form) => ui.handleConversion(form);
window.processPdfForEdit = (input) => ui.processPdfForEdit(input); 

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

    // --- NOVIDADE: FUNÇÃO DE CLIQUE DUPLO PARA ADICIONAR TEXTO ---
    // Delegamos o evento para o body, mas filtramos apenas para as páginas do PDF
    document.body.addEventListener('dblclick', (e) => {
        // Verifica se clicou dentro de uma página ou em algo que já é texto
        const pageCanvas = e.target.closest('.pdf-page-canvas');
        
        if (pageCanvas) {
            // Se clicou em um texto que já existe, não cria outro em cima
            if (e.target.tagName === 'SPAN') return;

            const rect = pageCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const newText = document.createElement('span');
            newText.contentEditable = "true";
            newText.innerText = "Novo Texto"; 
            
            // Estilo idêntico ao que o Python gera no backend
            Object.assign(newText.style, {
                position: "absolute",
                left: `${x}px`,
                top: `${y}px`,
                fontSize: "14px",
                color: "var(--text-color, #333)", // Usa a cor do seu tema
                fontFamily: "sans-serif",
                whiteSpace: "pre",
                minWidth: "20px",
                padding: "2px",
                outline: "none",
                zIndex: "100"
            });

            // Feedback visual de que está editando
            newText.style.border = "1px dashed #4A90E2";

            pageCanvas.appendChild(newText);
            newText.focus();

            // Remove a bordinha azul quando perde o foco
            newText.addEventListener('blur', () => {
                newText.style.border = "none";
                if (newText.innerText.trim() === "") newText.remove();
            });
        }
    });

    console.log("Sinerg.IA: Arquitetura Modular Ativa! 🐙🚀");
});