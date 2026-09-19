/* Ders Dağılım Sistemi - localStorage tabanlı, bağımlılıksız */
const KEY = 'dersplan.v1';
const uid = () => Math.random().toString(36).slice(2, 10);

const defaults = () => ({
  settings: { days: ['Pazartesi','Salı','Çarşamba','Perşembe','Cuma'], periods: 8 },
  rooms: [], teachers: [], classes: [], lessons: [], schedule: null
});

let S = load();
function load() {
  try { return Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY)) || {}); }
  catch { return defaults(); }
}
function save() { localStorage.setItem(KEY, JSON.stringify(S)); }
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2400);
}
const D = () => S.settings.days;
const P = () => S.settings.periods;
const slotCount = () => D().length * P();
const slotIdx = (d, p) => d * P() + p;
const byId = (arr, id) => arr.find(x => x.id === id);

/* ---------- Navigasyon ---------- */
document.querySelectorAll('.tab').forEach(btn => btn.onclick = () => {
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b === btn));
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  document.getElementById('view-' + btn.dataset.view).classList.remove('hidden');
  if (btn.dataset.view === 'schedule') renderSchedule();
});

/* ---------- Tema ---------- */
const applyTheme = t => document.documentElement.dataset.theme = t;
applyTheme(localStorage.getItem('dersplan.theme') || 'dark');
document.getElementById('btnTheme').onclick = () => {
  const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(t); localStorage.setItem('dersplan.theme', t);
};

