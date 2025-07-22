// Глобальные переменные
let currentStep = 1;
const totalSteps = 3;
let tgWebApp = null;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен');
    
    // Проверяем доступность Telegram WebApp API
    if (window.Telegram && window.Telegram.WebApp) {
        tgWebApp = Telegram.WebApp;
        console.log('Telegram WebApp API доступен', tgWebApp);
        
        // Инициализация WebApp
        tgWebApp.ready();
        tgWebApp.expand();
        tgWebApp.enableClosingConfirmation();
        
        // Логирование параметров
        console.log('Версия WebApp:', tgWebApp.version);
        console.log('Платформа:', tgWebApp.platform);
        console.log('InitData:', tgWebApp.initData);
        console.log('InitDataUnsafe:', tgWebApp.initDataUnsafe);
        
        // Применяем тему Telegram
        applyTheme();
        
        // Обработчики событий
        tgWebApp.onEvent('themeChanged', applyTheme);
        tgWebApp.onEvent('viewportChanged', updateViewport);
        
        // Показываем первый шаг
        showStep(currentStep);
    } else {
        console.error('Telegram WebApp API не доступен!');
        showError('Пожалуйста, откройте это приложение через Telegram бота.');
    }
});

// Навигация по шагам
function showStep(step) {
    // Скрываем все шаги
    document.querySelectorAll('.step').forEach(el => {
        el.classList.remove('active');
    });
    
    // Показываем текущий шаг
    const stepElement = document.getElementById(`step${step}`);
    if (stepElement) {
        stepElement.classList.add('active');
        console.log(`Показан шаг ${step}`);
    } else {
        console.error(`Шаг ${step} не найден!`);
    }
}

function nextStep() {
    if (validateStep(currentStep)) {
        currentStep++;
        if (currentStep > totalSteps) {
            submitForm();
        } else {
            showStep(currentStep);
        }
    } else {
        showError('Пожалуйста, заполните все обязательные поля.');
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

// Валидация шага
function validateStep(step) {
    let isValid = true;
    const stepElement = document.getElementById(`step${step}`);
    
    if (!stepElement) {
        console.error(`Шаг ${step} не найден для валидации`);
        return false;
    }
    
    const inputs = stepElement.querySelectorAll('input[required], select[required], textarea[required]');
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }
        
        // Специальная проверка для возраста
        if (input.id === 'age' && input.value) {
            const age = parseInt(input.value);
            if (age < 18 || age > 100) {
                input.classList.add('error');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

// Отправка данных
function submitForm() {
    if (!validateStep(currentStep)) {
        showError('Пожалуйста, заполните все обязательные поля.');
        return;
    }
    
    // Собираем данные
    const formData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        gender: document.getElementById('gender').value,
        age: parseInt(document.getElementById('age').value),
        sphere: document.getElementById('sphere').value.trim(),
        interests: document.getElementById('interests').value.trim(),
        initData: tgWebApp ? tgWebApp.initData : null
    };
    
    console.log('Собранные данные:', formData);
    
    // Блокируем кнопку отправки
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
    }
    
    // Показываем статус
    showStatus('Отправка данных...', 'info');
    
    // Пытаемся отправить данные
    try {
        if (tgWebApp && tgWebApp.sendData) {
            console.log('Пытаемся отправить через tgWebApp.sendData');
            tgWebApp.sendData(JSON.stringify(formData));
            
            // Закрываем WebApp через 1 секунду
            setTimeout(() => {
                if (tgWebApp && tgWebApp.close) {
                    tgWebApp.close();
                }
            }, 1000);
        } else {
            throw new Error('Telegram WebApp API не доступен');
        }
    } catch (error) {
        console.error('Ошибка при отправке данных:', error);
        showError('Ошибка при отправке данных. Пожалуйста, попробуйте ещё раз.');
        
        // Разблокируем кнопку
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Завершить регистрацию';
        }
    }
}

// Вспомогательные функции
function applyTheme() {
    if (!tgWebApp) return;
    
    const themeParams = tgWebApp.themeParams || {};
    console.log('Применяем тему:', themeParams);
    
    document.body.style.setProperty('--tg-theme-bg-color', themeParams.bg_color || '#f0f4ff');
    document.body.style.setProperty('--tg-theme-text-color', themeParams.text_color || '#000000');
    document.body.style.setProperty('--tg-theme-button-color', themeParams.button_color || '#6a5acd');
    document.body.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color || '#ffffff');
}

function updateViewport() {
    if (tgWebApp) {
        console.log('Viewport изменился:', tgWebApp.viewportHeight);
    }
}

function showError(message) {
    console.error(message);
    showStatus(message, 'error');
}

function showStatus(message, type = 'info') {
    const statusElement = document.getElementById('statusMessage');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.style.display = 'block';
        statusElement.style.color = type === 'error' ? '#ff4444' : '#6a5acd';
        
        // Автоматически скрываем через 5 секунд
        if (type !== 'error') {
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, 5000);
        }
    }
}
