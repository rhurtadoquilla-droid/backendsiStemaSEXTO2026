const API_URL = "http://api.sistemainventario" ;

export const api={
    // Función para realizar una solicitud GET a la API
get:async (endpoint) => {
    try {
        const response = await fetch(`${API_URL}${endpoint}`); 
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error al obtener datos de la API:", error);
        throw error;
    }
}
};