// === SISTEMA DE TROCA ENTRE LOGIN E CADASTRO ===

// Pega os elementos das áreas
const loginArea = document.getElementById("login-area");
const registerArea = document.getElementById("register-area");

// Botão que abre cadastro
const btnOpenRegister = document.getElementById("btn-open-register");

// Botão que volta ao login
const btnBackLogin = document.getElementById("btn-back-login");

// Quando clicar em "Cadastrar-se"
btnOpenRegister.addEventListener("click", () => {

    // Esconde o login
    loginArea.style.display = "none";

    // Mostra o cadastro
    registerArea.style.display = "block";
});

// Quando clicar em "Voltar ao Login"
btnBackLogin.addEventListener("click", () => {

    // Mostra o login
    loginArea.style.display = "block";

    // Esconde o cadastro
    registerArea.style.display = "none";
});



// === SISTEMA PROFISSIONAL DO OLHO ===

// Seleciona TODOS os itens com a classe .eye
const eyes = document.querySelectorAll(".eye");

// Para cada ícone de olho encontrado:
eyes.forEach(eye => {

    // 'target' = qual input esse olho controla (vem do data-target)
    const inputId = eye.getAttribute("data-target");
    const input = document.getElementById(inputId);

    // SVGs internos
    const eyeOpen = eye.querySelector(".eye-open");
    const eyeClosed = eye.querySelector(".eye-closed");

    // Clique no olho
    eye.addEventListener("click", () => {

        // Verifica se está oculto
        const isHidden = input.type === "password";

        // Alterna a visibilidade do input
        input.type = isHidden ? "text" : "password";

        // Alterna visibilidade dos ícones
        eyeOpen.style.display = isHidden ? "none" : "block";
        eyeClosed.style.display = isHidden ? "block" : "none";
    });

});
