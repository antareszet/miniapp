// Проверка наличия Telegram WebApp API
console.log("📦 Проверка Telegram.WebApp...");
if (typeof Telegram === "undefined" || typeof Telegram.WebApp === "undefined") {
    alert("❌ Telegram.WebApp API не доступен. Откройте через Telegram кнопку!");
    console.error("❌ Telegram.WebApp не найден");
} else {
    console.log("✅ Telegram.WebApp найден:", Telegram.WebApp);
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
}

// Шаги регистрации
let currentStep = 1;
const totalSteps = 3;
const progress = document.getElementById('progress');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// "Начать регистрацию"
document.getElementById('startBtn').addEventListener('click', () => {
    console.log("🟢 Нажата кнопка 'Начать регистрацию'");
    document.getElementById('startScreen').style.display = 'none';
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'inline-block';
    showStep(currentStep);
});

// Отображение текущего шага
function showStep(step) {
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    const activeStep = document.getElementById(`step${step}`);
    if (!activeStep) {
        console.warn(`⚠️ Элемент шага step${step} не найден`);
        return;
    }
    activeStep.classList.add('active');
    progress.style.width = `${((step - 1) / (totalSteps - 1)) * 100}%`;
    prevBtn.style.display = (step === 1) ? 'none' : 'inline-block';
    nextBtn.textContent = (step === totalSteps) ? 'Завершить' : 'Далее';

    console.log(`📌 Текущий шаг: ${step}`);
}

// Кнопка "Далее"
function nextStep() {
    console.log(`➡️ Нажата кнопка "Далее" на шаге ${currentStep}`);
    if (validateStep(currentStep)) {
        currentStep++;
        if (currentStep > totalSteps) {
            console.log("✅ Все шаги завершены. Отправляем форму...");
            submitForm();
            return;
        }
        showStep(currentStep);
    } else {
        console.warn("⚠️ Валидация не пройдена");
        alert("Пожалуйста, заполните все поля!");
    }
}

// Кнопка "Назад"
function prevStep() {
    console.log(`⬅️ Нажата кнопка 'Назад'. Текущий шаг: ${currentStep}`);
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

// Проверка заполнения полей на шаге
function validateStep(step) {
    let valid = true;
    const inputs = document.getElementById(`step${step}`).querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            valid = false;
        } else {
            input.classList.remove('error');
        }
    });
    console.log(`✅ Валидация шага ${step}: ${valid ? "успешно" : "есть незаполненные поля"}`);
    return valid;
}

// Отправка данных в Telegram бота
function submitForm() {
    console.log("📤 Сбор данных формы...");
    const data = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        gender: document.getElementById('gender').value,
        age: document.getElementById('age').value.trim(),
        sphere: document.getElementById('sphere').value.trim(),
        interests: document.getElementById('interests').value.trim()
    };

    console.log("📦 Данные для отправки:", data);

    // Проверка, инициализирован ли API
    if (!Telegram || !Telegram.WebApp) {
        alert("❌ Telegram.WebApp API не найден. Форма должна быть открыта через Telegram.");
        console.error("❌ Telegram.WebApp не существует");
        return;
    }

    if (typeof Telegram.WebApp.sendData !== "function") {
        alert("❌ Функция sendData() не найдена. Возможно, устаревшая версия Telegram.");
        console.error("❌ sendData не является функцией.");
        return;
    }

    try {
        const payload = JSON.stringify(data);
        Telegram.WebApp.sendData(payload);
        Telegram.WebApp.close();
        alert("✅ Данные отправлены! Спасибо за регистрацию.");
        console.log("✅ Данные успешно отправлены через Telegram.WebApp.sendData()");
    } catch (error) {
        alert("❌ Ошибка отправки данных в Telegram.");
        console.error("❌ sendData() вызвал исключение:", error);
    }
}
