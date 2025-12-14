// ============================
//     TROCA LOGIN / CADASTRO
// ============================

// Elementos do front
const loginArea = document.getElementById("login-area");
const registerArea = document.getElementById("register-area");

const btnOpenRegister = document.getElementById("btn-open-register");
const btnBackLogin = document.getElementById("btn-back-login");

btnOpenRegister.addEventListener("click", () => {
    loginArea.style.display = "none";
    registerArea.style.display = "block";
});

btnBackLogin.addEventListener("click", () => {
    registerArea.style.display = "none";
    loginArea.style.display = "block";
});


// ============================
//    SISTEMA DE MOSTRAR SENHA
// ============================

const eyes = document.querySelectorAll(".eye");

eyes.forEach(eye => {
    const inputId = eye.getAttribute("data-target");
    const input = document.getElementById(inputId);

    const eyeOpen = eye.querySelector(".eye-open");
    const eyeClosed = eye.querySelector(".eye-closed");

    eye.addEventListener("click", () => {
        const hidden = input.type === "password";
        input.type = hidden ? "text" : "password";
        eyeOpen.style.display = hidden ? "none" : "block";
        eyeClosed.style.display = hidden ? "block" : "none";
    });
});



// ========================================================
//   VALIDAÇÃO + ENVIO DE LOGIN PARA O BACK-END REAL
// ========================================================

const loginBtn = document.querySelector("#login-area .btn1");

loginBtn.addEventListener("click", async () => {

    const username = document.getElementById("login-user").value.trim();
    const senha = document.getElementById("login-pass").value.trim();

    // validação simples
    if (username === "" || senha === "") {
        alert("Preencha todos os campos!");
        return;
    }

    // envia para o back-end
    const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, senha })
    });

    const data = await response.json();

    if (data.status === "ok") {
        alert("Login autorizado!");
        window.location.href = "dashboard.html"; // página após login
    } else {
        alert(data.msg);
    }
});



// ========================================================
//   VALIDAÇÃO + ENVIO DE CADASTRO PARA O BACK-END REAL
// ========================================================

const registerBtn = document.querySelector("#register-area .btn1");

registerBtn.addEventListener("click", async () => {

    const username = document.getElementById("cad-user").value.trim();
    const senha1 = document.getElementById("cad-pass").value.trim();
    const senha2 = document.getElementById("cad-pass2").value.trim();

    if (username === "" || senha1 === "" || senha2 === "") {
        alert("Todos os campos são obrigatórios!");
        return;
    }

    if (senha1 !== senha2) {
        alert("As senhas não coincidem!");
        return;
    }

    const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, senha: senha1 })
    });

    const data = await response.json();

    if (data.status === "ok") {
        alert("Cadastro realizado!");
        registerArea.style.display = "none";
        loginArea.style.display = "block";
    } else {
        alert(data.msg);
    }
});
