
const $ = (selector) => document.querySelector(selector);

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
    text: "Bu yerda maktabimiz yangiliklari, tadbirlar va foydali e'lonlar joylashtiriladi. Platformamizni birgalikda rivojlantiramiz!",
    author: "MaktabHub jamoasi",
    date: "2026-10-09"
  },
  {
    id: 2,
    title: "Sport tadbirlariga tayyorgarlik",
    category: "Tadbir",
    text: "Maktabimizda sport va sog'lom turmush tarziga bag'ishlangan tadbirlar bo'lib o'tadi. Batafsil ma'lumotlar shu yerda e'lon qilinadi.",
    author: "Jismoniy tarbiya bo'limi",
    date: "2026-10-09"
  },
  {
    id: 3,
    title: "Maktabni obod saqlaylik",
    category: "Muhim",
    text: "Maktabimizdagi sinfxonalar, kutubxona va umumiy joylarni ozoda saqlashga barchamiz hissa qo'shaylik.",
    author: "Maktab ma'muriyati",
    date: "2026-10-09"
  }
];

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

let posts = readStorage("makTabHubPosts", starterPosts);
if (!Array.isArray(posts)) posts = starterPosts;

function savePosts() {
  try {
    localStorage.setItem("makTabHubPosts", JSON.stringify(posts));
  } catch {
    alert("Ma'lumotni saqlab bo'lmadi. Brauzer xotirasini tekshiring.");
  }
}

function safeText(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value ?? "";
  return element;
}

function makePostCard(post) {
  const card = safeText("article", "post-card", "");
  const top = safeText("div", "post-top", "");
  const category = safeText("span", "category", post.category);
  category.classList.add(post.category);
  const date = safeText("span", "post-date", post.date || "");
  top.append(category, date);

  const title = safeText("h3", "", post.title);
  const description = safeText("p", "post-text", post.text);
  const author = safeText("div", "post-author", "✍️ " + post.author);

  card.append(top, title, description, author);
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
  emptyMessage.hidden = filtered.length !== 0;

  $("#announcementCount").textContent = posts.length;
  $("#eventCount").textContent =
    posts.filter((post) => post.category === "Tadbir").length;
  $("#itemCount").textContent =
    posts.filter((post) => post.category === "Buyum").length;
}

$("#year").textContent = new Date().getFullYear();

searchInput.addEventListener("input", renderPosts);
categoryFilter.addEventListener("change", renderPosts);

$("#addBtn").addEventListener("click", () => {
  $("#announcementForm").reset();
  announcementDialog.showModal();
});

$("#closeDialog").addEventListener("click", () => {
  announcementDialog.close();
});

$("#announcementForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const title = $("#postTitle").value.trim();
  const text = $("#postText").value.trim();
  const author = $("#postAuthor").value.trim();
  const category = $("#postCategory").value;

  if (!title || !text || !author) {
    alert("Iltimos, barcha maydonlarni to'ldiring.");
    return;
  }

  const post = {
    id: Date.now(),
    title,
    category,
    text,
    author,
    date: new Date().toLocaleDateString("sv-SE")
  };

  posts.unshift(post);
  savePosts();
  searchInput.value = "";
  categoryFilter.value = "Barchasi";
  renderPosts();
  announcementDialog.close();
});

function applyTheme(dark) {
  document.body.classList.toggle("dark", dark);
  $("#themeBtn").textContent = dark ? "☀️" : "🌙";
  $("#themeBtn").setAttribute(
    "aria-label",
    dark ? "Kunduzgi rejimga o'tish" : "Tungi rejimga o'tish"
  );
}

let darkMode = readStorage("makTabHubDark", false);
applyTheme(darkMode);

$("#themeBtn").addEventListener("click", () => {
  darkMode = !darkMode;
  applyTheme(darkMode);
  try {
    localStorage.setItem("makTabHubDark", JSON.stringify(darkMode));
  } catch {
    // Rejim ushbu sahifa ochiq turgan paytda ham ishlaydi.
  }
});

$("#suggestionBtn").addEventListener("click", () => {
  $("#suggestionForm").reset();
  suggestionDialog.showModal();
});

$("#closeSuggestion").addEventListener("click", () => {
  suggestionDialog.close();
});

$("#suggestionForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const suggestion = $("#suggestionText").value.trim();
  if (!suggestion) return;

  const suggestions = readStorage("makTabHubSuggestions", []);
  suggestions.push({
    text: suggestion,
    date: new Date().toISOString()
  });

  try {
    localStorage.setItem(
      "makTabHubSuggestions",
      JSON.stringify(suggestions)
    );
    alert("Taklif ushbu brauzerda saqlandi. Rahmat!");
    suggestionDialog.close();
  } catch {
    alert("Taklifni saqlab bo'lmadi.");
  }
});

renderPosts();