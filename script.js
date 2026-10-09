
const SUPABASE_URL = "https://jxqkcnvjhfldlnxhfazd.supabase.co";
const SUPABASE_KEY = "sb_publishable_VYBqbTpDINn9EAw9wxb02A_JrU9GRr_";

const $ = (s) => document.querySelector(s);

const list = $("#announcementList");
const searchInput = $("#searchInput");
const categoryFilter = $("#categoryFilter");
const emptyMessage = $("#emptyMessage");
const announcementDialog = $("#announcementDialog");
const suggestionDialog = $("#suggestionDialog");

const starterPosts = [
  {
    id: 1,
    title: "MaktabHub platformasiga xush kelibsiz!",
    category: "Yangilik",
    text: "Bu yerda maktabimiz yangiliklari, tadbirlar va foydali e'lonlar joylashtiriladi.",
    author: "MaktabHub jamoasi",
    date: "2026-10-09"
  }
];

let posts = [];
let darkMode = false;

async function api(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

function safeText(tag, className, value) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.textContent = value ?? "";
  return el;
}

function makePostCard(post) {
  const card = safeText("article", "post-card", "");
  const top = safeText("div", "post-top", "");
  const category = safeText("span", "category", post.category);
  category.classList.add(post.category);
  const date = safeText("span", "post-date", post.date || "");
  top.append(category, date);

  card.append(
    top,
    safeText("h3", "", post.title),
    safeText("p", "post-text", post.text),
    safeText("div", "post-author", "✍️ " + post.author)
  );
  return card;
}

function renderPosts() {
  const query = searchInput.value.trim().toLocaleLowerCase("uz");
  const category = categoryFilter.value;

  const filtered = posts.filter((post) => {
    const content = `${post.title} ${post.text} ${post.author}`
      .toLocaleLowerCase("uz");
    return content.includes(query) &&
      (category === "Barchasi" || post.category === category);
  });

  list.replaceChildren(...filtered.map(makePostCard));
  emptyMessage.hidden = filtered.length > 0;

  $("#announcementCount").textContent = posts.length;
  $("#eventCount").textContent =
    posts.filter(p => p.category === "Tadbir").length;
  $("#itemCount").textContent =
    posts.filter(p => p.category === "Buyum").length;
}

async function loadPosts() {
  try {
    posts = await api("announcements?select=*&order=id.desc");
    renderPosts();
  } catch (error) {
    console.error("E'lonlarni yuklashda xato:", error);
    list.replaceChildren(
      safeText("p", "empty-message",
        "E'lonlarni yuklab bo'lmadi. Supabase sozlamalarini tekshiring.")
    );
  }
}

$("#year").textContent = new Date().getFullYear();
searchInput.addEventListener("input", renderPosts);
categoryFilter.addEventListener("change", renderPosts);

$("#addBtn").addEventListener("click", () => {
  $("#announcementForm").reset();
  announcementDialog.showModal();
});

$("#closeDialog").addEventListener("click", () =>
  announcementDialog.close()
);

$("#announcementForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = $("#postTitle").value.trim();
  const text = $("#postText").value.trim();
  const author = $("#postAuthor").value.trim();
  const category = $("#postCategory").value;

  if (!title || !text || !author) {
    alert("Iltimos, barcha maydonlarni to'ldiring.");
    return;
  }

  try {
    await api("announcements", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ title, text, author, category })
    });

    await loadPosts();
    searchInput.value = "";
    categoryFilter.value = "Barchasi";
    renderPosts();
    announcementDialog.close();
    alert("E'lon bazaga saqlandi!");
  } catch (error) {
    console.error(error);
    alert("E'lon saqlanmadi. Supabase sozlamalarini tekshiring.");
  }
});

function applyTheme(dark) {
  document.body.classList.toggle("dark", dark);
  $("#themeBtn").textContent = dark ? "☀️" : "🌙";
}

try {
  darkMode = JSON.parse(localStorage.getItem("makTabHubDark")) || false;
} catch {}

applyTheme(darkMode);

$("#themeBtn").addEventListener("click", () => {
  darkMode = !darkMode;
  applyTheme(darkMode);
  localStorage.setItem("makTabHubDark", JSON.stringify(darkMode));
});

$("#suggestionBtn").addEventListener("click", () => {
  $("#suggestionForm").reset();
  suggestionDialog.showModal();
});

$("#closeSuggestion").addEventListener("click", () =>
  suggestionDialog.close()
);

$("#suggestionForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const suggestion = $("#suggestionText").value.trim();
  if (!suggestion) return;

  const key = "makTabHubSuggestions";
  let suggestions = [];

  try {
    suggestions = JSON.parse(localStorage.getItem(key)) || [];
  } catch {}

  suggestions.push({ text: suggestion, date: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(suggestions));
  alert("Taklif ushbu brauzerda saqlandi. Rahmat!");
  suggestionDialog.close();
});

loadPosts();
