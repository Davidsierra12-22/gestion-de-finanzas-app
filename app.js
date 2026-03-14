// 1. Capturamos los elementos del DOM
const btnAgregarSuperior = document.getElementById('btn-agregar-gasto-superior');
const iconoFlotanteAgregar = document.getElementById('icono-flotante-agregar');
const popoverAgregar = document.getElementById('popover-agregar');
const btnCerrarPopover = document.getElementById('btn-cerrar-popover');
const formulario = document.getElementById('formulario-gastos');

// Inputs del formulario
const inputDescripcion = document.getElementById('descripcion-gasto');
const inputCategoria = document.getElementById('categoria-gasto');
const inputMonto = document.getElementById('monto-gasto');
const inputFecha = document.getElementById('fecha-gasto');

// Elementos de la tabla y balance
const listaGastosTbody = document.getElementById('lista-gastos-tbody');
const balanceMontoSpan = document.getElementById('balance-plata');

// Elementos de Filtros
const selectFiltroCategoria = document.getElementById('filtro-categoria');
const inputFechaDesde = document.getElementById('fecha-desde');
const inputFechaHasta = document.getElementById('fecha-hasta');
const btnCalcularManual = document.getElementById('btn-calcular-manual');
const btnLimpiarFechas = document.getElementById('btn-limpiar-fechas');

// Arreglo global de gastos
let misGastos = [];

// 2. Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    const gastosGuardados = localStorage.getItem('gastosMoneyFlow');
    if (gastosGuardados) {
        misGastos = JSON.parse(gastosGuardados);
    }
    // Al cargar, aplicamos filtros (que por defecto muestran todo)
    aplicarFiltrosYMostrar(); 
});

// 3. Control del Popover
function mostrarPopover() { popoverAgregar.classList.remove('hidden'); }
function ocultarPopover() { 
    popoverAgregar.classList.add('hidden'); 
    formulario.reset(); // Limpia los campos
}

btnAgregarSuperior.addEventListener('click', mostrarPopover);
iconoFlotanteAgregar.addEventListener('click', mostrarPopover);
btnCerrarPopover.addEventListener('click', ocultarPopover); // El botón de la X

// 4. Guardar un nuevo gasto (con TODAS las validaciones)
formulario.addEventListener('submit', function(evento) {
    evento.preventDefault();

    const descripcion = inputDescripcion.value.trim();
    const categoria = inputCategoria.value;
    const monto = parseFloat(inputMonto.value);
    const fecha = inputFecha.value;

    // Validación 1: Campos vacíos
    if (!descripcion || !categoria || !fecha || isNaN(monto)) {
        alert('Por favor, no dejes ningún campo vacío.');
        return;
    }

    // Validación 2: Monto coherente
    if (monto <= 0) {
        alert('El monto debe ser mayor a cero.');
        return;
    }

    // Validación 3: No fechas futuras
    // Obtenemos la fecha de hoy en formato 'YYYY-MM-DD' para compararla fácil
    const fechaHoy = new Date().toISOString().split('T')[0]; 
    if (fecha > fechaHoy) {
        alert('No puedes registrar gastos con fechas futuras.');
        return;
    }

    // Si pasa las validaciones, creamos el objeto
    const nuevoGasto = {
        id: Date.now(),
        fecha: fecha,
        descripcion: descripcion,
        categoria: categoria,
        monto: monto
    };

    misGastos.push(nuevoGasto);
    sincronizarLocalStorage();
    
    // Volvemos a pintar la tabla
    aplicarFiltrosYMostrar();
    ocultarPopover();
});

// 5. Función maestra que filtra, pinta la tabla y calcula el balance
function aplicarFiltrosYMostrar() {
    const categoriaSeleccionada = selectFiltroCategoria.value;
    const fechaDesde = inputFechaDesde.value;
    const fechaHasta = inputFechaHasta.value;

    // Empezamos asumiendo que vamos a mostrar todos los gastos
    let gastosAFiltrar = misGastos;

    // Filtro por Categoría
    if (categoriaSeleccionada !== 'todas') {
        gastosAFiltrar = gastosAFiltrar.filter(gasto => gasto.categoria === categoriaSeleccionada);
    }

    // Filtro Manual por Fechas (Rango)
    if (fechaDesde) {
        // Nos quedamos con los gastos cuya fecha sea mayor o igual a 'Desde'
        gastosAFiltrar = gastosAFiltrar.filter(gasto => gasto.fecha >= fechaDesde);
    }
    if (fechaHasta) {
        // Nos quedamos con los gastos cuya fecha sea menor o igual a 'Hasta'
        gastosAFiltrar = gastosAFiltrar.filter(gasto => gasto.fecha <= fechaHasta);
    }

    // Limpiamos la tabla
    listaGastosTbody.innerHTML = '';
    let sumatoriaTotal = 0;

    // Recorremos el arreglo ya filtrado para pintarlo
    gastosAFiltrar.forEach(function(gasto) {
        sumatoriaTotal += gasto.monto;

        // Para mostrar la categoría más bonita (ej: 'transporte' -> 'Transporte')
        const categoriaBonita = gasto.categoria.charAt(0).toUpperCase() + gasto.categoria.slice(1);
        const montoFormateado = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(gasto.monto);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${gasto.fecha}</td>
            <td>${gasto.descripcion}</td>
            <td>${categoriaBonita}</td>
            <td class="valor-monto">${montoFormateado}</td>
            <td class="iconos-acciones">
                <span class="material-icons icono-borrar" onclick="borrarGasto(${gasto.id})">delete</span>
            </td>
        `;
        listaGastosTbody.appendChild(tr);
    });

    // Actualizamos el Balance Total basado en los filtros aplicados
    const balanceFormateado = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(sumatoriaTotal);
    balanceMontoSpan.innerText = balanceFormateado;
}

// 6. Eventos para activar los filtros
// Cuando cambia la categoría en el select, se actualiza automáticamente
selectFiltroCategoria.addEventListener('change', aplicarFiltrosYMostrar);

// Cuando le damos al botón de "Calcular Balance Rango", aplica las fechas
btnCalcularManual.addEventListener('click', function() {
    if(!inputFechaDesde.value && !inputFechaHasta.value){
        alert("Selecciona al menos una fecha para filtrar.");
        return;
    }
    aplicarFiltrosYMostrar();
});

// Botón para limpiar las fechas y ver todo de nuevo
btnLimpiarFechas.addEventListener('click', function() {
    inputFechaDesde.value = '';
    inputFechaHasta.value = '';
    aplicarFiltrosYMostrar(); // Al limpiar, vuelve a mostrar todo (respetando la categoría si hay una)
});

// 7. Borrar gasto
function borrarGasto(idGasto) {
    if (confirm('¿Seguro que deseas eliminar este gasto?')) {
        misGastos = misGastos.filter(gasto => gasto.id !== idGasto);
        sincronizarLocalStorage();
        aplicarFiltrosYMostrar(); // Actualiza la vista
    }
}

// 8. Guardar en Storage
function sincronizarLocalStorage() {
    localStorage.setItem('gastosMoneyFlow', JSON.stringify(misGastos));
}