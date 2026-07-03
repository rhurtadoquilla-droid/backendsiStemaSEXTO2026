import {api} from "../utils/api.js";
alert("hola user");
export const getUserslist = async () => {
    const userListContainer = document.getElementById("userTableList");
    tbody.innerHTML = "<tr><td colspan='3'>Cargando...</td></tr>"; // Limpiar la tabla antes de llenarla
    try {

        const users = await api.get("/users");
        container.innerHTML = user.map(user => `<tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
        </tr>`).join(""); 
        return users;
    } catch (error) {
        container.innerHTML = "<tr><td colspan='3'>Error al cargar los usuarios</td></tr>"; 
    }
};