/* ---------- Derslikler ---------- */
document.getElementById('formRoom').onsubmit = e => {
  e.preventDefault();
  const f = new FormData(e.target);
  S.rooms.push({ id: uid(), name: f.get('name').trim(), capacity: +f.get('capacity'), type: f.get('type') });
  save(); e.target.reset(); renderRooms(); toast('Derslik eklendi');
};
function renderRooms() {
  const tb = document.querySelector('#tblRooms tbody');
  tb.innerHTML = '';
  S.rooms.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${esc(r.name)}</td><td>${r.capacity}</td><td>${typeLabel(r.type)}</td>`;
    const td = document.createElement('td');
    const b = mini('Sil', () => { S.rooms = S.rooms.filter(x => x.id !== r.id); save(); renderAll(); });
    td.appendChild(b); tr.appendChild(td); tb.appendChild(tr);
  });
  document.getElementById('roomCount').textContent = S.rooms.length;
}
const typeLabel = t => ({ normal:'Normal', lab:'Laboratuvar', atolye:'Atölye', spor:'Spor Salonu', any:'Farketmez' }[t] || t);

/* ---------- Öğretmenler ---------- */
function buildAvailGrid() {
  const g = document.getElementById('availGrid');
  g.style.gridTemplateColumns = `70px repeat(${P()}, 1fr)`;
  g.innerHTML = '';
  g.appendChild(cell('', 'head'));
  for (let p = 0; p < P(); p++) g.appendChild(cell(p + 1, 'head'));
  D().forEach((day, d) => {
    g.appendChild(cell(day.slice(0, 3), 'head'));
    for (let p = 0; p < P(); p++) {
      const c = cell('', '');
      c.dataset.slot = slotIdx(d, p);
      c.onclick = () => c.classList.toggle('off');
      g.appendChild(c);
    }
  });
  function cell(txt, cls) { const el = document.createElement('div'); el.className = 'cell ' + cls; el.textContent = txt; return el; }
}
document.getElementById('formTeacher').onsubmit = e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const busy = [...document.querySelectorAll('#availGrid .cell.off')].map(c => +c.dataset.slot);
  S.teachers.push({
    id: uid(), name: f.get('name').trim(), branch: f.get('branch').trim(),
    maxHours: +f.get('maxHours'), maxDaily: +f.get('maxDaily'),
    busy, note: f.get('note').trim()
  });
  save(); e.target.reset(); buildAvailGrid(); renderTeachers(); renderSelects(); toast('Öğretmen eklendi');
};
function renderTeachers() {
  const L = document.getElementById('teacherList'); L.innerHTML = '';
  S.teachers.forEach(t => {
    const load = S.lessons.filter(l => l.teacherId === t.id).reduce((a, l) => a + l.hours, 0);
    const el = document.createElement('div'); el.className = 'item';
    el.innerHTML = `<div class="row"><div>
        <div class="name">${esc(t.name)}</div>
        <div class="meta">${esc(t.branch)} · Yük: ${load}/${t.maxHours} sa · Günlük maks ${t.maxDaily}
          ${t.busy.length ? ' · ' + t.busy.length + ' kapalı saat' : ''}</div>
        ${t.note ? `<div class="meta">📌 ${esc(t.note)}</div>` : ''}
      </div></div>`;
    const btn = mini('Sil', () => {
      S.teachers = S.teachers.filter(x => x.id !== t.id);
      S.lessons = S.lessons.filter(l => l.teacherId !== t.id);
      save(); renderAll();
    });
    el.querySelector('.row').appendChild(btn);
    if (load > t.maxHours) el.querySelector('.meta').innerHTML += ' <b style="color:var(--danger)">⚠ limit aşımı</b>';
    L.appendChild(el);
  });
  document.getElementById('teacherCount').textContent = S.teachers.length;
}

/* ---------- Sınıflar & dersler ---------- */
document.getElementById('formClass').onsubmit = e => {
  e.preventDefault();
  const f = new FormData(e.target);
  S.classes.push({ id: uid(), name: f.get('name').trim(), students: +f.get('students') });
  save(); e.target.reset(); renderClasses(); renderSelects(); toast('Sınıf eklendi');
};
document.getElementById('formLesson').onsubmit = e => {
  e.preventDefault();
  const f = new FormData(e.target);
  S.lessons.push({
    id: uid(), classId: f.get('classId'), teacherId: f.get('teacherId'),
    subject: f.get('subject').trim(), hours: +f.get('hours'),
    roomType: f.get('roomType'), block: !!f.get('block')
  });
  save(); e.target.querySelector('[name=subject]').value = '';
  renderClasses(); renderTeachers(); toast('Ders eklendi');
};
function renderSelects() {
  fill('lessonClass', S.classes, c => `${c.name} (${c.students} öğr.)`);
  fill('lessonTeacher', S.teachers, t => `${t.name} — ${t.branch}`);
  function fill(id, arr, lbl) {
    const s = document.getElementById(id), old = s.value;
    s.innerHTML = arr.map(x => `<option value="${x.id}">${esc(lbl(x))}</option>`).join('');
    if (arr.some(x => x.id === old)) s.value = old;
  }
}
function renderClasses() {
  const L = document.getElementById('classList'); L.innerHTML = '';
  S.classes.forEach(c => {
    const ls = S.lessons.filter(l => l.classId === c.id);
    const total = ls.reduce((a, l) => a + l.hours, 0);
    const el = document.createElement('div'); el.className = 'item';
    el.innerHTML = `<div class="row"><div>
        <div class="name">${esc(c.name)}</div>
        <div class="meta">${c.students} öğrenci · Toplam ${total}/${slotCount()} saat
          ${total > slotCount() ? '<b style="color:var(--danger)">⚠ kapasite aşımı</b>' : ''}</div>
      </div></div><div class="chips"></div>`;
    el.querySelector('.row').appendChild(mini('Sil', () => {
      S.classes = S.classes.filter(x => x.id !== c.id);
      S.lessons = S.lessons.filter(l => l.classId !== c.id);
      save(); renderAll();
    }));
    const chips = el.querySelector('.chips');
    ls.forEach(l => {
      const t = byId(S.teachers, l.teacherId);
      const chip = document.createElement('span'); chip.className = 'chip';
      chip.innerHTML = `<b>${esc(l.subject)}</b> ${l.hours}sa · ${esc(t ? t.name : '—')}${l.roomType !== 'any' ? ' · ' + typeLabel(l.roomType) : ''}`;
      const x = document.createElement('span'); x.className = 'x'; x.textContent = '×';
      x.onclick = () => { S.lessons = S.lessons.filter(z => z.id !== l.id); save(); renderAll(); };
      chip.appendChild(x); chips.appendChild(chip);
    });
    L.appendChild(el);
  });
}

/* ---------- Ayarlar ---------- */
const fs = document.getElementById('formSettings');
fs.days.value = D().join(','); fs.periods.value = P();
fs.onsubmit = e => {
  e.preventDefault();
  const days = fs.days.value.split(',').map(s => s.trim()).filter(Boolean);
  if (!days.length) return toast('En az bir gün girin');
  S.settings = { days, periods: +fs.periods.value };
  S.schedule = null;
  S.teachers.forEach(t => t.busy = t.busy.filter(i => i < slotCount()));
  save(); buildAvailGrid(); renderAll(); toast('Ayarlar kaydedildi');
};
document.getElementById('btnReset').onclick = () => {
  if (!confirm('Tüm veriler (derslik, öğretmen, sınıf, program) kalıcı olarak silinecek. Emin misiniz?')) return;
  S = defaults(); save(); fs.days.value = D().join(','); fs.periods.value = P();
  buildAvailGrid(); renderAll(); toast('Veriler silindi');
};

/* ---------- Dışa / içe aktar ---------- */
document.getElementById('btnExport').onclick = () => {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'ders-plani-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click(); URL.revokeObjectURL(a.href);
};
document.getElementById('btnImport').onclick = () => document.getElementById('fileImport').click();
document.getElementById('fileImport').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      S = Object.assign(defaults(), JSON.parse(r.result));
      save(); fs.days.value = D().join(','); fs.periods.value = P();
      buildAvailGrid(); renderAll(); toast('Veriler içe aktarıldı');
    } catch { toast('Geçersiz dosya'); }
  };
  r.readAsText(f); e.target.value = '';
};

/* ---------- Yerleştirme algoritması ---------- */
function generate() {
  const N = slotCount(), warn = [];
  if (!S.classes.length || !S.lessons.length) return { ok: false, warn: ['Önce sınıf ve ders ekleyin.'] };
  if (!S.rooms.length) return { ok: false, warn: ['Önce derslik ekleyin.'] };

  // Her ders saatini ayrı bir "birim"e böl; blok istenenleri 2'li grupla
  const units = [];
  for (const l of S.lessons) {
    let left = l.hours;
    while (left > 0) {
      const len = (l.block && left >= 2) ? 2 : 1;
      units.push({ lesson: l, len }); left -= len;
    }
  }

  const busyClass = {}, busyTeacher = {}, busyRoom = {}, dailyTeacher = {}, dailyClassSubj = {};
  S.classes.forEach(c => busyClass[c.id] = new Array(N).fill(null));
  S.teachers.forEach(t => { busyTeacher[t.id] = new Array(N).fill(null); dailyTeacher[t.id] = new Array(D().length).fill(0); });
  S.rooms.forEach(r => busyRoom[r.id] = new Array(N).fill(null));
  S.classes.forEach(c => dailyClassSubj[c.id] = {});

  // Uygun derslikleri önceden hesapla (kapasite + tür)
  const roomsFor = {};
  for (const l of S.lessons) {
    const cls = byId(S.classes, l.classId);
    roomsFor[l.id] = S.rooms
      .filter(r => r.capacity >= cls.students && (l.roomType === 'any' || r.type === l.roomType))
      .sort((a, b) => a.capacity - b.capacity); // en uygun (az israf) önce
    if (!roomsFor[l.id].length)
      warn.push(`${cls.name} / ${l.subject}: ${cls.students} öğrenciye uygun ${l.roomType !== 'any' ? typeLabel(l.roomType) + ' ' : ''}derslik yok.`);
  }

  // En kısıtlı birimler önce (az derslik seçeneği, blok, öğretmeni yoğun)
  units.sort((a, b) => {
    const ra = roomsFor[a.lesson.id].length, rb = roomsFor[b.lesson.id].length;
    if (ra !== rb) return ra - rb;
    return b.len - a.len;
  });

  const placed = [];
  let steps = 0, LIMIT = 300000, best = [];

  function canPlace(u, d, p) {
    const l = u.lesson, t = byId(S.teachers, l.teacherId);
    if (p + u.len > P()) return null;
    for (let k = 0; k < u.len; k++) {
      const i = slotIdx(d, p + k);
      if (busyClass[l.classId][i]) return null;
      if (t && (busyTeacher[t.id][i] || t.busy.includes(i))) return null;
    }
    if (t) {
      if (dailyTeacher[t.id][d] + u.len > t.maxDaily) return null;
      const used = placed.filter(x => x.lesson.teacherId === t.id).reduce((a, x) => a + x.len, 0);
      if (used + u.len > t.maxHours) return null;
    }
    // aynı gün aynı ders 2 saatten fazla olmasın (blok hariç)
    const key = l.id, cur = dailyClassSubj[l.classId][d + '|' + key] || 0;
    if (cur + u.len > 2) return null;
    for (const r of roomsFor[l.id]) {
      let free = true;
      for (let k = 0; k < u.len; k++) if (busyRoom[r.id][slotIdx(d, p + k)]) { free = false; break; }
      if (free) return r;
    }
    return null;
  }
  function apply(u, d, p, room, on) {
    const l = u.lesson, t = byId(S.teachers, l.teacherId);
    for (let k = 0; k < u.len; k++) {
      const i = slotIdx(d, p + k);
      busyClass[l.classId][i] = on ? { lessonId: l.id, roomId: room.id } : null;
      if (t) busyTeacher[t.id][i] = on ? l.id : null;
      busyRoom[room.id][i] = on ? l.id : null;
    }
    if (t) dailyTeacher[t.id][d] += on ? u.len : -u.len;
    const kk = d + '|' + l.id;
    dailyClassSubj[l.classId][kk] = (dailyClassSubj[l.classId][kk] || 0) + (on ? u.len : -u.len);
  }

  function solve(idx) {
    if (placed.length > best.length) best = placed.slice();
    if (idx >= units.length) return true;
    if (++steps > LIMIT) return false;
    const u = units[idx];
    if (!roomsFor[u.lesson.id].length) return solve(idx + 1); // yerleştirilemez, atla
    // Günleri o sınıf için en boş olandan başlat → dengeli dağılım
    const dayOrder = D().map((_, d) => d).sort((a, b) =>
      dayLoad(u.lesson.classId, a) - dayLoad(u.lesson.classId, b) || a - b);
    for (const d of dayOrder) {
      for (let p = 0; p < P(); p++) {
        const room = canPlace(u, d, p);
        if (!room) continue;
        apply(u, d, p, room, true);
        placed.push({ ...u, d, p, room });
        if (solve(idx + 1)) return true;
        placed.pop(); apply(u, d, p, room, false);
      }
    }
    return false;
  }
  function dayLoad(classId, d) {
    let n = 0;
    for (let p = 0; p < P(); p++) if (busyClass[classId][slotIdx(d, p)]) n++;
    return n;
  }

  const full = solve(0);
  // Çözüm bulunamadıysa arama boyunca ulaşılan en dolu yerleşimi kullan
  const result = full ? placed : best;
  const assigned = [];
  result.forEach(x => {
    for (let k = 0; k < x.len; k++)
      assigned.push({ slot: slotIdx(x.d, x.p + k), lessonId: x.lesson.id, roomId: x.room.id });
  });

  // Yerleşmeyenleri raporla
  const needed = {}; S.lessons.forEach(l => needed[l.id] = l.hours);
  assigned.forEach(a => needed[a.lessonId]--);
  for (const l of S.lessons) {
    if (needed[l.id] > 0) {
      const c = byId(S.classes, l.classId);
      warn.push(`${c.name} / ${l.subject}: ${needed[l.id]} saat yerleştirilemedi.`);
    }
  }
  if (!full && steps > LIMIT) warn.push('Arama sınırına ulaşıldı; bulunabilen en dolu kısmi program gösteriliyor.');

  S.schedule = assigned; save();
  return { ok: !warn.length, warn };
}

document.getElementById('btnGenerate').onclick = () => {
  const t0 = performance.now();
  const res = generate();
  const rep = document.getElementById('genReport');
  rep.classList.remove('hidden');
  const ms = Math.round(performance.now() - t0);
  if (res.ok) { rep.className = 'report ok'; rep.innerHTML = `✅ Program başarıyla oluşturuldu (${ms} ms). Tüm dersler yerleştirildi.`; }
  else { rep.className = 'report'; rep.innerHTML = `⚠️ Program oluşturuldu (${ms} ms) ancak sorunlar var:<ul>${res.warn.map(w => `<li>${esc(w)}</li>`).join('')}</ul>`; }
  renderSchedule();
};
document.getElementById('btnClearSched').onclick = () => {
  S.schedule = null; save();
  document.getElementById('genReport').classList.add('hidden');
  renderSchedule();
};
document.getElementById('btnPrint').onclick = () => window.print();

/* ---------- Program görünümü ---------- */
const modeSel = document.getElementById('schedMode'), targetSel = document.getElementById('schedTarget');
modeSel.onchange = () => { fillTargets(); drawGrid(); };
targetSel.onchange = drawGrid;

function fillTargets() {
  const m = modeSel.value;
  const arr = m === 'class' ? S.classes : m === 'teacher' ? S.teachers : S.rooms;
  const old = targetSel.value;
  targetSel.innerHTML = arr.map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join('');
  if (arr.some(x => x.id === old)) targetSel.value = old;
}
function renderSchedule() { fillTargets(); drawGrid(); }

function drawGrid() {
  const out = document.getElementById('scheduleOut');
  if (!S.schedule || !S.schedule.length) {
    out.innerHTML = '<p class="meta">Henüz program oluşturulmadı. "Programı Oluştur" ile başlayın.</p>';
    return;
  }
  const id = targetSel.value;
  if (!id) { out.innerHTML = '<p class="meta">Görüntülenecek kayıt yok.</p>'; return; }
  const mode = modeSel.value;
  const cellMap = {};
  for (const a of S.schedule) {
    const l = byId(S.lessons, a.lessonId); if (!l) continue;
    const match = mode === 'class' ? l.classId === id : mode === 'teacher' ? l.teacherId === id : a.roomId === id;
    if (match) cellMap[a.slot] = { l, roomId: a.roomId };
  }
  let h = '<table><thead><tr><th>Saat</th>' + D().map(d => `<th>${esc(d)}</th>`).join('') + '</tr></thead><tbody>';
  for (let p = 0; p < P(); p++) {
    h += `<tr><th>${p + 1}. ders</th>`;
    for (let d = 0; d < D().length; d++) {
      const c = cellMap[slotIdx(d, p)];
      if (!c) { h += '<td></td>'; continue; }
      const cls = byId(S.classes, c.l.classId), t = byId(S.teachers, c.l.teacherId), r = byId(S.rooms, c.roomId);
      const sub = [];
      if (mode !== 'class') sub.push(cls ? cls.name : '—');
      if (mode !== 'teacher') sub.push(t ? t.name : '—');
      if (mode !== 'room') sub.push(r ? r.name : '—');
      h += `<td class="filled"><div class="slot"><div class="s">${esc(c.l.subject)}</div><div class="d">${esc(sub.join(' · '))}</div></div></td>`;
    }
    h += '</tr>';
  }
  out.innerHTML = h + '</tbody></table>';
}

/* ---------- Yardımcılar ---------- */
function mini(txt, fn) { const b = document.createElement('button'); b.className = 'mini ghost'; b.textContent = txt; b.onclick = fn; return b; }
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])); }

function renderAll() { renderRooms(); renderTeachers(); renderClasses(); renderSelects(); renderSchedule(); }
buildAvailGrid(); renderAll();
