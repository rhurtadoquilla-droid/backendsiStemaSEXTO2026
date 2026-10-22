import { getUserslist } from "./components/userlist.js";
import { api, getAccessToken, setAccessToken } from "./utils/api.js";

const app = document.getElementById("app");
let currentView = "home";
let navigationVersion = 0;
let productsCache = [];
let categoriesCache = [];
let locationsCache = [];
let resourceRecordsCache = {};
let authenticatedUser = null;

const roleViews = {
    ADMINISTRADOR: Object.keys({
        home: true, products: true, categories: true, users: true, empleados: true,
        proveedores: true, ubicaciones: true, movimientos: true, detalles: true,
        entradas: true, salidas: true, reports: true, settings: true,
    }),
    ALMACENERO: ["home", "products", "categories", "proveedores", "ubicaciones", "movimientos", "detalles", "entradas", "salidas", "reports"],
    SUPERVISOR: ["home", "products", "categories", "empleados", "proveedores", "ubicaciones", "movimientos", "detalles", "entradas", "salidas", "reports"],
};

function canView(view) {
    return Boolean(authenticatedUser && roleViews[authenticatedUser.rol]?.includes(view));
}

function canCreateResource(resource) {
    if (authenticatedUser?.rol === "ADMINISTRADOR") return true;
    return authenticatedUser?.rol === "ALMACENERO" && ["products", "productos", "movimientos", "detalle_movimientos"].includes(resource);
}

function canEditResource(resource) {
    return authenticatedUser?.rol === "ADMINISTRADOR"
        || (authenticatedUser?.rol === "ALMACENERO" && resource === "products");
}

function canDeleteResource() {
    return authenticatedUser?.rol === "ADMINISTRADOR";
}

function applyRoleToShell() {
    document.querySelectorAll("[data-view]").forEach((link) => {
        link.hidden = !canView(link.dataset.view);
    });

    const username = authenticatedUser?.username || "";
    const initials = username.split("@")[0].split(/[._\s-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "US";
    const name = document.querySelector("[data-current-user-name]");
    const role = document.querySelector("[data-current-user-role]");
    const badge = document.querySelector("[data-current-user-initials]");
    if (name) name.textContent = username;
    if (role) role.textContent = authenticatedUser?.rol || "";
    if (badge) badge.textContent = initials;
}

const resources = {
    products: {
        title: "Productos",
        endpoint: "/productos",
        columns: ["id", "codbarras", "nombre", "descripcion", "stock_actual", "stock_minimo", "precio_costo", "cod_categoria", "cod_ubicacion"],
    },
    categories: { title: "Categorías", endpoint: "/categorias", columns: ["id", "nombre", "descripcion"] },
    users: {
        title: "Usuarios",
        endpoint: "/usuarios",
        columns: ["id", "username", "rol", "estado", "cod_empleado"],
        fields: [
            { name: "username", label: "Usuario", required: true, max: 50 },
            { name: "password", label: "Contraseña", type: "password", required: true, editOptional: true },
            { name: "rol", label: "Rol", type: "select", required: true, options: [["ADMINISTRADOR", "Administrador"], ["ALMACENERO", "Almacenero"], ["SUPERVISOR", "Supervisor"]] },
            { name: "estado", label: "Estado", type: "select", required: true, options: [["1", "Activo"], ["0", "Inactivo"]] },
            { name: "cod_empleado", label: "Empleado", type: "relation", required: true, endpoint: "/empleados", optionLabel: ["nombre", "apellidos"] },
        ],
    },
    empleados: {
        title: "Empleados",
        endpoint: "/empleados",
        columns: ["id", "ci", "nombre", "apellidos", "cargo"],
        fields: [
            { name: "ci", label: "CI", required: true, max: 20 },
            { name: "nombre", label: "Nombre", required: true, max: 50 },
            { name: "apellidos", label: "Apellidos", required: true, max: 50 },
            { name: "cargo", label: "Cargo", required: true, max: 50 },
        ],
    },
    proveedores: {
        title: "Proveedores",
        endpoint: "/proveedores",
        columns: ["id", "nit_rut", "razon_social", "contacto_nombre", "direccion", "telefono", "email"],
        fields: [
            { name: "nit_rut", label: "NIT / RUT", required: true, max: 20 },
            { name: "razon_social", label: "Razón social", required: true, max: 100 },
            { name: "contacto_nombre", label: "Nombre de contacto", max: 50 },
            { name: "direccion", label: "Dirección", max: 250 },
            { name: "telefono", label: "Teléfono", max: 15 },
            { name: "email", label: "Correo", type: "email", max: 100 },
        ],
    },
    ubicaciones: {
        title: "Ubicaciones",
        endpoint: "/ubicaciones",
        columns: ["id", "zona_sector", "pasillo", "estante", "nivel_balda"],
        fields: [
            { name: "zona_sector", label: "Zona / sector", required: true, max: 50 },
            { name: "pasillo", label: "Pasillo", required: true, max: 10 },
            { name: "estante", label: "Estante", required: true, max: 10 },
            { name: "nivel_balda", label: "Nivel / balda", required: true, max: 10 },
        ],
    },
    movimientos: {
        title: "Movimientos",
        endpoint: "/movimientos",
        columns: ["id", "tipo_movimiento", "fecha_registro", "documento_referencia", "observaciones", "cod_empleado", "cod_proveedor"],
        fields: [
            { name: "tipo_movimiento", label: "Tipo de movimiento", type: "select", required: true, options: [["ENTRADA", "Entrada"], ["SALIDA", "Salida"], ["AJUSTE", "Ajuste"]] },
            { name: "fecha_registro", label: "Fecha", type: "datetime-local" },
            { name: "documento_referencia", label: "Documento de referencia", max: 50 },
            { name: "observaciones", label: "Observaciones", type: "textarea", max: 250 },
            { name: "cod_empleado", label: "Empleado", type: "relation", required: true, endpoint: "/empleados", optionLabel: ["nombre", "apellidos"] },
            { name: "cod_proveedor", label: "Proveedor", type: "relation", endpoint: "/proveedores", optionLabel: ["razon_social"] },
        ],
    },
    detalles: {
        title: "Detalle de movimientos",
        endpoint: "/detalle_movimientos",
        columns: ["id", "cod_movimiento", "cod_producto", "cantidad", "precio_historico"],
        fields: [
            { name: "cod_movimiento", label: "Movimiento", type: "relation", required: true, endpoint: "/movimientos", optionLabel: ["id", "tipo_movimiento", "fecha_registro"] },
            { name: "cod_producto", label: "Producto", type: "relation", required: true, endpoint: "/productos", optionLabel: ["nombre", "codbarras"] },
            { name: "cantidad", label: "Cantidad", type: "number", required: true, min: 1, step: 1, integer: true },
            { name: "precio_historico", label: "Precio histórico", type: "number", required: true, min: 0, step: "0.01" },
        ],
    },
};

const viewLabels = {
    home: "Dashboard",
    products: "Productos",
    categories: "Categorías",
    users: "Usuarios",
    empleados: "Empleados",
    proveedores: "Proveedores",
    ubicaciones: "Ubicaciones",
    detalles: "Detalle de movimientos",
    entradas: "Entradas",
    salidas: "Salidas",
    movimientos: "Movimientos",
    reports: "Reportes",
    settings: "Configuración",
    login: "Iniciar sesión",
};

const escapeHTML = (value) => String(value ?? "—").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]));

