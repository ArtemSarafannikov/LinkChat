document.addEventListener("DOMContentLoaded", () => {
    const step1 = document.getElementById("step-1");
    const step2 = document.getElementById("step-2");
    const nextButton = document.getElementById("next-button");
    const form = document.getElementById("register-form");

    // Переход на следующий шаг
    nextButton.addEventListener("click", () => {
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();

        if (username && email) {
            step1.classList.add("hidden");
            step2.classList.remove("hidden");
        } else {
            alert("Пожалуйста, заполните все поля!");
        }
    });

    // Проверка перед отправкой формы
    form.addEventListener("submit", (e) => {
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (password !== confirmPassword) {
            e.preventDefault(); // Блокируем отправку формы
            alert("Пароли не совпадают!");
        }
    });
});
