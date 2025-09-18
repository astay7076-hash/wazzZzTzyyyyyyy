/* script.js — login + UI + simple data handling + petal animation (canvas) */

/* ---------- credentials (front-end demo only) ---------- */
const CORRECT_USERNAME = "wazz465";
const CORRECT_PASSWORD = "kireikotomine911";

/* ---------- DOM ---------- */
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');
const btnLogin = document.getElementById('btnLogin');
const btnLogout = document.getElementById('btnLogout');
const modal = document.getElementById('modal');
const loginForm = document.getElementById('loginForm');
const cancel = document.getElementById('cancel');

const lockedArea = document.getElementById('lockedArea');
const dataContent = document.getElementById('dataContent');

const namaEl = document.getElementById('nama');
const nisEl = document.getElementById('nis');
const emailEl = document.getElementById('email');
const miniProfile = document.getElementById('miniProfile');
const statusEl = document.getElementById('status');

const editBtn = document.getElementById('editBtn');
const editForm = document.getElementById('editForm');
const inpNama = document.getElementById('inpNama');
const inpNis = document.getElementById('inpNis');
const inpEmail = document.getElementById('inpEmail');
const saveData = document.getElementById('saveData');
const cancelEdit = document.getElementById('cancelEdit');

const projectsBox = document.getElementById('projects');
const addProj = document.getElementById('addProj');

/* ---------- simple data model (localStorage) ---------- */
const DEFAULT_PROFILE = {
  nama: "Wazz Example",
  nis: "123456789",
  email: "wazz@example.com",
  bio: "Siswa SMK kelas 10 RPL. Hobi coding dan anime."
};
let profile = JSON.parse(localStorage.getItem('rp_profile')) || DEFAULT_PROFILE;
let projects = JSON.parse(localStorage.getItem('rp_projects')) || [
  {title:"Website Sekolah", description:"HTML/CSS - Halaman sekolah statis", status:"Selesai"},
  {title:"CRUD JS", description:"Latihan CRUD dengan localStorage", status:"Dalam Proses"}
];

/* ---------- routing (tabs) ---------- */
tabs.forEach(t => {
  t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    panels.forEach(p => p.classList.remove('active'));
    document.getElementById(t.dataset.target).classList.add('active');
  });
});

/* ---------- modal handling ---------- */
btnLogin.addEventListener('click', () => modal.classList.remove('hidden'));
cancel.addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.classList.add('hidden');
});

/* ---------- login logic ---------- */
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value;
  if (u === CORRECT_USERNAME && p === CORRECT_PASSWORD) {
    sessionStorage.setItem('loggedIn', 'true');
    modal.classList.add('hidden');
    onLogin();
  } else {
    flashMessage('Username atau password salah', true);
    shake(modal.querySelector('.modal-card'));
  }
});

function onLogin(){
  btnLogin.classList.add('hidden');
  btnLogout.classList.remove('hidden');
  lockedArea.classList.add('hidden');
  dataContent.classList.remove('hidden');
  populateProfile();
  populateProjects();
  statusEl.innerText = "Logged in";
  miniProfile.innerText = profile.bio;
  coolFlash();
}

btnLogout.addEventListener('click', () => {
  sessionStorage.removeItem('loggedIn');
  btnLogin.classList.remove('hidden');
  btnLogout.classList.add('hidden');
  lockedArea.classList.remove('hidden');
  dataContent.classList.add('hidden');
  statusEl.innerText = "Pengunjung";
  miniProfile.innerText = "Silakan login untuk melihat data lengkap.";
  flashMessage('Anda telah logout');
});

/* restore session */
if (sessionStorage.getItem('loggedIn') === 'true') onLogin();

/* ---------- profile edit ---------- */
editBtn && editBtn.addEventListener('click', () => {
  inpNama.value = profile.nama;
  inpNis.value = profile.nis;
  inpEmail.value = profile.email;
  editForm.classList.remove('hidden');
});
cancelEdit && cancelEdit.addEventListener('click', () => editForm.classList.add('hidden'));
saveData && saveData.addEventListener('click', () => {
  profile.nama = inpNama.value || profile.nama;
  profile.nis = inpNis.value || profile.nis;
  profile.email = inpEmail.value || profile.email;
  localStorage.setItem('rp_profile', JSON.stringify(profile));
  populateProfile();
  editForm.classList.add('hidden');
  flashMessage('Data tersimpan');
});

