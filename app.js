let currentStep = 1;

document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram?.WebApp;
  tg?.ready();
  tg?.expand();

  // Интерактивный выбор тегов интересов
  document.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      this.classList.toggle('selected');
    });
  });

  showStep(currentStep);
});

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

function showStep(step) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.getElementById(`step${step}`).classList.add('active');
}

function validateStep(step) {
  const stepEl = document.getElementById(`step${step}`);
  const required = stepEl.querySelectorAll('[required]');
  let valid = true;

  required.forEach(input => {
    const value = input.value.trim();

    // Проверка обычного заполнения
    if (!value || (input.minLength && value.length < input.minLength)) {
      input.classList.add('error');
      valid = false;
    } else {
      input.classList.remove('error');
    }

    // Возрастное ограничение
    if (input.id === "age") {
      const age = parseInt(value, 10);
      if (isNaN(age) || age < 18 || age > 100) {
        input.classList.add('error');
        valid = false;
      }
    }
  });

  return valid;
}

function getSelectedInterests() {
  return Array.from(document.querySelectorAll('.tag-btn.selected')).map(btn => btn.dataset.value);
}

function submitForm() {
  if (!validateStep(currentStep)) return;

  const data = {
    action: "register",  // Важно для обработки на сервере
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    gender: document.getElementById('gender').value,
    age: parseInt(document.getElementById('age').value.trim(), 10),
    sphere: document.getElementById('sphere').value,
    interests: getSelectedInterests(),
    aboutMe: document.getElementById('aboutMe')?.value.trim() || '',
    allowPhone: document.getElementById('allowPhone')?.checked || false,
    allowUsername: document.getElementById('allowUsername')?.checked !== false
  };

  // Отправка объекта в Telegram WebApp API
  if (Telegram && Telegram.WebApp) {
    Telegram.WebApp.sendData(JSON.stringify(data));
  } else {
    alert("Ошибка Telegram WebApp");
  }
}
