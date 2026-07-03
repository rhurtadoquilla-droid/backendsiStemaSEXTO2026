import {getUserslist} from "./components/userlist.js";
alert("hola mod");
const app = document.getElementById("app");
const views = {
    home: async () => {
        const res = await fetch("./src/views/home.html");
        console.log(res);
        app.innerHTML = await res.text();
    },
    users: async () => {
        const res = await fetch("./src/views/user.html");
        console.log(res);
        app.innerHTML = await res.text();
        await getUserslist();
    },
};
// function to handle navigation
document.querySelectorAll("data-view").forEach(link => {
    link.addEventListener("click", async (event) => {
        event.preventDefault();
        const view = link.dataset.view;
        if (views[view]) {
            await views[view]();
        }
    });
});
views.home(); // Load the home view by default