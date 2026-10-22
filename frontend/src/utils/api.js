const API_URL = (window.INVENTARIO_API_URL || `${window.location.protocol}//api.sistemainventario`).replace(/\/$/, "");
const TOKEN_KEY = "inventario-auth-token";
let accessToken = sessionStorage.getItem(TOKEN_KEY);

export function setAccessToken(token) {
    accessToken = token || null;
    if (accessToken) sessionStorage.setItem(TOKEN_KEY, accessToken);
    else sessionStorage.removeItem(TOKEN_KEY);
}

export function getAccessToken() {
    return accessToken;
}

async function request(method, endpoint, data) {
    const options = { method, headers: { Accept: "application/json" } };
    if (accessToken) options.headers.Authorization = `Bearer ${accessToken}`;
    if (data !== undefined) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const text = await response.text();
    let result;

    try {
        result = text ? JSON.parse(text) : null;
    } catch {
        result = text;
    }

    if (response.ok && (result === null || typeof result !== "object")) {
        throw new Error("La API devolvió una respuesta no válida. No se pudo confirmar la operación.");
    }

    if (!response.ok) {
        const error = new Error(result?.message || result?.error || `Error HTTP ${response.status}`);
        error.status = response.status;
        if (response.status === 401 && endpoint !== "/auth/login") {
            setAccessToken(null);
            window.dispatchEvent(new Event("auth-expired"));
        }
        throw error;
    }

    return result;
}

export const api = {
    get: (endpoint) => request("GET", endpoint),
    post: (endpoint, data) => request("POST", endpoint, data),
    put: (endpoint, data) => request("PUT", endpoint, data),
    delete: (endpoint) => request("DELETE", endpoint),
};