async function loadTemplate(name) {
    const response = await fetch(new URL(`./views/${name}.html`, import.meta.url));
    if (!response.ok) throw new Error(`No se pudo cargar la vista ${name}.`);
    return response.text();
}

async function loadHomeShell(version) {
    const template = await loadTemplate("home");
    if (version !== navigationVersion) return;
    app.innerHTML = template;
    const content = document.querySelector("#page-content");
    if (content) content.setAttribute("aria-live", "polite");
}

function setActiveNavigation(view) {
    document.querySelectorAll("[data-view]").forEach((link) => {
        const active = link.dataset.view === view;
        link.setAttribute("aria-current", active ? "page" : "false");
        if (link.closest("aside")) {
            link.classList.toggle("bg-white", active);
            link.classList.toggle("text-[#1E3A8A]", active);
            link.classList.toggle("shadow-lg", active);
            link.classList.toggle("font-semibold", active);
            link.classList.toggle("text-blue-100", !active);
            link.classList.toggle("font-medium", !active);
        } else if (link.closest("nav")) {
            link.classList.toggle("bg-[#1E3A8A]", active);
            link.classList.toggle("text-white", active);
            link.classList.toggle("bg-white", !active);
            link.classList.toggle("text-slate-600", !active);
        }
    });
}

function pageContainer() {
    return document.querySelector("#page-content");
}

function showError(container, error) {
    container.innerHTML = `<div class="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700" role="alert">
        <p class="font-semibold">No se pudieron cargar los datos.</p>
        <p class="mt-1">${escapeHTML(error.message || error)}</p>
        <button class="mt-3 rounded-lg bg-white px-3 py-2 font-semibold text-red-700 shadow-sm" data-action="reload">Reintentar</button>
    </div>`;
}

function renderShell(title, description, content, action = "") {
    return `<div class="space-y-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 class="text-2xl font-bold text-[#1E3A8A]">${escapeHTML(title)}</h2>
            <p class="mt-1 text-sm text-slate-500">${escapeHTML(description)}</p></div>
            ${action}
        </div>${content}
    </div>`;
}

