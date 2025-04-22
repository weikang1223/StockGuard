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
    
    if (response.ok) {
        window.location.href = "/dashboard";
    } else {
        const errorMessage = document.getElementById("error-message");
        errorMessage.textContent = data.message || "Login failed";
        errorMessage.classList.remove("d-none");
    }
});