/* ---------- projects ---------- */
function populateProjects(){
  projectsBox.innerHTML = '';
  projects.forEach((pr,idx) => {
    const el = document.createElement('div');
    el.className = 'project-card';
    el.innerHTML = `
      <h4>${escapeHtml(pr.title)}</h4>
      <p>${escapeHtml(pr.description)}</p>
      <small>Status: ${escapeHtml(pr.status)}</small>
      <div style="margin-top:8px">
        <button data-idx="${idx}" class="small-btn edit-proj">Edit</button>
        <button data-idx="${idx}" class="small-btn" style="margin-left:8px" onclick="deleteProj(${idx})">Hapus</button>
      </div>
    `;
    projectsBox.appendChild(el);
  });

  // attach edit handlers
  document.querySelectorAll('.edit-proj').forEach(b => {
    b.addEventListener('click', (ev) => {
      const i = ev.target.dataset.idx;
      const title = prompt('Judul projek', projects[i].title);
      if (title === null) return;
      const desc = prompt('Deskripsi', projects[i].description);
      const status = prompt('Status', projects[i].status);
      projects[i] = {title: title || projects[i].title, description: desc || projects[i].description, status: status || projects[i].status};
      saveProjects();
      populateProjects();
    });
  });
}

function deleteProj(i){
  if (!confirm('Hapus projek ini?')) return;
  projects.splice(i,1);
  saveProjects();
  populateProjects();
}

addProj && addProj.addEventListener('click', () => {
  const title = prompt('Judul projek baru');
  if (!title) return;
  const description = prompt('Deskripsi singkat') || '';
  projects.push({title, description, status:'Baru'});
  saveProjects();
  populateProjects();
});

function saveProjects(){ localStorage.setItem('rp_projects', JSON.stringify(projects)); }

/* ---------- helpers ---------- */
function populateProfile(){
  namaEl.innerText = profile.nama;
  nisEl.innerText = profile.nis;
  emailEl.innerText = profile.email;
  miniProfile.innerText = profile.bio;
}

/* small UI helpers */
function flashMessage(text, isError = false){
  // simple toast
  const t = document.createElement('div');
  t.style.position = 'fixed';t.style.right='20px';t.style.bottom='20px';t.style.padding='12px 16px';
  t.style.borderRadius='10px';t.style.background = isError? 'rgba(255,60,80,0.95)':'rgba(0,200,255,0.12)';
  t.style.color = isError? '#fff' : '#eaffff';
  t.style.zIndex = 9999; t.innerText = text;
  document.body.appendChild(t);
  setTimeout(()=> t.style.transform = 'translateY(-8px)', 50);
  setTimeout(()=> t.remove(), 2600);
}

function shake(el){
  el.animate([{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(-4px)'},{transform:'translateX(0)'}], {duration:420});
}
function coolFlash(){
  const el = document.querySelector('.brand .logo-stamp');
  if (!el) return;
  el.animate([{boxShadow:'0 0 0px rgba(0,240,255,0)'},{boxShadow:'0 0 26px rgba(0,240,255,0.22)'},{boxShadow:'0 0 0px rgba(0,240,255,0)'}], {duration:900});
}

/* escape html to avoid injection in prompts */
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }

/* ---------- simple petal canvas animation ---------- */
(function petalAnim(){
  const canvas = document.getElementById('petalCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, petals = [];

  function resize(){ W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize);
  resize();

  function rand(a,b){ return a + Math.random()*(b-a); }

  class Petal {
    constructor(){
      this.reset();
    }
    reset(){
      this.x = rand(-W*0.2, W*1.1);
      this.y = rand(-50, -10);
      this.size = rand(6, 20);
      this.speed = rand(0.3, 1.6);
      this.rot = rand(0, Math.PI*2);
      this.drift = rand(-0.4, 0.8);
      this.opacity = rand(0.2,0.9);
      this.color = `rgba(255,${120+Math.floor(rand(10,80))},${180+Math.floor(rand(0,60))},${this.opacity})`;
    }
    update(){
      this.y += this.speed;
      this.x += this.drift + Math.sin(this.y/60)*0.6;
      this.rot += 0.02;
      if (this.y > H + 30) this.reset();
    }
    draw(){
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size*0.6, this.size, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i=0;i<60;i++) petals.push(new Petal());

  function frame(){
    ctx.clearRect(0,0,W,H);
    // subtle vignette
    for (let p of petals){ p.update(); p.draw(); }
    requestAnimationFrame(frame);
  }
  frame();
})();

/* ---------- small accessibility: open modal with "L" ---------- */
document.addEventListener('keydown', e => {
  if (e.key.toLowerCase() === 'l') {
    if (sessionStorage.getItem('loggedIn') !== 'true') modal.classList.remove('hidden');
  }
});