function renderTable(records, config, view) {
    let rows = records;
    if (view === "entradas") rows = records.filter((row) => String(row.tipo_movimiento || "").toUpperCase() === "ENTRADA");
    if (view === "salidas") rows = records.filter((row) => String(row.tipo_movimiento || "").toUpperCase() === "SALIDA");
    const resourceView = view === "entradas" || view === "salidas" ? "movimientos" : view;

    const columns = config.columns?.length
        ? config.columns
        : Object.keys(rows[0] || {}).filter((key) => !/password|hash|token/i.test(key));
    const headings = columns.map((column) => `<th class="whitespace-nowrap px-5 py-4 font-semibold">${escapeHTML(column.replaceAll("_", " "))}</th>`).join("");
    const body = rows.map((record) => {
        const cells = columns.map((column) => `<td class="whitespace-nowrap px-5 py-4 text-slate-600">${escapeHTML(record[column])}</td>`).join("");
        const actions = view === "products" && (canEditResource(view) || canDeleteResource()) ? `<td class="whitespace-nowrap px-5 py-4 text-right">
            ${canEditResource(view) ? `<button class="rounded-lg px-3 py-2 font-semibold text-blue-700 hover:bg-blue-50" data-action="edit-product" data-id="${escapeHTML(record.id)}">Editar</button>` : ""}
            ${canDeleteResource() ? `<button class="rounded-lg px-3 py-2 font-semibold text-red-600 hover:bg-red-50" data-action="delete-product" data-id="${escapeHTML(record.id)}">Eliminar</button>` : ""}
        </td>` : view === "categories" && canDeleteResource() ? `<td class="whitespace-nowrap px-5 py-4 text-right">
            <button class="rounded-lg px-3 py-2 font-semibold text-blue-700 hover:bg-blue-50" data-action="edit-category" data-id="${escapeHTML(record.id)}">Editar</button>
            <button class="rounded-lg px-3 py-2 font-semibold text-red-600 hover:bg-red-50" data-action="delete-category" data-id="${escapeHTML(record.id)}">Eliminar</button>
        </td>` : config.fields && (canEditResource(resourceView) || canDeleteResource()) ? `<td class="whitespace-nowrap px-5 py-4 text-right">
            ${canEditResource(resourceView) ? `<button class="rounded-lg px-3 py-2 font-semibold text-blue-700 hover:bg-blue-50" data-action="edit-resource" data-resource="${escapeHTML(resourceView)}" data-id="${escapeHTML(record.id)}">Editar</button>` : ""}
            ${canDeleteResource() ? `<button class="rounded-lg px-3 py-2 font-semibold text-red-600 hover:bg-red-50" data-action="delete-resource" data-resource="${escapeHTML(resourceView)}" data-id="${escapeHTML(record.id)}">Eliminar</button>` : ""}
        </td>` : "";
        return `<tr class="border-t border-slate-100 hover:bg-slate-50" data-table-row>${cells}${actions}</tr>`;
    }).join("");

    const hasActions = (view === "products" && (canEditResource(view) || canDeleteResource()))
        || (view === "categories" && canDeleteResource())
        || (Boolean(config.fields) && (canEditResource(resourceView) || canDeleteResource()));
    const empty = `<tr><td colspan="${Math.max(columns.length + (hasActions ? 1 : 0), 1)}" class="px-5 py-10 text-center text-slate-500">No hay registros para mostrar.</td></tr>`;
    return `<div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table class="min-w-full text-left text-sm"><thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>${headings}${hasActions ? '<th class="px-5 py-4 text-right">Acciones</th>' : ""}</tr></thead>
        <tbody id="resource-table-body">${body || empty}</tbody></table></div>
        <p class="text-sm text-slate-500">${rows.length} registro${rows.length === 1 ? "" : "s"}</p>`;
}

async function fetchResource(view) {
    if (view === "users") return getUserslist();
    const resource = resources[view] || resources.movimientos;
    const result = await api.get(resource.endpoint);
    return Array.isArray(result) ? result : [];
}

async function renderResource(view, version) {
    const container = document.querySelector("#resource-content") || pageContainer();
    const config = resources[view] || (view === "entradas" || view === "salidas" ? resources.movimientos : null);
    if (!container || !config) return;
    container.innerHTML = `<div class="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">Cargando ${escapeHTML(config.title.toLowerCase())}…</div>`;

    try {
        const records = await fetchResource(view);
        if (version !== navigationVersion) return;
        resourceRecordsCache[view === "entradas" || view === "salidas" ? "movimientos" : view] = records;
        if (view === "products") productsCache = records;
        if (view === "categories") categoriesCache = records;
        const action = view === "products" && canCreateResource(view)
            ? '<button class="rounded-xl bg-[#1E3A8A] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#3B82F6]" data-action="create-product">+ Nuevo producto</button>'
            : view === "categories" && canCreateResource(view)
            ? '<button class="rounded-xl bg-[#1E3A8A] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#3B82F6]" data-action="create-category">+ Nueva categoría</button>'
            : config.fields && canCreateResource(view === "entradas" || view === "salidas" ? "movimientos" : view)
            ? `<button class="rounded-xl bg-[#1E3A8A] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#3B82F6]" data-action="create-resource" data-resource="${escapeHTML(view === "entradas" || view === "salidas" ? "movimientos" : view)}" ${view === "entradas" || view === "salidas" ? `data-movement-type="${view === "entradas" ? "ENTRADA" : "SALIDA"}"` : ""}>+ ${view === "users" ? "Nuevo usuario" : "Nuevo registro"}</button>`
            : '<button class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50" data-action="reload">Actualizar</button>';
        const description = view === "products"
            ? authenticatedUser?.rol === "ADMINISTRADOR" ? "Consulta, busca, registra, edita y elimina productos del inventario."
                : authenticatedUser?.rol === "ALMACENERO" ? "Consulta, registra y edita productos del inventario."
                    : "Consulta productos y revisa las existencias del inventario."
            : view === "entradas" ? "Movimientos de inventario registrados como entradas."
            : view === "salidas" ? "Movimientos de inventario registrados como salidas."
            : view === "categories" ? "Administra categorías usadas para organizar y registrar productos."
            : "Información cargada desde la API del inventario.";
        let content = `<label class="block"><span class="sr-only">Buscar en ${escapeHTML(config.title)}</span>
            <input data-table-search type="search" placeholder="Buscar…" class="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"></label>
            <div class="mt-4">${renderTable(records, config, view)}</div>`;
        if (view === "products") content += '<div id="product-dialog-container"></div>';
        if (view === "categories") content += '<div id="category-dialog-container"></div>';
        if (config.fields) content += '<div id="resource-dialog-container"></div>';
        container.innerHTML = renderShell(viewLabels[view] || config.title, description, content, action);
        if (view === "products") {
            try {
                [categoriesCache, locationsCache] = await Promise.all([api.get("/categorias"), api.get("/ubicaciones")]);
                if (version !== navigationVersion) return;
                if (!Array.isArray(categoriesCache)) categoriesCache = [];
                if (!Array.isArray(locationsCache)) locationsCache = [];
            } catch {
                categoriesCache = [];
                locationsCache = [];
            }
        }
    } catch (error) {
        showError(container, error);
    }
}

function applyTableSearch(value) {
    const query = value.trim().toLocaleLowerCase();
    document.querySelectorAll("[data-table-row]").forEach((row) => {
        row.hidden = !row.textContent.toLocaleLowerCase().includes(query);
    });
}

