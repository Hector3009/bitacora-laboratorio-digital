// Datos de ejemplo de las prácticas
const defaultPractices = [
    {
        id: 1,
        title: "Tinción de Gram",
        category: "Microbiología",
        date: "2024-03-15",
        image: "https://loremflickr.com/800/600/microbiology,microscope?lock=1",
        summary: "Identificación de bacterias Gram positivas y negativas mediante coloración diferencial.",
        objective: "Diferenciar la morfología y composición de la pared celular bacteriana.",
        materials: ["Cristal violeta", "Lugol", "Alcohol-acetona", "Safranina", "Portaobjetos", "Mechero Bunsen"],
        procedure: [
            "Realizar el frotis y fijar al calor.",
            "Cubrir con cristal violeta por 1 minuto.",
            "Lavar y aplicar Lugol por 1 minuto.",
            "Decolorar con alcohol-acetona rápidamente.",
            "Contrastar con safranina por 30 segundos y observar."
        ],
        results: "Se observaron cocos Gram positivos (púrpura) en racimos, compatibles con Staphylococcus spp."
    },
    {
        id: 2,
        title: "Titulación Ácido-Base",
        category: "Química",
        date: "2024-03-20",
        image: "https://loremflickr.com/800/600/chemistry,laboratory?lock=2",
        summary: "Determinación de la concentración de una solución de HCl usando NaOH.",
        objective: "Aplicar los conceptos de estequiometría y neutralización en el laboratorio.",
        materials: ["Bureta", "Matraz Erlenmeyer", "Fenolftaleína", "Soporte universal"],
        procedure: [
            "Llenar la bureta con NaOH 0.1M.",
            "Agregar 10ml de HCl al matraz con 2 gotas de indicador.",
            "Titular hasta observar el viraje a rosa persistente.",
            "Registrar el volumen gastado."
        ],
        results: "Punto de equivalencia alcanzado a los 12.5ml de NaOH. Concentración calculada: 0.125M."
    }
];

// Inicialización de datos con LocalStorage
let practices = JSON.parse(localStorage.getItem('lab_practices')) || defaultPractices;
let categories = JSON.parse(localStorage.getItem('lab_categories')) || ["Química", "Microbiología", "Hematología"];

function saveToStorage() {
    localStorage.setItem('lab_practices', JSON.stringify(practices));
}

function saveCategories() {
    localStorage.setItem('lab_categories', JSON.stringify(categories));
    renderCategoryUI();
}

// Función para renderizar toda la interfaz de categorías
function renderCategoryUI() {
    const filterContainer = document.getElementById('filter-buttons');
    const formSelect = document.getElementById('formCategory');
    const manageList = document.getElementById('categoryList');

    // 1. Barra de Filtros
    const currentFilter = document.querySelector('#filter-buttons .active')?.getAttribute('data-filter') || 'all';
    filterContainer.innerHTML = `<button class="btn btn-outline-primary ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">Todas</button>`;
    categories.forEach(cat => {
        filterContainer.innerHTML += `<button class="btn btn-outline-primary ${currentFilter === cat ? 'active' : ''}" data-filter="${cat}">${cat}</button>`;
    });

    // 2. Select del Formulario
    formSelect.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');

    // 3. Lista de Gestión
    manageList.innerHTML = categories.map(cat => `
        <div class="category-item border shadow-sm">
            <span class="small fw-bold">${cat}</span>
            <div class="d-flex gap-2">
                <button class="btn btn-link btn-sm text-warning p-0" onclick="editCategory('${cat}')" title="Editar">✏️</button>
                <button class="btn btn-link btn-sm text-danger p-0" onclick="deleteCategory('${cat}')" title="Eliminar">🗑️</button>
            </div>
        </div>
    `).join('');
}

window.addCategory = function() {
    const input = document.getElementById('newCategoryInput');
    const name = input.value.trim();
    if (name && !categories.includes(name)) {
        categories.push(name);
        input.value = '';
        saveCategories();
    }
};

window.editCategory = function(oldName) {
    const newName = prompt(`Editar nombre de la categoría "${oldName}":`, oldName);
    
    if (newName && newName.trim() !== "" && newName !== oldName) {
        const trimmedName = newName.trim();
        
        // 1. Actualizar el array de categorías
        const catIndex = categories.indexOf(oldName);
        if (catIndex !== -1) categories[catIndex] = trimmedName;

        // 2. Actualización en cascada: actualizar todas las prácticas que usaban el nombre viejo
        practices.forEach(p => {
            if (p.category === oldName) p.category = trimmedName;
        });

        saveToStorage();
        saveCategories();
        renderPractices(); // Refrescar las tarjetas para mostrar los nuevos nombres en los badges
    }
};

window.deleteCategory = function(name) {
    const isUsed = practices.some(p => p.category === name);
    if (isUsed) {
        alert('No se puede eliminar: esta categoría está siendo usada por una o más prácticas.');
        return;
    }
    if (confirm(`¿Eliminar la categoría "${name}"?`)) {
        categories = categories.filter(c => c !== name);
        saveCategories();
    }
};

