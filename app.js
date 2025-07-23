let currentStep = 1;

document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram?.WebApp;
  tg?.ready();
  tg?.expand();

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

function getSelectedInterests() {
  return Array.from(document.querySelectorAll('.tag-btn.selected')).map(btn => btn.dataset.value);
}

function validateStep(step) {
  const stepEl = document.getElementById(`step${step}`);
  const required = stepEl.querySelectorAll('[required]');
  let valid = true;

  required.forEach(input => {
    if (!input.value.trim()) {
      input.classList.add('error');
      valid = false;
    } else {
      input.classList.remove('error');
    }

    if (input.id === "age") {
      const val = parseInt(input.value, 10);
      if (val < 18 || val > 100) {
        input.classList.add('error');
        valid = false;
      }
    }
  });

  return valid;
}

function submitForm() {
  if (!validateStep(currentStep)) return;

  const obj = {
    action: "register", // 👈 очень важно!
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    gender: document.getElementById('gender').value,
    age: document.getElementById('age').value,
    sphere: document.getElementById('sphere').value,
    interests: getSelectedInterests()
  };

  // Отправка данных обратно в Telegram-бот
  Telegram.WebApp.sendData(JSON.stringify(obj));
}
