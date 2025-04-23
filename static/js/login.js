document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    const errorMessage = document.getElementById("loginError");

    if (response.ok) {
        errorMessage.classList.add("d-none");
        window.location.href = "/dashboard";
    } else {
        errorMessage.textContent = data.message || "Login failed";
        errorMessage.classList.remove("d-none");
    }
});