async function renderDashboard(version) {
    try {
        const [products, movements, categories] = await Promise.all([api.get("/productos"), api.get("/movimientos"), api.get("/categorias")]);
        if (version !== navigationVersion) return;
        const productRows = Array.isArray(products) ? products : [];
        const movementRows = Array.isArray(movements) ? movements : [];
        const categoryRows = Array.isArray(categories) ? categories : [];
        const statValues = {
            products: productRows.length,
            stock: productRows.reduce((sum, product) => sum + Number(product.stock_actual || 0), 0),
            entradas: movementRows.filter((movement) => String(movement.tipo_movimiento).toUpperCase() === "ENTRADA").length,
            salidas: movementRows.filter((movement) => String(movement.tipo_movimiento).toUpperCase() === "SALIDA").length,
        };
        Object.entries(statValues).forEach(([key, value]) => {
            const target = document.querySelector(`[data-stat="${key}"]`);
            if (target) target.textContent = value.toLocaleString("es");
        });

        const monthChart = document.querySelector("#dashboard-month-bars");
        if (monthChart) {
            const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
            const year = new Date().getFullYear();
            const monthly = monthNames.map((name, month) => ({ name, entradas: 0, salidas: 0, month }));
            movementRows.forEach((movement) => {
                const date = new Date(movement.fecha_registro);
                const month = monthly[date.getMonth()];
                if (!Number.isNaN(date.getTime()) && date.getFullYear() === year && month) {
                    const type = String(movement.tipo_movimiento || "").toUpperCase();
                    if (type === "ENTRADA") month.entradas += 1;
                    if (type === "SALIDA") month.salidas += 1;
                }
            });
            const maximum = Math.max(1, ...monthly.flatMap((month) => [month.entradas, month.salidas]));
            monthChart.innerHTML = monthly.map((month) => `<div class="flex h-full min-w-10 flex-1 flex-col items-center justify-end gap-2">
                <div class="flex h-full w-full items-end justify-center gap-1"><span title="${month.entradas} entradas" class="w-2/5 rounded-t bg-[#3B82F6]" style="height:${month.entradas ? Math.max(4, month.entradas / maximum * 100) : 0}%"></span>
                <span title="${month.salidas} salidas" class="w-2/5 rounded-t bg-slate-300" style="height:${month.salidas ? Math.max(4, month.salidas / maximum * 100) : 0}%"></span></div><span class="text-xs font-medium text-slate-500">${month.name}</span></div>`).join("");
        }

        const distribution = categoryRows.map((category) => ({
            name: category.nombre,
            count: productRows.filter((product) => String(product.cod_categoria) === String(category.id)).length,
        })).filter((category) => category.count > 0);
        const categoryCount = document.querySelector("[data-dashboard-category-count]");
        if (categoryCount) categoryCount.textContent = String(categoryRows.length);
        const categoryList = document.querySelector("[data-dashboard-categories]");
        const colors = ["#1E3A8A", "#3B82F6", "#93C5FD", "#CBD5E1", "#10B981", "#F59E0B"];
        if (categoryList) categoryList.innerHTML = distribution.map((category, index) => `<div class="flex items-center justify-between"><span class="flex items-center gap-2 text-slate-600"><span class="h-3 w-3 rounded-full" style="background:${colors[index % colors.length]}"></span>${escapeHTML(category.name)}</span><span class="font-semibold">${productRows.length ? Math.round(category.count / productRows.length * 100) : 0}%</span></div>`).join("") || '<p class="text-sm text-slate-500">Aún no hay productos categorizados.</p>';
        const donut = document.querySelector("#category-donut");
        if (donut) {
            let offset = 0;
            const stops = distribution.map((category, index) => {
                const start = offset;
                offset += category.count / Math.max(productRows.length, 1) * 100;
                return `${colors[index % colors.length]} ${start}% ${offset}%`;
            });
            donut.style.background = stops.length ? `conic-gradient(${stops.join(",")})` : "#E2E8F0";
        }

        const recentBody = document.querySelector("#recent-movements");
        if (recentBody) {
            const recent = movementRows.slice(-5).reverse();
            recentBody.innerHTML = recent.map((movement) => `<tr class="border-t border-slate-100 hover:bg-blue-50/70">
                <td class="px-5 py-4 text-slate-500">${escapeHTML(movement.fecha_registro)}</td>
                <td class="px-5 py-4 font-semibold">${escapeHTML(movement.tipo_movimiento)}</td>
                <td class="px-5 py-4">${escapeHTML(movement.documento_referencia)}</td>
                <td class="px-5 py-4 text-slate-600">${escapeHTML(movement.observaciones)}</td></tr>`).join("") || '<tr><td colspan="4" class="px-5 py-8 text-center text-slate-500">No hay movimientos registrados.</td></tr>';
        }

        const lowStock = productRows.filter((product) => Number(product.stock_actual) <= Number(product.stock_minimo));
        const alertCount = document.querySelector("[data-dashboard-low-count]");
        if (alertCount) alertCount.textContent = `${lowStock.length} alertas`;
        const lowStockList = document.querySelector("[data-dashboard-low-stock]");
        if (lowStockList) {
            lowStockList.innerHTML = lowStock.slice(0, 5).map((product) => `<div class="rounded-2xl border border-red-100 bg-red-50 p-4">
                <div class="flex items-center justify-between gap-3"><p class="font-semibold text-slate-900">${escapeHTML(product.nombre)}</p>
                <span class="text-sm font-bold text-red-600">${escapeHTML(product.stock_actual)} uds</span></div>
                <p class="mt-1 text-xs text-slate-500">Mínimo: ${escapeHTML(product.stock_minimo)}</p></div>`).join("") || '<p class="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">No hay productos con stock bajo.</p>';
        }
    } catch (error) {
        if (version !== navigationVersion) return;
        const target = document.querySelector("[data-stat='products']");
        if (target) target.textContent = "—";
        const section = document.querySelector("#page-content");
        if (section) section.insertAdjacentHTML("afterbegin", `<p class="rounded-xl bg-amber-50 p-4 text-sm text-amber-800" role="status">No se pudo conectar con la API: ${escapeHTML(error.message)}</p>`);
    }
}

