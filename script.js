const QURAN_URL = "https://raw.githubusercontent.com/amrayn/quran-text/main/quran-full-tashkeel.json";

const SURAH_NAMES = [
  [1,"الفاتحة"],[2,"البقرة"],[3,"آل عمران"],[4,"النساء"],[5,"المائدة"],[6,"الأنعام"],[7,"الأعراف"],[8,"الأنفال"],[9,"التوبة"],[10,"يونس"],
  [11,"هود"],[12,"يوسف"],[13,"الرعد"],[14,"إبراهيم"],[15,"الحجر"],[16,"النحل"],[17,"الإسراء"],[18,"الكهف"],[19,"مريم"],[20,"طه"],
  [21,"الأنبياء"],[22,"الحج"],[23,"المؤمنون"],[24,"النور"],[25,"الفرقان"],[26,"الشعراء"],[27,"النمل"],[28,"القصص"],[29,"العنكبوت"],[30,"الروم"],
  [31,"لقمان"],[32,"السجدة"],[33,"الأحزاب"],[34,"سبأ"],[35,"فاطر"],[36,"يس"],[37,"الصافات"],[38,"ص"],[39,"الزمر"],[40,"غافر"],
  [41,"فصلت"],[42,"الشورى"],[43,"الزخرف"],[44,"الدخان"],[45,"الجاثية"],[46,"الأحقاف"],[47,"محمد"],[48,"الفتح"],[49,"الحجرات"],[50,"ق"],
  [51,"الذاريات"],[52,"الطور"],[53,"النجم"],[54,"القمر"],[55,"الرحمن"],[56,"الواقعة"],[57,"الحديد"],[58,"المجادلة"],[59,"الحشر"],[60,"الممتحنة"],
  [61,"الصف"],[62,"الجمعة"],[63,"المنافقون"],[64,"التغابن"],[65,"الطلاق"],[66,"التحريم"],[67,"الملك"],[68,"القلم"],[69,"الحاقة"],[70,"المعارج"],
  [71,"نوح"],[72,"الجن"],[73,"المزمل"],[74,"المدثر"],[75,"القيامة"],[76,"الإنسان"],[77,"المرسلات"],[78,"النبأ"],[79,"النازعات"],[80,"عبس"],
  [81,"التكوير"],[82,"الانفطار"],[83,"المطففين"],[84,"الانشقاق"],[85,"البروج"],[86,"الطارق"],[87,"الأعلى"],[88,"الغاشية"],[89,"الفجر"],[90,"البلد"],
  [91,"الشمس"],[92,"الليل"],[93,"الضحى"],[94,"الشرح"],[95,"التين"],[96,"العلق"],[97,"القدر"],[98,"البينة"],[99,"الزلزلة"],[100,"العاديات"],
  [101,"القارعة"],[102,"التكاثر"],[103,"العصر"],[104,"الهمزة"],[105,"الفيل"],[106,"قريش"],[107,"الماعون"],[108,"الكوثر"],[109,"الكافرون"],[110,"النصر"],
  [111,"المسد"],[112,"الإخلاص"],[113,"الفلق"],[114,"الناس"]
];

const prayerData = [
  ["الفجر","04:20 ص"],
  ["الشروق","06:03 ص"],
  ["الظهر","01:00 م"],
  ["العصر","04:37 م"],
  ["المغرب","07:58 م"],
  ["العشاء","09:29 م"]
];

const tasksList = [
  { id:"fajr", label:"صلاة الفجر" },
  { id:"dhuhr", label:"صلاة الظهر" },
  { id:"asr", label:"صلاة العصر" },
  { id:"maghrib", label:"صلاة المغرب" },
  { id:"isha", label:"صلاة العشاء" },
  { id:"quran", label:"قراءة القرآن" },
  { id:"adhkar", label:"الأذكار" }
];

