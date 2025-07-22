// Инициализация Telegram WebApp
function initTelegramWebApp() {
    console.log("⚙️ Инициализация Telegram WebApp...");
    
    if (window.Telegram && window.Telegram.WebApp) {
        console.log("✅ Telegram.WebApp доступен");
        console.log("Версия WebApp:", Telegram.WebApp.version);
        console.log("Платформа:", Telegram.WebApp.platform);
        console.log("InitData:", Telegram.WebApp.initData);
        
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
        Telegram.WebApp.enableClosingConfirmation();
        Telegram.WebApp.setHeaderColor('#6a5acd');
        
        // Обработчики событий
        Telegram.WebApp.onEvent('viewportChanged', function() {
            console.log('Viewport changed:', Telegram.WebApp.viewportHeight);
        });
        
        Telegram.WebApp.onEvent('themeChanged', function() {
            console.log('Theme changed:', Telegram.WebApp.themeParams);
            applyTheme();
        });
        
        applyTheme();
        return true;
    } else {
        console.log("❌ Telegram.WebApp не доступен");
        return false;
    }
}

// Применяем тему Telegram
function applyTheme() {
    if (!Telegram.WebApp) return;
    
    const themeParams = Telegram.WebApp.themeParams || {};
    document.body.style.backgroundColor = themeParams.bg_color || '#f0f4ff';
    document.body.style.color = themeParams.text_color || '#000000';
}

// Проверяем инициализацию WebApp при загрузке и через 1 секунду
let webAppReady = initTelegramWebApp();
if (!webAppReady) {
    setTimeout(() => {
        webAppReady = initTelegramWebApp();
        if (!webAppReady) {
            alert("Пожалуйста, откройте это мини-приложение через Telegram бота");
        }
    }, 1000);
}

// Шаги регистрации
let currentStep = 1;
const totalSteps = 3;
const progress = document.getElementById('progress');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Начало регистрации
document.getElementById('startBtn').addEventListener('click', () => {
    console.log("🟢 Начало регистрации");
    document.getElementById('startScreen').style.display = 'none';
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'inline-block';
    showStep(currentStep);
});

// Навигация
prevBtn.addEventListener('click', prevStep);
nextBtn.addEventListener('click', nextStep);

// Отображение шага
function showStep(step) {
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    const activeStep = document.getElementById(`step${step}`);
    if (!activeStep) {
        console.warn(`⚠️ Шаг step${step} не найден`);
        return;
    }
    activeStep.classList.add('active');
    progress.style.width = `${((step - 1) / (totalSteps - 1)) * 100}%`;
    prevBtn.style.display = (step === 1) ? 'none' : 'inline-block';
    nextBtn.textContent = (step === totalSteps) ? 'Завершить' : 'Далее';
    
    // На последнем шаге настраиваем MainButton
    if (step === totalSteps && Telegram.WebApp && Telegram.WebApp.MainButton) {
        setupMainButton();
    }
    
    console.log(`📌 Текущий шаг: ${step}`);
}

// Настройка MainButton Telegram
function setupMainButton() {
    const mainButton = Telegram.WebApp.MainButton;
    mainButton.setText('ЗАВЕРШИТЬ РЕГИСТРАЦИЮ');
    mainButton.onClick(submitForm);
    mainButton.show();
}

// Валидация шага
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
        
        // Специальная проверка для возраста
        if (input.id === 'age' && input.value) {
            const age = parseInt(input.value);
            if (age < 18 || age > 100) {
                input.classList.add('error');
                valid = false;
            }
        }
    });
    
    console.log(`✅ Валидация шага ${step}: ${valid ? "успешно" : "ошибка"}`);
    return valid;
}

// Навигация
function nextStep() {
    console.log(`➡️ Переход к следующему шагу с ${currentStep}`);
    if (validateStep(currentStep)) {
        currentStep++;
        if (currentStep > totalSteps) {
            submitForm();
            return;
        }
        showStep(currentStep);
    } else {
        console.warn("⚠️ Валидация не пройдена");
        showError("Пожалуйста, заполните все поля правильно!");
    }
}

function prevStep() {
    console.log(`⬅️ Возврат к предыдущему шагу с ${currentStep}`);
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

// Показ ошибки
function showError(message) {
    if (Telegram.WebApp && Telegram.WebApp.showAlert) {
        Telegram.WebApp.showAlert(message);
    } else {
        alert(message);
    }
}

// Отправка данных
function submitForm() {
    console.log("📤 Подготовка данных формы...");
    
    const data = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        gender: document.getElementById('gender').value,
        age: document.getElementById('age').value.trim(),
        sphere: document.getElementById('sphere').value.trim(),
        interests: document.getElementById('interests').value.trim(),
        initData: Telegram.WebApp ? Telegram.WebApp.initData : null
    };

    console.log("📦 Данные для отправки:", data);

    // Попытка отправки разными способами
    try {
        if (window.Telegram && window.Telegram.WebApp) {
            // Основной метод
            if (typeof Telegram.WebApp.sendData === 'function') {
                Telegram.WebApp.sendData(JSON.stringify(data));
                console.log("Данные отправлены через sendData");
            } 
            // Альтернативный метод
            else if (typeof Telegram.WebApp.postEvent === 'function') {
                Telegram.WebApp.postEvent('web_app_data_send', {data: JSON.stringify(data)});
                console.log("Данные отправлены через postEvent");
            }
            
            Telegram.WebApp.close();
            return;
        }
        
        // Метод для старых версий Telegram
        if (window.TelegramGameProxy && window.TelegramGameProxy.receiveEvent) {
            window.TelegramGameProxy.receiveEvent('data', JSON.stringify(data));
            console.log("Данные отправлены через TelegramGameProxy");
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.close();
            }
            return;
        }
        
        // Если ничего не сработало
        showError("Не удалось отправить данные. Пожалуйста, сообщите администратору.");
        console.error("Не найдено методов отправки данных");
        
    } catch (e) {
        console.error("Ошибка при отправке данных:", e);
        showError("Произошла ошибка при отправке данных. Пожалуйста, попробуйте еще раз.");
    }
}
