const btnAgregarSuperior = document.getElementById('btn-agregar-gasto-superior');
const iconoFlotanteAgregar = document.getElementById('icono-flotante-agregar');
const popoverAgregar = document.getElementById('popover-agregar');
const btnCerrarPopover = document.getElementById('btn-cerrar-popover');
const formulario = document.getElementById('formulario-gastos');

const inputDescripcion = document.getElementById('descripcion-gasto');
const inputCategoria = document.getElementById('categoria-gasto');
const inputMonto = document.getElementById('monto-gasto');
const inputFecha = document.getElementById('fecha-gasto');

const listaGastosTbody = document.getElementById('lista-gastos-tbody');
const balanceMontoSpan = document.getElementById('balance-plata');
const selectFiltroCategoria = document.getElementById('filtro-categoria');
const inputFechaDesde = document.getElementById('fecha-desde');
const inputFechaHasta = document.getElementById('fecha-hasta');
const btnCalcularManual = document.getElementById('btn-calcular-manual');
const btnLimpiarFechas = document.getElementById('btn-limpiar-fechas');

let misGastos = [];
let editandoID = null;

document.addEventListener('DOMContentLoaded', () => {
    const gastosGuardados = localStorage.getItem('gastosMoneyFlow');
    if (gastosGuardados) misGastos = JSON.parse(gastosGuardados);
    aplicarFiltrosYMostrar();
});

// --- FUNCIÓN PARA ALERTAS PERSONALIZADAS (TOAST) ---
function showToast(message, type = "success") {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <span class="material-icons" onclick="this.parentElement.remove()">close</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function mostrarPopover() { popoverAgregar.classList.remove('hidden'); }
function ocultarPopover() { 
    popoverAgregar.classList.add('hidden'); 
    formulario.reset(); 
    editandoID = null; 
}

btnAgregarSuperior.addEventListener('click', mostrarPopover);
iconoFlotanteAgregar.addEventListener('click', mostrarPopover);
btnCerrarPopover.addEventListener('click', ocultarPopover);

// --- LÓGICA DE VALIDACIÓN Y ENVÍO ---
formulario.addEventListener('submit', function(evento) {
    evento.preventDefault();
    
    const descripcion = inputDescripcion.value.trim();
    const categoria = inputCategoria.value;
    const monto = parseFloat(inputMonto.value);
    const fecha = inputFecha.value;

    // VALIDACIONES PERSONALIZADAS
    if (!descripcion) {
        return showToast("✍️ Escribe una descripción para el gasto", "danger");
    }
    if (!categoria) {
        return showToast("📂 Selecciona una categoría", "danger");
    }
    if (isNaN(monto) || monto <= 0) {
        return showToast("💰 Ingresa un monto válido mayor a 0", "danger");
    }
    if (!fecha) {
        return showToast("📅 Selecciona una fecha", "danger");
    }

    const fechaHoy = new Date().toISOString().split('T')[0];
    if (fecha > fechaHoy) {
        return showToast("🚫 No puedes registrar gastos en el futuro", "danger");
    }

    // MODO EDICIÓN O CREACIÓN
    if (editandoID) {
        misGastos = misGastos.map(g => g.id === editandoID ? { ...g, descripcion, categoria, monto, fecha } : g);
        showToast("✏️ Gasto actualizado con éxito", "success");
        editandoID = null;
    } else {
        misGastos.push({ id: Date.now(), fecha, descripcion, categoria, monto });
        showToast("✅ Gasto registrado correctamente", "success");
    }

    sincronizarLocalStorage();
    aplicarFiltrosYMostrar();
    ocultarPopover();
});

function aplicarFiltrosYMostrar() {
    let filtrados = misGastos;
    if (selectFiltroCategoria.value !== 'todas') filtrados = filtrados.filter(g => g.categoria === selectFiltroCategoria.value);
    if (inputFechaDesde.value) filtrados = filtrados.filter(g => g.fecha >= inputFechaDesde.value);
    if (inputFechaHasta.value) filtrados = filtrados.filter(g => g.fecha <= inputFechaHasta.value);

    listaGastosTbody.innerHTML = '';
    let total = 0;
    filtrados.forEach(g => {
        total += g.monto;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${g.fecha}</td>
            <td>${g.descripcion}</td>
            <td>${g.categoria.charAt(0).toUpperCase() + g.categoria.slice(1)}</td>
            <td class="valor-monto">${new Intl.NumberFormat('es-CO', {style:'currency', currency:'COP'}).format(g.monto)}</td>
            <td class="iconos-acciones">
                <span class="material-icons icono-editar" onclick="editarGasto(${g.id})">edit</span>
                <span class="material-icons icono-borrar" onclick="borrarGasto(${g.id})">delete</span>
            </td>
        `;
        listaGastosTbody.appendChild(tr);
    });
    balanceMontoSpan.innerText = new Intl.NumberFormat('es-CO', {style:'currency', currency:'COP'}).format(total);
}

function editarGasto(id) {
    const gasto = misGastos.find(g => g.id === id);
    if (gasto) {
        inputDescripcion.value = gasto.descripcion;
        inputCategoria.value = gasto.categoria;
        inputMonto.value = gasto.monto;
        inputFecha.value = gasto.fecha;
        editandoID = id;
        mostrarPopover();
    }
}

function borrarGasto(id) {
    // Aquí puedes dejar el confirm o hacer un Toast que pida confirmación, 
    // pero por ahora usemos confirm para seguridad.
    if (confirm('¿Deseas eliminar este registro?')) {
        misGastos = misGastos.filter(g => g.id !== id);
        sincronizarLocalStorage();
        aplicarFiltrosYMostrar();
        showToast("🗑️ Gasto eliminado", "success");
    }
}

function sincronizarLocalStorage() { 
    localStorage.setItem('gastosMoneyFlow', JSON.stringify(misGastos)); 
}

selectFiltroCategoria.addEventListener('change', aplicarFiltrosYMostrar);
btnCalcularManual.addEventListener('click', aplicarFiltrosYMostrar);
btnLimpiarFechas.addEventListener('click', () => { 
    inputFechaDesde.value = ''; 
    inputFechaHasta.value = ''; 
    aplicarFiltrosYMostrar(); 
    showToast("🧹 Filtros de fecha limpiados", "success");
});