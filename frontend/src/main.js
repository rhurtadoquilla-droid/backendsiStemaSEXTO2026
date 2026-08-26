import {getUserslist} from "./components/userlist.js";
const app = document.getElementById("app");
const views = {
    home: async () => {
        const res = await fetch("./src/views/home.html");
        app.innerHTML = await res.text();
    },
    users: async () => {
        const res = await fetch("./src/views/user.html");
        app.innerHTML = await res.text();
        await getUserslist();
    },
};
// function to handle navigation
document.addEventListener("click", async (event) => {
    const link = event.target.closest("[data-view]");
    if (!link) return;

    event.preventDefault();
    const view = link.dataset.view;
    if (views[view]) {
        await views[view]();
    }
});
views.home(); // Load the home view by default
