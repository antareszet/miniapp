// URL вашего бэкенд-API
const API_URL = "https://YOUR_BACKEND/api/search";  // Замените на свой

document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram?.WebApp;
  if (tg) { tg.ready(); tg.expand(); }

  const form = document.getElementById('searchForm');
  form.addEventListener('submit', searchUsers);
});

function getSelectedOptions(el) {
  return Array.from(el.selectedOptions).map(opt => opt.value).filter(Boolean);
}

async function searchUsers(event) {
  event.preventDefault();
  const sphere = document.getElementById('sphere').value;
  const interests = getSelectedOptions(document.getElementById('interests'));
  const gender = document.getElementById('gender').value;
  const age_from = parseInt(document.getElementById('age_from').value) || null;
  const age_to = parseInt(document.getElementById('age_to').value) || null;

  const tgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;

  document.getElementById('results').innerHTML = "⏳ Поиск...";

  try {
    const res = await fetch(API_URL + "?" + new URLSearchParams({
      sphere, gender, age_from, age_to,
      interests: interests.join(","),
      except_id: tgId  // чтобы не показывать самого себя
    }), {
      method: "GET"
    });
    const users = await res.json();
    if (!users.length) {
      document.getElementById('results').innerHTML = '<div class="not-found">По вашему запросу никто не найден.</div>';
      return;
    }
    let html = "";
    for (const user of users) {
      let userInterests = user.interests ? user.interests.split(',').map(x => x.trim()) : [];
      // Подсветка общих интересов (фильтр)
      let matched = interests.length
        ? userInterests.filter(i => interests.includes(i))
        : [];
      html += `<div class="result">
        <div class="card-title">${user.first_name} ${user.last_name}, ${user.age} (${user.gender === "male" ? "М" : (user.gender === "female" ? "Ж" : "-")})</div>
        <div><b>Сфера:</b> ${user.sphere}</div>
        <div class="chips"><b>Интересы:</b> ${
          userInterests.map(i => `<span class="chip${matched.includes(i)?' highlight':''}">${i}</span>`).join(" ")
        }</div>
      </div>`;
    }
    document.getElementById('results').innerHTML = html;
  } catch (err) {
    document.getElementById('results').innerHTML = "🚫 Ошибка поиска. Попробуйте ещё раз.";
  }
}
