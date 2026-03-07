# Registro de Gastos Personales

Esta aplicación es una herramienta diseñada para la gestión integral de finanzas personales. Su objetivo es permitir a los usuarios tomar el control de su economía diaria, semanal o mensual mediante el registro y seguimiento de ingresos y gastos, facilitando la identificación de hábitos financieros a través de una interfaz funcional.

---

## Objetivos Principales

* **Centralización de Datos**: Registro de movimientos con descripción, categoría, monto y fecha.
* **Persistencia Local**: Uso de `localStorage` para evitar la pérdida de información al cerrar el navegador.
* **Análisis Rápido**: Herramientas de consulta, edición y filtrado dinámico.
* **Experiencia de Usuario (UX)**: Diseño fluido con validación de datos en tiempo real para prevenir errores contables.

---

## Requerimientos Funcionales y Escenarios de Uso

### RF-01: Gestión de Registros (CRUD)

El sistema permite crear, leer, actualizar y eliminar registros de movimientos financieros.

* **Escenario 1 (Validación de Nombre/Descripción)**: Si el usuario intenta registrar un movimiento con el campo de descripción vacío o menor a 3 caracteres, el sistema resalta el error, muestra una alerta informativa y bloquea el guardado.
* **Escenario 2 (Validación de Monto)**: Si se ingresa un monto menor o igual a cero o caracteres no numéricos, el sistema emite una alerta de monto inválido y detiene la operación.
* **Escenario 3 (Validación de Fecha)**: Si el usuario intenta registrar una fecha posterior al día actual, el sistema impide la selección o arroja una alerta de error.
* **Escenario 4 (Actualización)**: Al editar un registro existente, el sistema carga los datos actuales; si el usuario modifica un campo de forma inválida, se devuelve el error respectivo y no se actualiza el almacenamiento.
* **Escenario 5 (Eliminación)**: Al solicitar borrar un registro, el sistema solicita confirmación; tras ser aceptada, el dato se elimina permanentemente del listado y del almacenamiento local.

### RF-02: Categorización Dinámica

Cada registro debe estar estrictamente asociado a una categoría (Alimentación, Transporte, Salario, Entretenimiento, etc.).

* **Escenario 1 (Categoría no seleccionada)**: Si el usuario mantiene la opción por defecto en el selector de categorías al intentar guardar, el sistema devuelve una alerta indicando que la selección es obligatoria.
* **Escenario 2 (Asignación correcta)**: Al seleccionar una categoría válida, el sistema vincula el registro y permite el flujo normal de guardado.

### RF-03: Persistencia de Datos

Toda la información debe almacenarse en el `localStorage` del navegador.

* **Escenario 1 (Guardado exitoso)**: Tras validar los datos, el sistema guarda el registro en el navegador; al recargar la página, los datos se mantienen visibles.
* **Escenario 2 (Fallo de validación)**: Si algún campo falla en las reglas establecidas, el sistema no actualiza el `localStorage` para evitar registros corruptos o incompletos.

### RF-04: Motor de Filtrado

Capacidad de segmentar registros por categoría, rango de fechas o tipo de movimiento.

* **Escenario 1 (Filtrado por Categoría)**: El usuario selecciona una categoría específica; la tabla se actualiza para mostrar únicamente los registros coincidentes.
* **Escenario 2 (Filtrado por Rango)**: El usuario establece fechas de inicio y fin; el sistema oculta los registros fuera de ese periodo.
* **Escenario 3 (Filtrado por Tipo)**: Al filtrar por "Ingreso" o "Gasto", la interfaz despliega solo los movimientos que pertenecen a dicho tipo.

### RF-05: Balance Inteligente y Filtrado Temporal

Cálculo dinámico del balance basado en los registros visibles en pantalla.

* **Escenario 1 (Balance Global)**: Sin filtros aplicados, el sistema muestra la suma de todos los ingresos menos todos los gastos registrados.
* **Escenario 2 (Balance con Filtros)**: Si el usuario aplica un filtro (ej. una semana específica), el sistema recalcula automáticamente el balance mostrando solo el resultado del dinero movido en ese periodo.
* **Escenario 3 (Sin Resultados)**: Si un filtro no coincide con ningún registro, el sistema muestra un balance de 0 y una alerta de "Sin registros encontrados".

---

## Reglas de Validación del Formulario

| Campo | Regla de Validación | Feedback (UX) |
| --- | --- | --- |
| **Descripción** | Mínimo 3 caracteres, no vacío. | Borde rojo y mensaje de error. |
| **Categoría** | Selección válida obligatoria. | Bloqueo de envío si es la opción por defecto. |
| **Monto** | Números positivos $> 0$. | Advertencia y bloqueo de letras. |
| **Fecha** | No posterior al día actual. | Restricción en el selector de fecha. |
| **Tipo** | Gasto o Ingreso obligatorio. | Selección mediante controles de formulario. |

---

