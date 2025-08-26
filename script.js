// Import dari CDN
import { 
  initializeApp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import { 
  getFirestore, collection, addDoc, getDocs, query, orderBy, doc, getDoc, updateDoc, increment, limit 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCUv5sgW8mFQ9R4af2ca3KHiy2C8JVJ_Tk",
  authDomain: "web-blog-85c01.firebaseapp.com",
  projectId: "web-blog-85c01",
  storageBucket: "web-blog-85c01.appspot.com",
  messagingSenderId: "54506760478",
  appId: "1:54506760478:web:6b79f4e87f2edeecdb410f",
  measurementId: "G-TK1DGNXHW9"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Data dummy tim
const team = [
  { name: 'Rafa', role: 'Developer', bio: 'Menjaga kualitas konten dan gaya bahasa.' },
  { name: 'Radit', role: 'Developer', bio: 'Fokus pada topik teknologi dan pemrograman.' },
  { name: 'Rokhis', role: 'Developer', bio: 'Mengembangkan dan memelihara fitur situs.' }
];

// Fungsi untuk pindah halaman
function go(page) {
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(page).classList.add("active");
  window.location.hash = page;
}

window.addEventListener("load", () => {
  let page = window.location.hash.replace("#", "") || "home";
  go(page);
  loadArticles();
  renderTrending();
});

// ========================
//   TRENDING ARTICLES
// ========================
async function renderTrending() {
  let el = document.getElementById("trending");
  el.innerHTML = "";

  // 🔥 Ambil 3 artikel dengan views terbanyak
  const qTrending = query(
    collection(db, "articles"),
    orderBy("views", "desc"),
    limit(3)
  );

  const querySnapshot = await getDocs(qTrending);

  if (querySnapshot.empty) {
    el.innerHTML = "<p class='muted'>Belum ada artikel trending.</p>";
    return;
  }

  querySnapshot.forEach((docSnap) => {
    let a = docSnap.data();
    let id = docSnap.id;
    el.innerHTML += `
      <div class="card" onclick="openDetail('${id}')">
        <div class="thumb"><span>🔥</span></div>
        <div class="p16">
          <span class="badge-top">Dilihat ${a.views || 0}x</span>
          <h3 class="title">${a.title}</h3>
          <p class="desc">${a.desc}</p>
        </div>
      </div>
    `;
  });
}
window.renderTrending = renderTrending;

// ========================
//   SAVE ARTICLE
// ========================
async function saveArticle(event) {
  event.preventDefault();
  let title = document.getElementById("newTitle").value;
  let content = document.getElementById("newContent").value;
  let desc = content.length > 100 ? content.substring(0, 100) + '...' : content;
  
  await addDoc(collection(db, "articles"), {
    title: title,
    desc: desc,
    content: content,
    createdAt: Date.now(),
    views: 0 // 🔥 Tambahan: views awal
  });

  document.getElementById("newTitle").value = "";
  document.getElementById("newContent").value = "";

  alert("Artikel berhasil disimpan online!");
  loadArticles();
  go("articles");
}

// ========================
//   LOAD ARTICLES
// ========================
async function loadArticles() {
  let q = document.getElementById("q").value?.toLowerCase() || "";
  let el = document.getElementById("list");
  el.innerHTML = "";
  
  const articlesRef = collection(db, "articles");
  const articlesQuery = query(articlesRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(articlesQuery);
  
  let articles = [];
  querySnapshot.forEach((doc) => {
    articles.push({ id: doc.id, ...doc.data() });
  });

  let filtered = articles.filter(a => a.title.toLowerCase().includes(q));
  document.getElementById("count").innerText = `${filtered.length} artikel ditemukan`;
  
  filtered.forEach(a => {
    el.innerHTML += `
      <div class="card" onclick="openDetail('${a.id}')">
        <div class="thumb"><span>📚</span></div>
        <div class="p16">
          <h3 class="title">${a.title}</h3>
          <p class="desc">${a.desc}</p>
        </div>
      </div>
    `;
  });

  renderTeam();
}
window.renderList = loadArticles;

// ========================
//   OPEN DETAIL
// ========================
async function openDetail(id) {
  const docRef = doc(db, "articles", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const a = docSnap.data();

    // 🔥 Increment views
    await updateDoc(docRef, { views: increment(1) });

    document.getElementById("d-title").innerText = a.title;
    document.getElementById("d-meta").innerText = `Dilihat ${(a.views || 0) + 1} kali`;
    document.getElementById("d-thumb").innerHTML = "<span>📚</span>";
    document.getElementById("d-content").innerHTML = a.content;
    go("detail");

    // refresh trending supaya ikut update views
    renderTrending();
  } else {
    console.log("No such document!");
  }
}
window.openDetail = openDetail;

// ========================
//   TEAM
// ========================
function renderTeam() {
  let el = document.getElementById("teamGrid");
  el.innerHTML = "";
  team.forEach(member => {
    el.innerHTML += `
      <div class="team-card">
        <div class="avatar">
          <span class="initials">${member.name.charAt(0)}</span>
        </div>
        <div class="info">
          <h3 class="title" style="margin-top:0">${member.name}</h3>
          <p class="role">${member.role}</p>
          <p class="desc" style="font-size:14px">${member.bio}</p>
        </div>
      </div>
    `;
  });
}

// ========================
//   GLOBAL
// ========================
window.go = go;
window.saveArticle = saveArticle;
