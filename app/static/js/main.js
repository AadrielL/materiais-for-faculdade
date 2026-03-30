import { Sidebar } from './modules/sidebar.js';
import { PetAssistant } from './modules/pet.js';
import { UIController } from './modules/ui_controller.js';

const sidebar = new Sidebar();
const pet = new PetAssistant();
const ui = new UIController(pet, sidebar);

// --- INTERFACE GLOBAL ---
window.showSection = (id) => ui.showSection(id);
window.toggleSidebar = () => sidebar.toggle();
window.togglePet = () => pet.toggle();
window.handleConversion = (form) => ui.handleConversion(form);
window.processPdfForEdit = (input) => ui.processPdfForEdit(input); 

// --- SELETOR DE FONTE E TAMANHO ---
window.changeGlobalFont = (fontName) => {
    const textElements = document.querySelectorAll('.editable-pdf-text');
    textElements.forEach(el => el.style.fontFamily = fontName);
    pet.speak(`Fonte alterada para ${fontName.split(',')[0]}!`, "info");
};

window.changeFontSize = (size) => {
    const textElements = document.querySelectorAll('.editable-pdf-text');
    textElements.forEach(el => el.style.fontSize = size + 'px');
    pet.speak(`Tamanho ajustado para ${size}px.`, "info");
};

// --- DOWNLOAD GLOBAL (O XABLAU DEFINITIVO 1:1) ---
window.downloadEditedPdf = () => {
    const element = document.querySelector('.editor-paper');
    
    if (!element || element.innerText.trim().length < 5) {
        pet.speak("Carregue um PDF primeiro!", "error");
        return;
    }

    pet.speak("celebrate");

    // 1. Forçamos o scroll pro topo (HTML2PDF buga se não estiver no topo)
    window.scrollTo(0, 0);

    const opt = {
        margin: 0, 
        filename: 'lista_corrigida_uft.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            logging: false, 
            letterRendering: true,
            scrollY: 0,
            scrollX: 0,
            // Forçamos o fundo branco para o motor enxergar o texto
            backgroundColor: '#ffffff' 
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
        pagebreak: { mode: ['css', 'legacy'] }
    };
    
    // 2. Executamos o download
    html2pdf().set(opt).from(element).save();
    pet.celebrate();
};

// --- ADICIONAR TEXTO/ESPAÇO ---
window.addNewSpace = () => {
    const paginas = document.querySelectorAll('.pdf-page-canvas');
    const ultimaPagina = paginas[paginas.length - 1];

    if (!ultimaPagina) {
        pet.speak("Carregue um PDF primeiro!", "error");
        return;
    }

    const novoBloco = document.createElement('p');
    novoBloco.className = "editable-pdf-text";
    novoBloco.contentEditable = "true";
    novoBloco.innerHTML = "Clique para editar...";
    novoBloco.style.minHeight = "1.5em";
    novoBloco.style.marginTop = "15px";

    const contentDiv = ultimaPagina.querySelector('[contenteditable="true"]');
    (contentDiv || ultimaPagina).appendChild(novoBloco);

    novoBloco.scrollIntoView({ behavior: "smooth" });
    novoBloco.focus();
    pet.speak("edit-ready");
};

// --- FUNÇÃO TABELA VERDADE ---
window.addTruthTablePage = (rows) => {
    const paginas = document.querySelectorAll('.pdf-page-canvas');
    const ultimaPagina = paginas[paginas.length - 1];

    if (!ultimaPagina) return;

    const contentDiv = ultimaPagina.querySelector('[contenteditable="true"]');
    
    let tableGrid = ultimaPagina.querySelector('.table-grid-container');
    if (!tableGrid) {
        tableGrid = document.createElement('div');
        tableGrid.className = 'table-grid-container';
        contentDiv.appendChild(tableGrid);
    }

    const tableWrapper = document.createElement('div');
    tableWrapper.className = "truth-table-wrapper";

    let rowsHtml = "";
    for(let i=0; i<rows; i++) {
        rowsHtml += `<tr><td contenteditable="true"></td><td contenteditable="true"></td><td contenteditable="true"></td></tr>`;
    }

    tableWrapper.innerHTML = `
        <p class="no-print" style="color:#111; font-weight:bold; font-size:10px; margin-bottom: 2px;">Tabela (${rows} linhas)</p>
        <table border="1" style="width:100%; border-collapse:collapse;">
            <tr style="background:#f2f2f2">
                <th contenteditable="true">P</th>
                <th contenteditable="true">Q</th>
                <th contenteditable="true">R</th>
            </tr>
            ${rowsHtml}
        </table>
    `;
    
    tableGrid.appendChild(tableWrapper);
    tableWrapper.scrollIntoView({behavior: "smooth"});
};

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeBtn = document.querySelector('.theme-switch');
    if (themeBtn) themeBtn.innerHTML = savedTheme === 'light' ? '🌙' : '💡';
    console.log("Sinerg.IA: Modo Reescrita Ativo 🐙🚀");
});