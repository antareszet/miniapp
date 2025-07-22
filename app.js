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

  document.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      this.classList.toggle('selected');
    });
  });

  // Автозаполнение для редактирования профиля
  const tgid = tgWebApp.initDataUnsafe?.user?.id;
  const urlParams = new URLSearchParams(window.location.search);
  const editing = urlParams.get("mode") === "edit";
  if (editing && tgid) {
    fetch(`https://ТВОЙ-ДОМЕН/api/profile/${tgid}`)
      .then(res => res.json())
      .then(data => {
        if (data.result !== "ok") return;

        document.getElementById('firstName').value = data.firstName;
        document.getElementById('lastName').value = data.lastName;
        document.getElementById('gender').value = data.gender;
        document.getElementById('age').value = data.age;
        document.getElementById('sphere').value = data.sphere;

        // выделение выбранных тегов
        (data.interests || []).forEach(interest => {
          document.querySelectorAll('.tag-btn').forEach(btn => {
            if (btn.dataset.value === interest) btn.classList.add("selected");
          });
        });

        console.log("✅ Профиль загружен и установлен в поля формы");
      })
      .catch(err => {
        console.error("Не удалось загрузить профиль:", err);
      });
  }

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
