/**
 * @file main.js
 * @description Orquestrador principal do SaaS Conversor Pro com Editor Avançado.
 */

import { Sidebar } from './modules/sidebar.js';
import { PetAssistant } from './modules/pet.js';
import { UIController } from './modules/ui_controller.js';

const sidebar = new Sidebar();
const pet = new PetAssistant();
const ui = new UIController(pet, sidebar);

// Variáveis para controle de arraste (Drag and Drop)
let isDragging = false;
let currentElement = null;
let offset = { x: 0, y: 0 };

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

// --- FUNÇÃO DE DOWNLOAD GLOBAL (CORRIGIDA PARA MÚLTIPLAS PÁGINAS) ---
window.downloadEditedPdf = () => {
    const element = document.getElementById('editable-content');
    if (!element || element.innerText.includes("Selecione um PDF")) {
        alert("Nenhum documento carregado.");
        return;
    }
    const opt = {
        margin: 0,
        filename: 'documento_editado.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'px', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'css', before: '.pdf-page-canvas' }
    };
    html2pdf().set(opt).from(element).save();
};

// --- FUNÇÃO PARA ADICIONAR PÁGINA DE TABELA VERDADE (LAYOUT GRADE) ---
window.addTruthTablePage = (rows) => {
    const container = document.getElementById('editable-content');

    // Procura por uma página de respostas já existente ou cria uma nova
    let answerPage = container.querySelector('.extra-answer-page');
    
    if (!answerPage) {
        answerPage = document.createElement('div');
        answerPage.className = "pdf-page-canvas extra-answer-page";
        
        Object.assign(answerPage.style, {
            position: "relative",
            width: "595px",
            minHeight: "842px",
            background: "white",
            margin: "20px auto",
            padding: "30px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr", // Duas colunas para caber mais
            gap: "20px",
            boxSizing: "border-box",
            border: "1px solid #ccc"
        });
        container.appendChild(answerPage);
    }

    const tableContainer = document.createElement('div');
    tableContainer.style.border = "1px solid #eee";
    tableContainer.style.padding = "10px";

    let tableRows = "";
    for(let i=0; i<rows; i++) {
        tableRows += `<tr><td contenteditable="true"></td><td contenteditable="true"></td><td contenteditable="true"></td></tr>`;
    }

    tableContainer.innerHTML = `
        <p style="color:black; font-size:12px; margin:0 0 5px 0; font-weight:bold; font-family:Arial;">Questão (Tabela ${rows} lin.)</p>
        <table border="1" style="width:100%; border-collapse:collapse; color:black; font-family:Arial; text-align:center; font-size:11px;">
            <tr style="background:#f2f2f2"><th>P</th><th>Q</th><th>R</th></tr>
            ${tableRows}
        </table>
    `;
    
    answerPage.appendChild(tableContainer);
    answerPage.scrollIntoView({behavior: "smooth"});
};

document.addEventListener('DOMContentLoaded', () => {
// 1. Carregamento de preferências de tema
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeBtn = document.querySelector('.theme-switch');
    if (themeBtn) themeBtn.innerHTML = savedTheme === 'light' ? '🌙' : '💡';

// 2. Lógica do Editor: Criar Texto (Clique Duplo)
    document.body.addEventListener('dblclick', (e) => {
        const pageCanvas = e.target.closest('.pdf-page-canvas');
        if (pageCanvas && e.target.tagName !== 'SPAN' && e.target.tagName !== 'TD') {
            const rect = pageCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const newText = document.createElement('span');
            newText.contentEditable = "true";
            newText.innerText = "Novo Texto"; 
            newText.className = "editable-pdf-text";
            
            Object.assign(newText.style, {
                position: "absolute",
left: `${x}px`,
top: `${y}px`,
                fontSize: "14px",
color: "#333",
fontFamily: "sans-serif",
                whiteSpace: "pre",
padding: "2px",
cursor: "move",
zIndex: "100",
                outline: "none",
border: "1px dashed transparent"
            });

            pageCanvas.appendChild(newText);
            newText.focus();

            const range = document.createRange();
            range.selectNodeContents(newText);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    });

// 3. Lógica do Editor: Mover Texto (Drag and Drop)
    document.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'SPAN' && e.target.closest('.pdf-page-canvas')) {
            isDragging = true;
currentElement = e.target;

            const rect = currentElement.getBoundingClientRect();
            offset.x = e.clientX - rect.left;
offset.y = e.clientY - rect.top;

            currentElement.style.cursor = 'grabbing';
            currentElement.style.border = "1px dashed #4A90E2";
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging && currentElement) {
            const pageCanvas = currentElement.closest('.pdf-page-canvas');
            const canvasRect = pageCanvas.getBoundingClientRect();

            let newX = e.clientX - canvasRect.left - offset.x;
            let newY = e.clientY - canvasRect.top - offset.y;

            currentElement.style.left = `${newX}px`;
currentElement.style.top = `${newY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging && currentElement) {
            isDragging = false;
currentElement.style.cursor = 'move';
            currentElement.style.border = "1px dashed transparent";

            if (currentElement.innerText.trim() === "") {
currentElement.remove();
}
            currentElement = null;
        }
    });

// 4. Lógica do Editor: Deletar Texto
    document.addEventListener('keydown', (e) => {
        const active = document.activeElement;
        if ((e.key === "Delete" || e.key === "Backspace") && 
active.tagName === 'SPAN' && 
active.innerText.trim() === "") {
            active.remove();
        }
    });

    console.log("Sinerg.IA: Arquitetura Modular Ativa! 🐙🚀");
});