// auth.js – Kosatka 2026
const AUTH_KEY = 'kosatka_user';

function authGetCurrent() {
  var s = localStorage.getItem(AUTH_KEY);
  if (!s) return null;
  try { return JSON.parse(s); } catch(e) { return null; }
}

function authLogin(jmeno, pin) {
  var worker = null;
  for (var i=0; i<WORKERS.length; i++) {
    if (WORKERS[i].jmeno.toLowerCase() === jmeno.trim().toLowerCase() && WORKERS[i].pin === pin) {
      worker = WORKERS[i]; break;
    }
  }
  if (!worker) return null;
  localStorage.setItem(AUTH_KEY, JSON.stringify({ id:worker.id, jmeno:worker.jmeno, role:worker.role }));
  return worker;
}

function authLogout() {
  localStorage.removeItem(AUTH_KEY);
  try { db.auth.signOut(); } catch(e) {}
}

// ===================== E-MAILOVÉ PŘIHLÁŠENÍ (Supabase Auth) =====================
// Přidáno vedle stávajícího PIN přihlášení - PIN dál funguje beze změny, aby se
// nikomu z aktuálně pracujících brigádníků na Kosatce nic nerozbilo. E-mail je
// hlavní cesta pro nové podniky (Republika 24, Anděl) a pro nová přihlášení.

function findWorkerByAuthUser(authUserId) {
  return WORKERS.find(function(w){ return w.auth_user_id === authUserId; }) || null;
}

// Přihlášení e-mailem + heslem. Vrací { ok, worker } nebo { ok:false, error }.
async function authEmailLogin(email, password) {
  try {
    var res = await db.auth.signInWithPassword({ email: email.trim(), password: password });
    if (res.error) return { ok:false, error: res.error.message };
    var authUserId = res.data.user.id;
    var worker = findWorkerByAuthUser(authUserId);
    if (!worker) {
      // workers se ještě nenačetli / propojení chybí - zkus dotáhnout přímo z DB
      var r = await db.from('workers').select('*').eq('auth_user_id', authUserId).limit(1);
      worker = (r.data && r.data[0]) || null;
    }
    if (!worker) { await db.auth.signOut(); return { ok:false, error:'K tomuto e-mailu není přiřazený žádný účet brigádníka.' }; }
    if (worker.schvaleno === false) { await db.auth.signOut(); return { ok:false, error:'Registrace ještě čeká na schválení adminem.' }; }
    localStorage.setItem(AUTH_KEY, JSON.stringify({ id:worker.id, jmeno:worker.jmeno, role:worker.role }));
    return { ok:true, worker:worker };
  } catch(e) {
    return { ok:false, error:'Nepovedlo se přihlásit (výpadek připojení?).' };
  }
}

// Registrace nového uživatele e-mailem - vytvoří Supabase Auth účet i řádek
// v workers (schvaleno:false), čeká na schválení a přiřazení provozovny adminem.
async function authEmailRegister(email, password, jmeno, chceVenueId) {
  try {
    var res = await db.auth.signUp({ email: email.trim(), password: password });
    if (res.error) return { ok:false, error: res.error.message };
    var authUserId = res.data.user ? res.data.user.id : null;
    if (!authUserId) return { ok:false, error:'Registrace se nedokončila. Zkontroluj e-mail (možná je potřeba potvrdit) a zkus se pak přihlásit.' };
    var row = { jmeno: jmeno.trim(), email: email.trim(), auth_user_id: authUserId, role:'user', misto:null, dostupnost:[], schvaleno:false, chce_venue_id: chceVenueId||null };
    var ins = await db.from('workers').insert([row]).select();
    if (ins.error) return { ok:false, error:'Účet se vytvořil, ale nepovedlo se založit profil brigádníka. Napiš adminovi.' };
    return { ok:true };
  } catch(e) {
    return { ok:false, error:'Nepovedlo se zaregistrovat (výpadek připojení?).' };
  }
}

// Propojení e-mailu s existujícím profilem (PIN dál funguje). Používá se z appky
// pro brigádníky, kteří už mají PIN účet a chtějí si navíc nastavit e-mail/heslo.
async function authLinkEmail(workerId, email, password) {
  try {
    var res = await db.auth.signUp({ email: email.trim(), password: password });
    if (res.error) return { ok:false, error: res.error.message };
    var authUserId = res.data.user ? res.data.user.id : null;
    if (!authUserId) return { ok:false, error:'Zkontroluj e-mail pro potvrzení a zkus to pak znovu.' };
    var upd = await db.from('workers').update({ email: email.trim(), auth_user_id: authUserId }).eq('id', workerId);
    if (upd.error) return { ok:false, error:'Nepovedlo se propojit e-mail s profilem.' };
    var w = WORKERS.find(function(x){return x.id===workerId;});
    if (w) { w.email = email.trim(); w.auth_user_id = authUserId; }
    return { ok:true };
  } catch(e) {
    return { ok:false, error:'Nepovedlo se to uložit (výpadek připojení?).' };
  }
}

function authRequire(role) {
  var user = authGetCurrent();
  if (!user) { window.location.href='index.html'; return null; }
  // 'spravce' (venue-scoped správce) má stejný přístup do admin.html jako 'admin',
  // admin.html si sám podle role omezí, co se zobrazí (viz adminScopeVenues()).
  if (role==='admin' && user.role!=='admin' && user.role!=='spravce') { window.location.href='app.html'; return null; }
  return user;
}

// PIN pad
function buildPinPad(padId, bufId, dotsId, onComplete) {
  var buf = '';
  var pad = document.getElementById(padId);
  if (!pad) return;

  function updateDots() {
    for (var i=0; i<4; i++) {
      var dot = document.getElementById(dotsId+i);
      if (dot) dot.classList.toggle('filled', i < buf.length);
    }
  }

  function press(k) {
    if (k==='del') { buf=buf.slice(0,-1); }
    else if (buf.length < 4) { buf+=k; }
    updateDots();
    if (buf.length===4 && onComplete) onComplete(buf);
  }

  [1,2,3,4,5,6,7,8,9,'','0','del'].forEach(function(k) {
    var btn = document.createElement('button');
    btn.className='pin-key';
    btn.textContent = k==='del' ? '⌫' : k;
    btn.onclick = function() { press(String(k)); };
    if (k==='') btn.style.visibility='hidden';
    pad.appendChild(btn);
  });

  return { clear: function() { buf=''; updateDots(); }, get: function() { return buf; } };
}
