let tgWebApp = null;
let currentStep = 1;
const totalSteps = 3;

document.addEventListener('DOMContentLoaded', () => {
  tgWebApp = window.Telegram?.WebApp;

  if (!tgWebApp) {
    alert("❌ Откройте форму через Telegram-бота.");
    return;
  }

  tgWebApp.ready();
  tgWebApp.expand();

  // Стилизация выбранных тегов интересов
  document.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      this.classList.toggle('selected');
    });
  });

  showStep(currentStep);
});

function showStep(step) {
  document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
  const el = document.getElementById(`step${step}`);
  if (el) el.classList.add('active');
}

function nextStep() {
  if (validateStep(currentStep)) {
    currentStep++;
    showStep(currentStep);
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
  }
}

function getSelectedInterests() {
  return Array.from(document.querySelectorAll('.tag-btn.selected')).map(btn => btn.dataset.value);
}

function validateStep(step) {
  let valid = true;
  const stepEl = document.getElementById(`step${step}`);
  if (!stepEl) return false;

  const requiredInputs = stepEl.querySelectorAll('input[required], select[required]');
  requiredInputs.forEach(input => {
    if (!input.value.trim()) {
      input.classList.add('error');
      valid = false;
    } else {
      input.classList.remove('error');
    }
    // Для возраста
    if (input.id === 'age' && input.value) {
      const age = parseInt(input.value);
      if (age < 18 || age > 100) {
        input.classList.add('error');
        valid = false;
      }
    }
  });

  // На последнем шаге просим выбрать хотя бы 1 интерес
  if (step === 3 && getSelectedInterests().length === 0) {
    showError('Выберите хотя бы один интерес');
    valid = false;
  }
  return valid;
}

function submitForm() {
  if (!validateStep(currentStep)) return;

  const data = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    gender: document.getElementById('gender').value,
    age: parseInt(document.getElementById('age').value),
    sphere: document.getElementById('sphere').value,
    interests: getSelectedInterests()
  };

  console.log("📦 Отправляем данные:", data);

  try {
    tgWebApp.sendData(JSON.stringify(data));
    showSuccess("✅ Данные отправлены!");
    setTimeout(() => tgWebApp.close(), 1200);
  } catch (e) {
    showError("⚠️ Ошибка отправки данных");
    console.error(e);
  }
}

// Вспомогательные функции для statуs
function showError(msg) {
  const el = document.getElementById('statusMessage');
  el.style.display = 'block';
  el.style.color = '#ff4c4c';
  el.textContent = msg;
}

function showSuccess(msg) {
  const el = document.getElementById('statusMessage');
  el.style.display = 'block';
  el.style.color = '#339933';
  el.textContent = msg;
}
