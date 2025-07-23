document.addEventListener("DOMContentLoaded", () => {
  const tg = window.Telegram.WebApp;
  tg?.ready();
  tg?.expand();

  document.querySelectorAll(".tag-btn").forEach(btn =>
    btn.addEventListener("click", () => btn.classList.toggle("selected"))
  );

  const form = document.getElementById("searchForm");
  form.addEventListener("submit", e => {
    e.preventDefault();
    performSearch();
  });
});

// Получение интересов
function getSelectedInterests() {
  return Array.from(document.querySelectorAll(".tag-btn.selected")).map(
    tag => tag.dataset.value
  );
}

async function performSearch() {
  const tg = window.Telegram.WebApp;
  const resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "⏳ Поиск пользователей...";

  const data = {
    action: "search",
    sphere: document.getElementById("sphere").value,
    gender: document.getElementById("gender").value,
    age_from: document.getElementById("age_from").value,
    age_to: document.getElementById("age_to").value,
    interests: getSelectedInterests()
  };

  tg.sendData(JSON.stringify(data));
  resultsEl.innerHTML = "📤 Поиск отправлен...";
}
