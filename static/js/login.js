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

    if (response.ok && data.success) {
        errorMessage.classList.add("d-none");
        window.location.href = data.redirect_url;
    } else {
        errorMessage.textContent = data.message || "Login failed";
        errorMessage.classList.remove("d-none");
        document.getElementById("password").value = "";  // Clear password
    }
});
// toggle password 
document.getElementById("togglePassword").addEventListener("click", function () {
    const passwordField = document.getElementById("password");
    const icon = this.querySelector("i");

    if (passwordField.type === "password") {
        passwordField.type = "text";
        icon.classList.remove("bi-eye");
        icon.classList.add("bi-eye-slash");
    } else {
        passwordField.type = "password";
        icon.classList.remove("bi-eye-slash");
        icon.classList.add("bi-eye");
    }
});