let currentStep = 1;
let tg = window.Telegram?.WebApp;

document.addEventListener("DOMContentLoaded", () => {
  tg?.ready();
  tg?.expand();

  // Метка режима
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode");
  const toUserId = urlParams.get("to");

  // Если WebApp открыт в режиме лайка
  if (mode === "like" && toUserId) {
    sendLike(toUserId);
    return;
  }

  // обработка тегов
  document.querySelectorAll(".tag-btn").forEach(btn =>
    btn.addEventListener("click", () => btn.classList.toggle("selected"))
  );

  showStep(currentStep);
});

function nextStep() {
  if (validateStep(currentStep)) {
    currentStep++;
    if (currentStep === 4) preparePreview();
    showStep(currentStep);
  }
}
function prevStep() {
  if (currentStep > 1) currentStep--;
  showStep(currentStep);
}
function showStep(step) {
  document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
  document.getElementById(`step${step}`).classList.add("active");
}

function validateStep(step) {
  const el = document.getElementById(`step${step}`);
  const required = el.querySelectorAll("[required]");
  let ok = true;
  required.forEach(inp => {
    if (!inp.value.trim() || (inp.minLength && inp.value.length < inp.minLength)) {
      inp.classList.add("error");
      ok = false;
    } else {
      inp.classList.remove("error");
    }

    if (inp.id === "age") {
      const val = parseInt(inp.value, 10);
      if (val < 18 || val > 100 || isNaN(val)) {
        inp.classList.add("error");
        ok = false;
      }
    }
  });
  return ok;
}

function getSelectedInterests() {
  return Array.from(document.querySelectorAll(".tag-btn.selected")).map(b => b.dataset.value);
}

function preparePreview() {
  const data = collectData();
  const preview = document.getElementById("previewList");
  preview.innerHTML = `
    <p><b>Имя:</b> ${data.firstName} ${data.lastName}</p>
    <p><b>Пол:</b> ${data.gender}</p>
    <p><b>Возраст:</b> ${data.age}</p>
    <p><b>Сфера:</b> ${data.sphere}</p>
    <p><b>Интересы:</b> ${data.interests.join(", ")}</p>
    <p><b>О себе:</b> ${data.aboutMe}</p>
    <p><b>Показывать номер:</b> ${data.allowPhone ? "Да" : "Нет"}</p>
    <p><b>Показывать username:</b> ${data.allowUsername ? "Да" : "Нет"}</p>
  `;
}

function collectData() {
  return {
    action: "register",
    firstName: document.getElementById("firstName").value.trim(),
    lastName: document.getElementById("lastName").value.trim(),
    gender: document.getElementById("gender").value,
    age: parseInt(document.getElementById("age").value.trim(), 10),
    sphere: document.getElementById("sphere").value,
    interests: getSelectedInterests(),
    aboutMe: document.getElementById("aboutMe").value.trim(),
    allowPhone: document.getElementById("allowPhone").checked,
    allowUsername: document.getElementById("allowUsername").checked
  };
}

function submitForm() {
  const data = collectData();
  if (tg && tg.sendData) {
    tg.sendData(JSON.stringify(data));
  } else {
    alert("Ошибка WebApp API.");
  }
}

function sendLike(toUserId) {
  const payload = {
    action: "like",
    to_user_id: parseInt(toUserId, 10)
  };
  if (tg && tg.sendData) {
    tg.sendData(JSON.stringify(payload));
  } else {
    alert("Ошибка Telegram API");
  }
}