const el = {
  hasanat: document.getElementById("hasanat"),
  prayerTimes: document.getElementById("prayerTimes"),
  prayerDate: document.getElementById("prayerDate"),
  tasks: document.getElementById("tasks"),
  surahList: document.getElementById("surahList"),
  searchSurah: document.getElementById("searchSurah"),
  surahTitle: document.getElementById("surahTitle"),
  surahMeta: document.getElementById("surahMeta"),
  ayahs: document.getElementById("ayahs"),
  prevSurah: document.getElementById("prevSurah"),
  nextSurah: document.getElementById("nextSurah"),
  loadSurahBtn: document.getElementById("loadSurahBtn"),
  saveProgress: document.getElementById("saveProgress"),
  resetTasks: document.getElementById("resetTasks"),
  refreshPrayers: document.getElementById("refreshPrayers"),
  enableNotifs: document.getElementById("enableNotifs"),
  notifStatus: document.getElementById("notifStatus"),
  toast: document.getElementById("toast")
};

const state = {
  selected: 1,
  hasanat: Number(localStorage.getItem("hasanat") || 0),
  tasks: JSON.parse(localStorage.getItem("tasks") || "{}"),
  notifEnabled: localStorage.getItem("notifEnabled") === "true",
  cache: {}
};

tasksList.forEach(t => {
  if (typeof state.tasks[t.id] !== "boolean") state.tasks[t.id] = false;
});

function toast(msg){
  el.toast.textContent = msg;
  el.toast.classList.add("show");
  clearTimeout(window.tt);
  window.tt = setTimeout(() => el.toast.classList.remove("show"), 1800);
}

function saveLocal(){
  localStorage.setItem("hasanat", String(state.hasanat));
  localStorage.setItem("tasks", JSON.stringify(state.tasks));
  localStorage.setItem("notifEnabled", String(state.notifEnabled));
}

function renderScore(){
  el.hasanat.textContent = state.hasanat;
}

function renderPrayerDate(){
  el.prayerDate.textContent = new Date().toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function renderPrayers(){
  el.prayerTimes.innerHTML = prayerData.map(([name, time]) => `
    <div class="prayerItem"><span>${name}</span><strong>${time}</strong></div>
  `).join("");
}

function renderTasks(){
  el.tasks.innerHTML = tasksList.map(task => `
    <div class="taskItem">
      <label>
        <input type="checkbox" data-task="${task.id}" ${state.tasks[task.id] ? "checked" : ""}>
        <span>${task.label}</span>
      </label>
      <button class="btn ghost" data-add="${task.id}">+1</button>
    </div>
  `).join("");

  document.querySelectorAll("[data-task]").forEach(cb => {
    cb.addEventListener("change", e => toggleTask(e.target.dataset.task, e.target.checked));
  });

  document.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", e => toggleTask(e.currentTarget.dataset.add, true, true));
  });
}

function toggleTask(id, checked, forceAdd = false){
  const was = state.tasks[id];
  state.tasks[id] = checked;

  if ((checked && !was) || forceAdd) {
    state.hasanat += 1;
    toast("جزاك الله خيرًا 🌷");
  }

  if (!checked && was && !forceAdd) {
    state.hasanat = Math.max(0, state.hasanat - 1);
  }

  sync();
}

function sync(){
  saveLocal();
  renderScore();
  renderTasks();
  updateNotifUI();
}

function renderSurahList(){
  const q = el.searchSurah.value.trim().toLowerCase();
  const items = SURAH_NAMES.filter(([n, name]) =>
    String(n).includes(q) || name.toLowerCase().includes(q)
  );

  el.surahList.innerHTML = items.map(([n, name]) => `
    <div class="surahItem ${state.selected === n ? "active" : ""}" data-num="${n}">
      <span>${n} - ${name}</span>
      <strong>›</strong>
    </div>
  `).join("");

  document.querySelectorAll(".surahItem").forEach(item => {
    item.addEventListener("click", () => {
      state.selected = Number(item.dataset.num);
      renderSurahList();
      loadSurah();
    });
  });
}

function selectedName(){
  return SURAH_NAMES.find(([n]) => n === state.selected)?.[1] || "";
}

async function fetchQuran(){
  if (state.cache.quran) return state.cache.quran;
  const res = await fetch(QURAN_URL);
  if (!res.ok) throw new Error("fetch failed");
  const data = await res.json();
  state.cache.quran = data;
  return data;
}