async function renderReports(version) {
    const container = pageContainer();
    container.innerHTML = '<div class="rounded-2xl bg-white p-6 text-slate-500">Preparando reporte…</div>';
    try {
        const [products, movements] = await Promise.all([api.get("/productos"), api.get("/movimientos")]);
        if (version !== navigationVersion) return;
        const productRows = Array.isArray(products) ? products : [];
        const movementRows = Array.isArray(movements) ? movements : [];
        const low = productRows.filter((product) => Number(product.stock_actual) <= Number(product.stock_minimo)).length;
        const movementCounts = ["ENTRADA", "SALIDA", "AJUSTE"].map((type) => [
            type === "ENTRADA" ? "Entradas" : type === "SALIDA" ? "Salidas" : "Ajustes",
            movementRows.filter((row) => String(row.tipo_movimiento).toUpperCase() === type).length,
        ]);
        container.innerHTML = renderShell("Reportes", "Seguimiento de existencias, alertas y movimientos del inventario.", `<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            ${[["Productos", productRows.length], ["Unidades en stock", productRows.reduce((sum, product) => sum + Number(product.stock_actual || 0), 0)], ...movementCounts, ["Stock bajo", low]].map(([label, value]) => `<article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p class="text-sm text-slate-500">${label}</p><p class="mt-2 text-3xl font-bold text-[#1E3A8A]">${Number(value).toLocaleString("es")}</p></article>`).join("")}
            </div><button class="rounded-xl bg-[#1E3A8A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#3B82F6]" data-action="export-products">Descargar productos CSV</button>`);
    } catch (error) {
        if (version !== navigationVersion) return;
        showError(container, error);
    }
}

async function renderSettings() {
    const container = pageContainer();
    container.innerHTML = renderShell("Configuración", "Comprueba la conexión que usa este frontend.", '<div class="rounded-2xl border border-slate-200 bg-white p-6"><p id="api-status" class="text-slate-600">Estado de API: sin comprobar</p><button class="mt-4 rounded-xl bg-[#1E3A8A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#3B82F6]" data-action="check-api">Probar conexión</button></div>');
}

async function renderView(view) {
    if (!viewLabels[view]) return;
    if (view === "login" && authenticatedUser) {
        await renderView("home");
        return;
    }
    if (view !== "login" && (!authenticatedUser || !roleViews[authenticatedUser.rol])) {
        authenticatedUser = null;
        setAccessToken(null);
        await renderView("login");
        return;
    }
    if (view !== "login" && !canView(view)) {
        await renderView("home");
        return;
    }
    const version = ++navigationVersion;
    currentView = view;
    if (view === "login") {
        try {
            const template = await loadTemplate("login");
            if (version !== navigationVersion) return;
            app.innerHTML = template;
        } catch (error) {
            if (version !== navigationVersion) return;
            app.innerHTML = `<p class="m-6 rounded-xl bg-red-50 p-4 text-red-700" role="alert">No se pudo cargar el inicio de sesión: ${escapeHTML(error.message)}</p>`;
        }
        return;
    }
    if (view === "home") {
        await loadHomeShell(version);
        if (version !== navigationVersion) return;
        applyRoleToShell();
        setActiveNavigation(view);
        await renderDashboard(version);
        return;
    }
    if (!pageContainer()) await loadHomeShell(version);
    if (version !== navigationVersion) return;
    setActiveNavigation(view);
    if (view === "reports") return renderReports(version);
    if (view === "settings") return renderSettings();

    const templateName = view === "products" ? "producto" : view === "users" ? "user" : null;
    if (templateName) {
        try {
            const template = await loadTemplate(templateName);
            if (version !== navigationVersion) return;
            pageContainer().innerHTML = template;
        } catch (error) {
            if (version !== navigationVersion) return;
            showError(pageContainer(), error);
            return;
        }
    } else {
        pageContainer().innerHTML = '<div id="resource-content"></div>';
    }
    await renderResource(view, version);
}

function showToast(message, isError = false) {
    document.querySelector("#app-toast")?.remove();
    const toast = document.createElement("div");
    toast.id = "app-toast";
    toast.className = `fixed bottom-5 right-5 z-50 max-w-sm rounded-xl px-5 py-4 text-sm font-semibold text-white shadow-xl ${isError ? "bg-red-600" : "bg-emerald-600"}`;
    toast.textContent = message;
    document.body.append(toast);
    window.setTimeout(() => toast.remove(), 3500);
}

