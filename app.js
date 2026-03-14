// Constantes
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

// Cargar inicial
document.addEventListener('DOMContentLoaded', () => {
    const guardados = localStorage.getItem('gastosMoneyFlow');
    if (guardados) misGastos = JSON.parse(guardados);
    aplicarFiltrosYMostrar();
});

// Toasts Inmortales
function showToast(message, type = "success") {
    let container = document.getElementById('toast-container');
    if(!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span><span class="material-icons" style="cursor:pointer" onclick="this.parentElement.remove()">close</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Control Popover
function mostrarPopover() { popoverAgregar.classList.remove('oculto'); }
function ocultarPopover() { 
    popoverAgregar.classList.add('oculto'); 
    formulario.reset(); 
    editandoID = null; 
}

btnAgregarSuperior.addEventListener('click', mostrarPopover);
iconoFlotanteAgregar.addEventListener('click', mostrarPopover);
btnCerrarPopover.addEventListener('click', ocultarPopover);

// Guardar/Editar Gasto
formulario.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Obtener valores
    const descripcion = inputDescripcion.value.trim();
    const categoria = inputCategoria.value;
    const monto = parseFloat(inputMonto.value);
    const fecha = inputFecha.value;
    const hoy = new Date().toISOString().split('T')[0];

    // Validación secuencial (orden de aparición arriba a abajo)
    if (!descripcion) {
        showToast("⚠️ Por favor, completa la descripción", "danger");
        inputDescripcion.focus();
        return;
    }
    if (!categoria) {
        showToast("⚠️ Por favor, selecciona una categoría", "danger");
        inputCategoria.focus();
        return;
    }
    if (isNaN(monto) || monto <= 0) {
        showToast("⚠️ El monto debe ser mayor a cero", "danger");
        inputMonto.focus();
        return;
    }
    if (!fecha) {
        showToast("⚠️ Por favor, selecciona una fecha", "danger");
        inputFecha.focus();
        return;
    }
    if (fecha > hoy) {
        showToast("🚫 No puedes registrar gastos en fechas futuras", "danger");
        inputFecha.focus();
        return;
    }

    // Si todo es correcto, guardamos
    if (editandoID) {
        misGastos = misGastos.map(g => g.id === editandoID ? { ...g, descripcion, categoria, monto, fecha } : g);
        showToast("✏️ Gasto actualizado correctamente", "success");
    } else {
        misGastos.push({ id: Date.now(), descripcion, categoria, monto, fecha });
        showToast("✅ Gasto guardado con éxito", "success");
    }

    localStorage.setItem('gastosMoneyFlow', JSON.stringify(misGastos));
    aplicarFiltrosYMostrar();
    ocultarPopover();
});
// Mostrar y Filtrar
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
            <td>${g.categoria}</td>
            <td style="color: #e0e0e0;">$ ${g.monto.toLocaleString('es-CO')}</td>
            <td class="iconos-acciones">
                <span class="material-icons" style="cursor:pointer; color:#28a745;" onclick="editarGasto(${g.id})">edit</span>
                <span class="material-icons" style="cursor:pointer; color:#dc3545;" onclick="borrarGasto(${g.id})">delete</span>
            </td>
        `;
        listaGastosTbody.appendChild(tr);
    });
    balanceMontoSpan.innerText = `$ ${total.toLocaleString('es-CO')}`;
}

// Acciones Tabla
window.editarGasto = function(id) {
    const gasto = misGastos.find(g => g.id === id);
    if (gasto) {
        inputDescripcion.value = gasto.descripcion;
        inputCategoria.value = gasto.categoria;
        inputMonto.value = gasto.monto;
        inputFecha.value = gasto.fecha;
        editandoID = id;
        mostrarPopover();
    }
};

window.borrarGasto = function(id) {
    if (confirm('¿Eliminar este registro?')) {
        misGastos = misGastos.filter(g => g.id !== id);
        localStorage.setItem('gastosMoneyFlow', JSON.stringify(misGastos));
        aplicarFiltrosYMostrar();
        showToast("🗑️ Eliminado", "success");
    }
};

// Eventos Filtros
selectFiltroCategoria.addEventListener('change', aplicarFiltrosYMostrar);
btnCalcularManual.addEventListener('click', aplicarFiltrosYMostrar);
btnLimpiarFechas.addEventListener('click', () => { 
    inputFechaDesde.value = ''; 
    inputFechaHasta.value = ''; 
    aplicarFiltrosYMostrar(); 
});