function getSurahFromQuran(data, number){
  return data.find(surah => Number(surah.id) === Number(number));
}

function renderAyahs(surah){
  el.ayahs.innerHTML = surah.verses.map(v => `
    <div class="ayah">
      <strong>آية ${v.id}</strong>
      <p>${v.text}</p>
    </div>
  `).join("");
}

async function loadSurah(){
  el.surahTitle.textContent = `سورة ${selectedName()}`;
  el.surahMeta.textContent = "جارٍ الجلب...";
  el.ayahs.innerHTML = "";

  try{
    const quran = await fetchQuran();
    const surah = getSurahFromQuran(quran, state.selected);
    if (!surah) throw new Error("surah not found");

    renderAyahs(surah);
    el.surahMeta.textContent = `تم تحميل سورة ${surah.name} - عدد الآيات: ${surah.total_verses}`;
    state.hasanat += 1;
    sync();
  }catch{
    el.surahMeta.textContent = "تعذر جلب السورة. تأكد من تشغيل الموقع على localhost أو HTTPS.";
  }
}

function moveSurah(step){
  state.selected += step;
  if (state.selected < 1) state.selected = 114;
  if (state.selected > 114) state.selected = 1;
  renderSurahList();
  loadSurah();
}

function updateNotifUI(){
  if (!("Notification" in window)) {
    el.notifStatus.textContent = "المتصفح لا يدعم الإشعارات.";
    el.enableNotifs.textContent = "الإشعارات غير مدعومة";
    el.enableNotifs.disabled = true;
    return;
  }

  const p = Notification.permission;

  if (p === "granted") {
    el.notifStatus.textContent = "الإشعارات مفعلة ومسموح بها.";
    el.enableNotifs.textContent = "الإشعارات مفعلة";
    el.enableNotifs.disabled = true;
  } else if (p === "denied") {
    el.notifStatus.textContent = "الإشعارات محجوبة من المتصفح. فعّلها من إعدادات الموقع.";
    el.enableNotifs.textContent = "الإشعارات محجوبة";
    el.enableNotifs.disabled = true;
  } else {
    el.notifStatus.textContent = "الإشعارات غير مفعلة بعد. اضغط للطلب.";
    el.enableNotifs.textContent = "تفعيل الإشعارات";
    el.enableNotifs.disabled = false;
  }
}

async function enableNotifications(){
  if (!("Notification" in window)) {
    toast("المتصفح لا يدعم الإشعارات");
    return;
  }

  if (Notification.permission === "granted") {
    state.notifEnabled = true;
    saveLocal();
    updateNotifUI();
    toast("الإشعارات مفعلة بالفعل ✅");
    return;
  }

  if (Notification.permission === "denied") {
    updateNotifUI();
    toast("الإشعارات محجوبة من إعدادات المتصفح");
    return;
  }

  const perm = await Notification.requestPermission();
  updateNotifUI();

  if (perm === "granted") {
    state.notifEnabled = true;
    saveLocal();
    toast("تم تفعيل الإشعارات ✅");
    new Notification("تم تفعيل الإشعارات", {
      body: "سيصلك تنبيه من الموقع."
    });
  } else {
    toast("لم يتم السماح بالإشعارات");
  }
}

el.searchSurah.addEventListener("input", renderSurahList);
el.prevSurah.addEventListener("click", () => moveSurah(-1));
el.nextSurah.addEventListener("click", () => moveSurah(1));
el.loadSurahBtn.addEventListener("click", loadSurah);
el.saveProgress.addEventListener("click", () => { sync(); toast("تم حفظ التقدم ✅"); });
el.resetTasks.addEventListener("click", () => {
  state.tasks = Object.fromEntries(tasksList.map(t => [t.id, false]));
  sync();
  toast("تمت إعادة المهام ✅");
});
el.refreshPrayers.addEventListener("click", () => {
  renderPrayers();
  renderPrayerDate();
  toast("تم تحديث المواقيت");
});
el.enableNotifs.addEventListener("click", enableNotifications);

renderScore();
renderPrayerDate();
renderPrayers();
renderTasks();
renderSurahList();
updateNotifUI();
loadSurah();