function productFormMarkup(product = {}) {
    const categories = categoriesCache.map((category) => `<option value="${escapeHTML(category.id)}" ${String(product.cod_categoria) === String(category.id) ? "selected" : ""}>${escapeHTML(category.nombre)}</option>`).join("");
    const locations = locationsCache.map((location) => `<option value="${escapeHTML(location.id)}" ${String(product.cod_ubicacion) === String(location.id) ? "selected" : ""}>${escapeHTML([location.zona_sector, location.pasillo, location.estante, location.nivel_balda].filter(Boolean).join(" · "))}</option>`).join("");
    const field = (name, label, type = "text", required = true, value = "") => `<label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">${label}</span><input class="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" name="${name}" type="${type}" value="${escapeHTML(value)}" ${required ? "required" : ""} ${type === "number" ? 'min="0" step="any"' : ""}></label>`;
    return `<dialog id="product-dialog" class="w-[min(42rem,calc(100%-2rem))] rounded-3xl p-0 shadow-2xl backdrop:bg-slate-950/50">
        <form data-product-form class="space-y-5 p-6 sm:p-8"><div class="flex items-start justify-between"><div><h3 class="text-xl font-bold text-[#1E3A8A]">${product.id ? "Editar producto" : "Nuevo producto"}</h3><p class="mt-1 text-sm text-slate-500">Completa los datos requeridos.</p></div><button type="button" class="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100" data-action="close-dialog" aria-label="Cerrar">✕</button></div>
        <input type="hidden" name="id" value="${escapeHTML(product.id || "")}"><div class="grid gap-4 sm:grid-cols-2">${field("codbarras", "Código de barras", "text", true, product.codbarras)}${field("nombre", "Nombre", "text", true, product.nombre)}
        <label class="block sm:col-span-2"><span class="mb-1 block text-sm font-medium text-slate-700">Descripción</span><textarea class="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" name="descripcion" required maxlength="100">${escapeHTML(product.descripcion || "")}</textarea></label>
        ${field("stock_actual", "Stock actual", "number", true, product.stock_actual ?? 0)}${field("stock_minimo", "Stock mínimo", "number", true, product.stock_minimo ?? 0)}${field("precio_costo", "Precio de costo", "number", true, product.precio_costo ?? 0)}
        <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Categoría</span><select class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" name="cod_categoria" required><option value="">Selecciona una categoría</option>${categories}</select></label>
        <label class="block sm:col-span-2"><span class="mb-1 block text-sm font-medium text-slate-700">Ubicación (opcional)</span><select class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5" name="cod_ubicacion"><option value="">Sin ubicación</option>${locations}</select></label></div>
        <div class="flex justify-end gap-3"><button type="button" data-action="close-dialog" class="rounded-xl border border-slate-200 px-4 py-2.5 font-semibold text-slate-600">Cancelar</button><button class="rounded-xl bg-[#1E3A8A] px-5 py-2.5 font-semibold text-white hover:bg-[#3B82F6]" type="submit">Guardar</button></div></form></dialog>`;
}

function openProductDialog(product = {}) {
    const host = document.querySelector("#product-dialog-container");
    if (!host) return;
    host.innerHTML = productFormMarkup(product);
    document.querySelector("#product-dialog").showModal();
}

function openCategoryDialog(category = {}) {
    const host = document.querySelector("#category-dialog-container");
    if (!host) return;
    host.innerHTML = `<dialog id="category-dialog" class="w-[min(36rem,calc(100%-2rem))] rounded-3xl p-0 shadow-2xl backdrop:bg-slate-950/50">
        <form data-category-form class="space-y-5 p-6 sm:p-8"><div class="flex items-start justify-between"><div><h3 class="text-xl font-bold text-[#1E3A8A]">${category.id ? "Editar categoría" : "Nueva categoría"}</h3><p class="mt-1 text-sm text-slate-500">Las categorías se usan al registrar productos.</p></div><button type="button" class="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100" data-action="close-dialog" aria-label="Cerrar">✕</button></div>
        <input type="hidden" name="id" value="${escapeHTML(category.id || "")}"/><label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Nombre</span><input class="w-full rounded-xl border border-slate-200 px-3 py-2.5" name="nombre" maxlength="50" value="${escapeHTML(category.nombre || "")}" required></label>
        <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Descripción (opcional)</span><textarea class="w-full rounded-xl border border-slate-200 px-3 py-2.5" name="descripcion" maxlength="250">${escapeHTML(category.descripcion || "")}</textarea></label>
        <div class="flex justify-end gap-3"><button type="button" data-action="close-dialog" class="rounded-xl border border-slate-200 px-4 py-2.5 font-semibold text-slate-600">Cancelar</button><button class="rounded-xl bg-[#1E3A8A] px-5 py-2.5 font-semibold text-white hover:bg-[#3B82F6]" type="submit">Guardar categoría</button></div></form></dialog>`;
    document.querySelector("#category-dialog").showModal();
}

