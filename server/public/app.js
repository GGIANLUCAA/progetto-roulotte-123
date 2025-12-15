let token = localStorage.getItem('token');

const api = async (url, opts={}) => {
  const res = await fetch(url, { ...opts, headers: { ...(opts.headers||{}), ...(token?{ Authorization: 'Bearer '+token }:{}), 'Content-Type': (opts.body instanceof FormData)?undefined:'application/json' } });
  if (res.status === 401) {
    token = null;
    localStorage.removeItem('token');
    showLogin();
  }
  return res;
};

const el = id => document.getElementById(id);
function show(id){ el('viewOperatore').classList.add('hidden'); el('viewAdmin').classList.add('hidden'); el('viewInfo').classList.add('hidden'); el(id).classList.remove('hidden'); }
function toast(msg){ const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(()=>{ t.remove(); }, 2500); }

function showLogin() { el('viewLogin').classList.remove('hidden'); }

// Init Auth
if (token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    el('rolepill').textContent = payload.role || 'utente';
    el('tokendisp').textContent = payload.name || payload.sub;
  } catch {
    token = null; localStorage.removeItem('token'); showLogin();
  }
} else {
  showLogin();
}

el('loginBtn').onclick = async () => {
  const email = el('loginEmail').value;
  const password = el('loginPass').value;
  try {
    const r = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email, password}) });
    if (r.ok) {
      const j = await r.json();
      token = j.token;
      localStorage.setItem('token', token);
      el('viewLogin').classList.add('hidden');
      window.location.reload();
    } else {
      const j = await r.json();
      el('loginOut').textContent = j.error || 'Errore login';
    }
  } catch(e) {
    el('loginOut').textContent = 'Errore di connessione';
  }
};

el('logoutBtn').onclick = () => {
  token = null;
  localStorage.removeItem('token');
  window.location.reload();
};

async function renderSelected(id) {
  const r = await api(`/api/roulottes/${id}`);
  const item = await r.json();
  if (!item) return;

  // Fill detailed form
  el('d_marca').value = item.marca || '';
  el('d_modello').value = item.modello || '';
  el('d_anno').value = item.anno || '';
  // ... (populate all other fields)

  // Render gallery
  const gallery = el('gallery');
  gallery.innerHTML = '';
  if (item.photos && item.photos.length > 0) {
    item.photos.forEach(photo => {
      const imgContainer = document.createElement('div');
      imgContainer.className = 'gallery-item';
      const img = document.createElement('img');
      img.src = photo.thumb_url || photo.url;
      imgContainer.appendChild(img);
      gallery.appendChild(imgContainer);
    });
  }

  // Set the admin select to the current item
  el('adminSelect').value = id;
}


function updateTabs(activeTab) {
    ['tabOperatore', 'tabAdmin', 'tabInfo'].forEach(tabId => {
        const tab = el(tabId);
        if (tabId === activeTab) {
            tab.classList.remove('btn-secondary');
            tab.classList.add('btn-primary');
        } else {
            tab.classList.remove('btn-primary');
            tab.classList.add('btn-secondary');
        }
    });
}

el('tabOperatore').onclick = () => { show('viewOperatore'); updateTabs('tabOperatore'); };
el('tabAdmin').onclick = () => { show('viewAdmin'); updateTabs('tabAdmin'); };
el('tabInfo').onclick = () => { show('viewInfo'); updateTabs('tabInfo'); };


el('create').onclick = async () => {
  const body = { marca: el('marca').value, modello: el('modello').value, anno: Number(el('anno').value), stato_generale: el('stato').value, pubblico: false };
  const r = await api('/api/roulottes', { method: 'POST', body: JSON.stringify(body) });
  const j = await r.json(); el('createout').textContent = 'Creato: '+j.id; toast('Scheda creata'); renderList();
};
el('createDetailed').onclick = async () => {
  const acc = Array.from(document.querySelectorAll('.d_acc')).filter(i=>i.checked).map(i=>i.value);
  const body = {
    marca: el('d_marca').value,
    modello: el('d_modello').value,
    anno: Number(el('d_anno').value),
    dimensioni: { lunghezza: el('d_lunghezza').value, larghezza: el('d_larghezza').value },
    peso: { vuoto: Number(el('d_peso_vuoto').value)||0, massimo: Number(el('d_peso_complessivo').value)||0 },
    stato_generale: el('d_valutazione').value,
    accessori: acc,
    prezzo_richiesto: Number(el('d_prezzo').value)||0,
    pubblico: false,
    dettagli: {
      info_generali: { posti_letto: Number(el('d_posti').value)||0, targa: el('d_targa').value, numero_telaio: el('d_numero_telaio').value, stato_documenti: { libretto_presente: el('d_doc_libretto_presente').checked, libretto_mancante: el('d_doc_libretto_mancante').checked, libretto_smarrito: el('d_doc_libretto_smarrito').checked, demolizione: el('d_doc_demolizione').checked, solo_stanziale: el('d_doc_stanziale').checked }, layout: el('d_layout').value, condizioni_veicolo: el('d_condizioni_veicolo').value, garanzia_mesi: Number(el('d_garanzia').value)||0 },
      stato_generale: { valutazione: el('d_valutazione').value, lavori_consigliati: el('d_lavori').value },
      prezzo_condizioni: { prezzo_richiesto: Number(el('d_prezzo').value)||0, prezzo_listino: Number(el('d_prezzo_listino').value)||0, trattabile: el('d_trattabile').checked, disponibile_da: el('d_disponibile').value, trasporto: el('d_trasporto').checked }
    }
  };
  const r = await api('/api/roulottes', { method: 'POST', body: JSON.stringify(body) });
  const j = await r.json(); toast('Scheda dettagliata creata'); renderList();
};

el('refresh').onclick = () => renderList();
el('dbRefresh').onclick = () => renderDashboard();
function askConfirm(msg, onOk) {
  el('confirmMsg').textContent = msg;
  el('confirmModal').classList.remove('hidden');
  el('confirmOk').onclick = () => { el('confirmModal').classList.add('hidden'); onOk(); };
  el('confirmCancel').onclick = () => { el('confirmModal').classList.add('hidden'); };
}
