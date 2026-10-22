import {api} from "../utils/api.js";
export const getUserslist = async () => {
    const users = await api.get("/usuarios");
    return Array.isArray(users) ? users : [];
};