async function openResourceDialog(view, record = {}) {
    const config = resources[view];
    const host = document.querySelector("#resource-dialog-container");
    if (!config?.fields || !host) return;
    const recordLabel = view === "users" ? "usuario" : config.title.toLowerCase();

    const relationData = new Map();
    const relations = config.fields.filter((field) => field.type === "relation"
        && !(view === "movimientos" && field.name === "cod_empleado" && authenticatedUser?.rol === "ALMACENERO"));
    await Promise.all(relations.map(async (field) => {
        const rows = await api.get(field.endpoint);
        if (!Array.isArray(rows)) throw new Error(`No se pudieron cargar las opciones de ${field.label.toLowerCase()}.`);
        relationData.set(field.name, rows);
    }));
    if (view === "users" && !(relationData.get("cod_empleado") || []).length) {
        throw new Error("No hay empleados disponibles. Registra un empleado antes de crear un usuario.");
    }

    const renderField = (field) => {
        if (view === "movimientos" && field.name === "cod_empleado" && authenticatedUser?.rol === "ALMACENERO") return "";
        const value = field.name === "tipo_movimiento" && record.movementType
            ? record.movementType
            : record[field.name] ?? "";
        const required = field.required && !(field.editOptional && record.id);
        const common = `class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" name="${escapeHTML(field.name)}" ${required ? "required" : ""}`;
        if (field.type === "relation") {
            const options = relationData.get(field.name) || [];
            const labelFor = (row) => field.optionLabel.map((key) => row[key]).filter(Boolean).join(" · ");
            return `<label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">${escapeHTML(field.label)}</span>
                <select ${common}><option value="">${required ? "Selecciona…" : "Ninguno"}</option>${options.map((row) => `<option value="${escapeHTML(row.id)}" ${String(value) === String(row.id) ? "selected" : ""}>${escapeHTML(labelFor(row))}</option>`).join("")}</select></label>`;
        }
        if (field.type === "select") {
            return `<label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">${escapeHTML(field.label)}</span>
                <select ${common}><option value="">Selecciona…</option>${field.options.map(([optionValue, label]) => `<option value="${escapeHTML(optionValue)}" ${String(value) === optionValue ? "selected" : ""}>${escapeHTML(label)}</option>`).join("")}</select></label>`;
        }
        if (field.type === "textarea") {
            return `<label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">${escapeHTML(field.label)}</span><textarea ${common} maxlength="${field.max || 250}">${escapeHTML(value)}</textarea></label>`;
        }
        const inputValue = field.type === "datetime-local" ? String(value).replace(" ", "T").slice(0, 16) : value;
        const extra = [
            field.max ? `maxlength="${field.max}"` : "",
            field.min !== undefined ? `min="${field.min}"` : "",
            field.step ? `step="${field.step}"` : "",
            field.editOptional && record.id ? 'placeholder="Deja vacío para conservar la contraseña actual"' : "",
        ].filter(Boolean).join(" ");
        return `<label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">${escapeHTML(field.label)}</span><input ${common} type="${field.type || "text"}" value="${field.type === "password" ? "" : escapeHTML(inputValue)}" ${extra}></label>`;
    };

    host.innerHTML = `<dialog id="resource-dialog" class="w-[min(44rem,calc(100%-2rem))] rounded-3xl p-0 shadow-2xl backdrop:bg-slate-950/50">
        <form data-resource-form data-resource="${escapeHTML(view)}" data-id="${escapeHTML(record.id || "")}" class="space-y-5 p-6 sm:p-8">
            <div class="flex items-start justify-between"><div><h3 class="text-xl font-bold text-[#1E3A8A]">${record.id ? "Editar" : "Nuevo"} ${escapeHTML(recordLabel)}</h3><p class="mt-1 text-sm text-slate-500">Completa los campos del registro.</p></div>
            <button type="button" class="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100" data-action="close-dialog" aria-label="Cerrar">✕</button></div>
            <div class="grid gap-4 sm:grid-cols-2">${config.fields.map(renderField).join("")}</div>
            <div class="flex justify-end gap-3"><button type="button" data-action="close-dialog" class="rounded-xl border border-slate-200 px-4 py-2.5 font-semibold text-slate-600">Cancelar</button>
            <button class="rounded-xl bg-[#1E3A8A] px-5 py-2.5 font-semibold text-white hover:bg-[#3B82F6]" type="submit">Guardar</button></div>
        </form></dialog>`;
    document.querySelector("#resource-dialog").showModal();
}

async function exportProducts() {
    const records = await api.get("/productos");
    const rows = Array.isArray(records) ? records : [];
    const columns = resources.products.columns;
    const csv = [columns.join(","), ...rows.map((row) => columns.map((column) => `"${String(row[column] ?? "").replaceAll('"', '""')}"`).join(","))].join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "productos-inventario.csv";
    link.click();
    URL.revokeObjectURL(url);
}

document.addEventListener("click", async (event) => {
    const viewLink = event.target.closest("[data-view]");
    if (viewLink) {
        event.preventDefault();
        await renderView(viewLink.dataset.view);
        return;
    }

    const button = event.target.closest("[data-action]");
    if (!button) return;
    const { action, id } = button.dataset;
    try {
        if (action === "reload") await renderView(currentView);
        if (action === "create-product") openProductDialog();
        if (action === "edit-product") openProductDialog(productsCache.find((product) => String(product.id) === String(id)) || {});
        if (action === "create-category") openCategoryDialog();
        if (action === "edit-category") openCategoryDialog(categoriesCache.find((category) => String(category.id) === String(id)) || {});
        if (action === "create-resource") {
            const preset = button.dataset.movementType ? { movementType: button.dataset.movementType } : {};
            await openResourceDialog(button.dataset.resource, preset);
        }
        if (action === "edit-resource") {
            const resource = button.dataset.resource;
            const record = (resourceRecordsCache[resource] || []).find((row) => String(row.id) === String(id));
            if (!record) throw new Error("No se encontró el registro que quieres editar.");
            await openResourceDialog(resource, record);
        }
        if (action === "close-dialog") button.closest("dialog")?.close();
        if (action === "delete-product" && window.confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) {
            const response = await api.delete(`/productos/${encodeURIComponent(id)}`);
            if (response?.estado === "false") throw new Error(response.message || "No se pudo eliminar el producto.");
            showToast("Producto eliminado.");
            await renderView("products");
        }
        if (action === "delete-category" && window.confirm("¿Eliminar esta categoría? No se podrá borrar si tiene productos asociados.")) {
            const response = await api.delete(`/categorias/${encodeURIComponent(id)}`);
            if (response?.estado === "false") throw new Error(response.message || "No se pudo eliminar la categoría.");
            showToast("Categoría eliminada.");
            await renderView("categories");
        }
        if (action === "delete-resource" && window.confirm("¿Eliminar este registro? Si tiene registros relacionados, la operación será bloqueada.")) {
            const resource = button.dataset.resource;
            const response = await api.delete(`${resources[resource].endpoint}/${encodeURIComponent(id)}`);
            if (response?.estado === "false") throw new Error(response.message || "No se pudo eliminar el registro.");
            showToast("Registro eliminado.");
            await renderView(resource);
        }
        if (action === "export-products") await exportProducts();
        if (action === "check-api") {
            await api.get("/productos");
            const status = document.querySelector("#api-status");
            if (status) status.textContent = "Estado de API: conexión correcta";
        }
        if (action === "logout") {
            try {
                await api.post("/auth/logout", {});
            } finally {
                setAccessToken(null);
                authenticatedUser = null;
                await renderView("login");
            }
        }
    } catch (error) {
        showToast(error.message || "Ocurrió un error.", true);
    }
});