// Función para renderizar las tarjetas
function renderPractices(filter = 'all') {
    const grid = document.getElementById('practice-grid');
    grid.innerHTML = '';

    const filtered = filter === 'all' 
        ? practices 
        : practices.filter(p => p.category === filter);

    filtered.forEach(p => {
        const cardHtml = `
            <div class="col">
                <div class="card h-100 shadow-sm">
                    <img src="${p.image}" class="card-img-top" alt="${p.title}">
                    <div class="card-body">
                        <span class="badge badge-${p.category.toLowerCase()} mb-2">${p.category}</span>
                        <h5 class="card-title fw-bold">${p.title}</h5>
                        <p class="text-muted small mb-2">📅 ${p.date}</p>
                        <p class="card-text text-secondary">${p.summary}</p>
                    </div>
                    <div class="card-footer d-flex gap-2 p-3">
                        <button class="btn btn-primary btn-sm flex-grow-1" onclick="showDetail(${p.id})">Ver reporte</button>
                        <button class="btn btn-outline-warning btn-sm" onclick="editPractice(${p.id})" title="Editar"><i class="bi bi-pencil"></i> ✏️</button>
                        <button class="btn btn-outline-danger btn-sm" onclick="deletePractice(${p.id})" title="Eliminar">🗑️</button>
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML += cardHtml;
    });
}

// Función para mostrar el detalle en el modal
window.showDetail = function(id) {
    const p = practices.find(item => item.id === id);
    const modalBody = document.getElementById('modalBody');
    const modalTitle = document.getElementById('modalTitle');

    modalTitle.innerText = `Reporte: ${p.title}`;
    
    modalBody.innerHTML = `
        <div class="mb-4">
            <h6 class="practice-section-title">Objetivo</h6>
            <p>${p.objective}</p>
        </div>
        <div class="mb-4">
            <h6 class="practice-section-title">Materiales y Reactivos</h6>
            <ul>${p.materials.map(m => `<li>${m}</li>`).join('')}</ul>
        </div>
        <div class="mb-4">
            <h6 class="practice-section-title">Procedimiento</h6>
            <ol>${p.procedure.map(step => `<li>${step}</li>`).join('')}</ol>
        </div>
        <div class="mb-4">
            <h6 class="practice-section-title">Resultados y Conclusiones</h6>
            <div class="p-3 bg-light rounded border-start border-4 border-success">
                <p class="mb-0 italic">${p.results}</p>
            </div>
        </div>
    `;

    const myModal = new bootstrap.Modal(document.getElementById('practiceModal'));
    myModal.show();
};

// --- Lógica CRUD ---

window.prepareCreate = function() {
    document.getElementById('practiceForm').reset();
    document.getElementById('practiceId').value = '';
    document.getElementById('formImage').value = '';
    document.getElementById('formModalTitle').innerText = 'Nueva Práctica';
};

window.editPractice = function(id) {
    const p = practices.find(item => item.id === id);
    document.getElementById('practiceId').value = p.id;
    document.getElementById('formTitle').value = p.title;
    document.getElementById('formCategory').value = p.category;
    document.getElementById('formDate').value = p.date;
    document.getElementById('formSummary').value = p.summary;
    document.getElementById('formImage').value = p.image.includes('loremflickr.com') ? '' : p.image;
    document.getElementById('formObjective').value = p.objective;
    document.getElementById('formMaterials').value = p.materials.join('\n');
    document.getElementById('formProcedure').value = p.procedure.join('\n');
    document.getElementById('formResults').value = p.results;
    
    document.getElementById('formModalTitle').innerText = 'Editar Práctica';
    const myModal = new bootstrap.Modal(document.getElementById('practiceFormModal'));
    myModal.show();
};

window.deletePractice = function(id) {
    if(confirm('¿Estás seguro de que deseas eliminar este registro?')) {
        practices = practices.filter(p => p.id !== id);
        saveToStorage();
        renderPractices();
    }
};

document.getElementById('practiceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('practiceId').value;
    const category = document.getElementById('formCategory').value;
    const customImage = document.getElementById('formImage').value.trim();
    const finalId = id ? parseInt(id) : Date.now();
    
    const practiceData = {
        id: finalId,
        title: document.getElementById('formTitle').value,
        category: category,
        date: document.getElementById('formDate').value,
        summary: document.getElementById('formSummary').value,
        objective: document.getElementById('formObjective').value,
        materials: document.getElementById('formMaterials').value.split('\n').filter(l => l.trim() !== ''),
        procedure: document.getElementById('formProcedure').value.split('\n').filter(l => l.trim() !== ''),
        results: document.getElementById('formResults').value,
        image: customImage || `https://loremflickr.com/800/600/${category.toLowerCase()},lab?lock=${finalId}`
    };

    if (id) {
        const index = practices.findIndex(p => p.id == id);
        practices[index] = practiceData;
    } else {
        practices.push(practiceData);
    }

    saveToStorage();
    renderPractices();
    
    const modalInstance = bootstrap.Modal.getInstance(document.getElementById('practiceFormModal'));
    modalInstance.hide();
});

// Manejo de filtros
document.getElementById('filter-buttons').addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        // Cambiar estado activo de botones
        document.querySelectorAll('#filter-buttons .btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        // Filtrar
        renderPractices(e.target.getAttribute('data-filter'));
    }
});

// Función para crear la animación de Sakura
function initSakura() {
    const container = document.getElementById('sakura-container');
    if (!container) return;

    const petalCount = 15; // Cantidad de pétalos simultáneos

    for (let i = 0; i < petalCount; i++) {
        createPetal(container);
    }
}

function createPetal(container) {
    const petal = document.createElement('div');
    petal.className = 'petal';
    
    const size = Math.random() * 10 + 10 + 'px';
    petal.style.width = size;
    petal.style.height = size;
    petal.style.left = Math.random() * 100 + '%';
    petal.style.animationDuration = Math.random() * 5 + 5 + 's'; // Entre 5 y 10 segundos
    petal.style.animationDelay = Math.random() * 5 + 's';

    container.appendChild(petal);
}

// Carga inicial
document.addEventListener('DOMContentLoaded', () => {
    renderCategoryUI();
    renderPractices();
    initSakura();
});