document.addEventListener("submit", async (event) => {
    const loginForm = event.target.closest("#login-form");
    if (loginForm) {
        event.preventDefault();
        const formData = new FormData(loginForm);
        const errorMessage = document.querySelector("#login-error");
        if (errorMessage) errorMessage.hidden = true;
        try {
            const result = await api.post("/auth/login", {
                username: String(formData.get("username") || "").trim(),
                password: String(formData.get("password") || ""),
            });
            setAccessToken(result.token);
            authenticatedUser = result.user;
            await renderView("home");
        } catch (error) {
            if (errorMessage) {
                errorMessage.textContent = error.message || "No se pudo iniciar sesión.";
                errorMessage.hidden = false;
            }
        }
        return;
    }

    const resourceForm = event.target.closest("[data-resource-form]");
    if (resourceForm) {
        event.preventDefault();
        const resource = resourceForm.dataset.resource;
        const config = resources[resource];
        const id = resourceForm.dataset.id;
        const formData = new FormData(resourceForm);
        const payload = Object.fromEntries(config.fields.map((field) => [field.name, formData.get(field.name)]));
        if (resource === "users" && id && !payload.password) delete payload.password;
        if (resource === "movimientos" && authenticatedUser?.rol === "ALMACENERO") {
            payload.cod_empleado = authenticatedUser.cod_empleado;
        }
        if (payload.fecha_registro) payload.fecha_registro = payload.fecha_registro.replace("T", " ");
        try {
            const response = id
                ? await api.put(`${config.endpoint}/${encodeURIComponent(id)}`, payload)
                : await api.post(config.endpoint, payload);
            if (response?.estado === "false") throw new Error(response.message || "No se pudo guardar el registro.");
            document.querySelector("#resource-dialog")?.close();
            showToast(id ? "Registro actualizado." : "Registro creado.");
            await renderView(resource);
        } catch (error) {
            showToast(error.message || "No se pudo guardar el registro.", true);
        }
        return;
    }

    const categoryForm = event.target.closest("[data-category-form]");
    if (categoryForm) {
        event.preventDefault();
        const formData = new FormData(categoryForm);
        const id = formData.get("id");
        const payload = { nombre: formData.get("nombre").trim(), descripcion: formData.get("descripcion").trim() };
        try {
            const response = id ? await api.put(`/categorias/${encodeURIComponent(id)}`, payload) : await api.post("/categorias", payload);
            if (response?.estado === "false") throw new Error(response.message || "No se pudo guardar la categoría.");
            document.querySelector("#category-dialog")?.close();
            showToast(id ? "Categoría actualizada." : "Categoría creada.");
            await renderView("categories");
        } catch (error) {
            showToast(error.message || "No se pudo guardar la categoría.", true);
        }
        return;
    }

    const form = event.target.closest("[data-product-form]");
    if (!form) return;
    event.preventDefault();
    const formData = new FormData(form);
    const id = formData.get("id");
    const payload = Object.fromEntries(["codbarras", "nombre", "descripcion", "stock_actual", "stock_minimo", "precio_costo", "cod_categoria", "cod_ubicacion"].map((key) => [key, formData.get(key)]));
    ["stock_actual", "stock_minimo", "precio_costo", "cod_categoria"].forEach((key) => { payload[key] = Number(payload[key]); });
    payload.cod_ubicacion = payload.cod_ubicacion ? Number(payload.cod_ubicacion) : null;
    try {
        const response = id ? await api.put(`/productos/${encodeURIComponent(id)}`, payload) : await api.post("/productos", payload);
        if (response?.estado === "false" || response?.status === "error conversion") throw new Error(response.message || "La API rechazó los datos del producto.");
        document.querySelector("#product-dialog")?.close();
        showToast(id ? "Producto actualizado." : "Producto registrado.");
        await renderView("products");
    } catch (error) {
        showToast(error.message || "No se pudo guardar el producto.", true);
    }
});

document.addEventListener("input", async (event) => {
    if (event.target.matches("[data-global-search]")) {
        const value = event.target.value;
        if (value.trim() && currentView !== "products") await renderView("products");
        const tableSearch = document.querySelector("[data-table-search]");
        if (tableSearch) tableSearch.value = value;
        applyTableSearch(value);
    }
    if (event.target.matches("[data-table-search]")) applyTableSearch(event.target.value);
});

window.addEventListener("auth-expired", () => {
    authenticatedUser = null;
    renderView("login");
});

async function initializeApp() {
    if (!getAccessToken()) {
        await renderView("login");
        return;
    }

    try {
        const result = await api.get("/auth/me");
        authenticatedUser = result.user;
        await renderView("home");
    } catch (error) {
        if (error.status === 401) {
            setAccessToken(null);
            await renderView("login");
            return;
        }
        throw error;
    }
}

initializeApp().catch((error) => {
    app.innerHTML = `<p class="m-6 rounded-xl bg-red-50 p-4 text-red-700" role="alert">No se pudo iniciar la aplicación: ${escapeHTML(error.message)}</p>`;
});
