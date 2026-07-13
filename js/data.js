// data.js – Kosatka 2026 (Supabase)

// ===================== SUPABASE =====================
const SUPABASE_URL = 'https://gemjcncoeuzhytivixix.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbWpjbmNvZXV6aHl0aXZpeGl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4NjYyODEsImV4cCI6MjA5OTQ0MjI4MX0.sTnNsNc6_k0C_2U1xF1UuC-Te8ubTlgSWXIGkNZm9-M';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
// ====================================================

const HODINOVA_SAZBA = 180;

// Stanoviště — Restaurace = 200 Kč/h, ostatní = 180 Kč/h
const STANOVISTE = [
  { id:"vycep",      label:"Výčep",        color:"#dbeafe", text:"#1e40af", icon:"🍺", cas:"10:00–22:00", sazba:180 },
  { id:"restaurace", label:"Restaurace",   color:"#fef3c7", text:"#92400e", icon:"🍽️", cas:"10:00–22:00", sazba:200 },
  { id:"kuchynA",   label:"Kuchyň A",     color:"#fde68a", text:"#78350f", icon:"🍳", cas:"10:00–22:00", sazba:180 },
  { id:"kuchynB",   label:"Kuchyň B",     color:"#fed7aa", text:"#9a3412", icon:"🍳", cas:"10:00–22:00", sazba:180 },
  { id:"recepce",   label:"Recepce",      color:"#d1fae5", text:"#065f46", icon:"🏨", cas:"9:00–21:00",  sazba:180 },
  { id:"kramek",    label:"Krámek",       color:"#ede9fe", text:"#5b21b6", icon:"🛒", cas:"7:00–19:00",  sazba:180 },
  { id:"slapada",   label:"Šlapadla",     color:"#cffafe", text:"#164e63", icon:"🚣", cas:"10:00–19:00", sazba:180 },
  { id:"obcerstv",  label:"Občerstvení",  color:"#fce7f3", text:"#9d174d", icon:"🥤", cas:"10:00–22:00", sazba:180 },
  { id:"zmrzlina",  label:"Zmrzlina",     color:"#e0e7ff", text:"#3730a3", icon:"🍦", cas:"10:00–19:00", sazba:180 },
];

const UCTY_STANOVISTE = ["kramek","vycep","obcerstv","restaurace","zmrzlina"];
const PENALIZACE_DUVODY = [
  "Neoprávněný vstup na plac (−300 Kč)",
  "Ubytování neoprávněné osoby (−300 Kč)",
  "Nedokončený úklid toalet (−300 Kč)",
  "Jiné",
];
const ROZPIS_MESICE = [
  {m:6,label:"Červen"},{m:7,label:"Červenec"},{m:8,label:"Srpen"},{m:9,label:"Září"}
];
const MUZIKA_DNY = [3,4,5,6]; // St, Čt, Pá, So

// ===================== UKLID PLAN =====================
const UKLID_PLAN = {
  "2026-06-26":2,"2026-06-27":4,"2026-06-28":10,"2026-06-29":14,"2026-06-30":15,
  "2026-07-01":2,"2026-07-02":4,"2026-07-03":10,"2026-07-04":14,"2026-07-05":2,
  "2026-07-06":5,"2026-07-07":6,"2026-07-08":9,"2026-07-09":16,"2026-07-10":5,
  "2026-07-11":17,"2026-07-12":6,"2026-07-13":15,"2026-07-14":17,"2026-07-15":4,
  "2026-07-16":5,"2026-07-17":9,"2026-07-18":15,"2026-07-19":9,"2026-07-20":8,
  "2026-07-21":12,"2026-07-22":8,"2026-07-23":12,"2026-07-24":6,"2026-07-25":8,
  "2026-07-26":12,"2026-07-27":13,"2026-07-28":10,"2026-07-29":13,"2026-07-30":2,
  "2026-07-31":13,"2026-08-01":6,"2026-08-02":19,"2026-08-03":14,"2026-08-04":19,
  "2026-08-05":8,"2026-08-06":19,"2026-08-07":9,"2026-08-08":12,"2026-08-09":14,
  "2026-08-10":16,"2026-08-11":4,"2026-08-12":16,"2026-08-13":19,"2026-08-14":16,
  "2026-08-15":2,"2026-08-16":4,"2026-08-17":6,"2026-08-18":10,"2026-08-19":8,
  "2026-08-20":9,"2026-08-21":16,"2026-08-22":19,"2026-08-23":2,"2026-08-24":4,
  "2026-08-25":8,"2026-08-26":10,"2026-08-27":16,"2026-08-28":19,"2026-08-29":2,
  "2026-08-30":4
};

function getUklidWorker(dateStr) {
  var wid = UKLID_PLAN[dateStr];
  if (!wid) return null;
  return getWorkerById(wid);
}

// ===================== WORKERS =====================
var WORKERS = [
  {id:1,  jmeno:"Matyáš Moulis",       pin:"5797", role:"admin", misto:null,       dostupnost:[]},
  {id:2,  jmeno:"Marek Tykal",         pin:"2824", role:"user",  misto:"kuchynA",  dostupnost:["2026-06-25","2026-06-26","2026-06-27","2026-06-28","2026-06-29","2026-06-30","2026-07-01","2026-07-02","2026-07-03","2026-07-04","2026-07-05","2026-07-06","2026-07-07","2026-07-08","2026-07-09","2026-07-10","2026-07-11","2026-07-12","2026-07-13","2026-07-14","2026-07-15","2026-07-16","2026-07-17","2026-07-18","2026-07-19","2026-07-20","2026-07-21","2026-07-22","2026-07-23","2026-07-24","2026-07-25","2026-07-26","2026-07-27","2026-07-28","2026-07-29","2026-07-30","2026-07-31","2026-08-01","2026-08-02","2026-08-03","2026-08-04","2026-08-05","2026-08-06","2026-08-07","2026-08-08","2026-08-09","2026-08-10","2026-08-11","2026-08-12","2026-08-13","2026-08-14","2026-08-15","2026-08-16","2026-08-17","2026-08-18","2026-08-19","2026-08-20","2026-08-21","2026-08-22","2026-08-23","2026-08-24","2026-08-25","2026-08-26","2026-08-27","2026-08-28","2026-08-29","2026-08-30","2026-08-31"]},
  {id:3,  jmeno:"Matylda Troníčková",  pin:"1409", role:"user",  misto:"recepce",  dostupnost:["2026-07-01","2026-07-02","2026-07-03","2026-07-04","2026-07-05","2026-07-06","2026-07-07","2026-07-08","2026-07-09","2026-07-10","2026-07-11","2026-07-12","2026-07-13","2026-07-14","2026-07-15","2026-07-16","2026-07-17","2026-07-18","2026-07-19","2026-07-20","2026-07-21","2026-07-22","2026-07-23","2026-07-24","2026-07-25","2026-07-26","2026-07-27","2026-07-28","2026-07-29","2026-07-30","2026-07-31","2026-08-17","2026-08-18","2026-08-19","2026-08-20","2026-08-21","2026-08-22","2026-08-23","2026-08-24","2026-08-25","2026-08-26","2026-08-27","2026-08-28","2026-08-30","2026-08-31"]},
  {id:4,  jmeno:"Agáta Bůchová",       pin:"5506", role:"user",  misto:"slapada",  dostupnost:["2026-07-01","2026-07-02","2026-07-03","2026-07-04","2026-07-05","2026-07-06","2026-07-07","2026-07-08","2026-07-09","2026-07-10","2026-07-11","2026-07-12","2026-07-13","2026-07-14","2026-07-15","2026-07-16","2026-07-17","2026-07-18","2026-07-19","2026-07-20","2026-07-21","2026-07-22","2026-07-23","2026-07-24","2026-07-25","2026-07-26","2026-07-27","2026-07-28","2026-07-29","2026-07-30","2026-07-31","2026-08-01","2026-08-02","2026-08-03","2026-08-04","2026-08-05","2026-08-06","2026-08-07","2026-08-08","2026-08-09","2026-08-10","2026-08-11","2026-08-12","2026-08-13","2026-08-14","2026-08-15","2026-08-16","2026-08-17","2026-08-18","2026-08-19","2026-08-20","2026-08-21","2026-08-22","2026-08-23","2026-08-24","2026-08-25","2026-08-26","2026-08-27","2026-08-28","2026-08-29","2026-08-30","2026-08-31"]},
  {id:5,  jmeno:"Štěpánka Baslová",    pin:"5012", role:"user",  misto:"zmrzlina", dostupnost:["2026-07-06","2026-07-07","2026-07-08","2026-07-09","2026-07-10","2026-07-11","2026-07-12","2026-07-13","2026-07-14","2026-07-15","2026-07-16","2026-07-17","2026-07-20","2026-07-21","2026-07-22","2026-07-23","2026-07-24","2026-07-25","2026-07-26","2026-07-27","2026-07-28","2026-07-29","2026-07-30","2026-07-31","2026-08-14","2026-08-15","2026-08-16","2026-08-17","2026-08-18","2026-08-19"]},
  {id:6,  jmeno:"Vít Bradáč",          pin:"4657", role:"user",  misto:"obcerstv", dostupnost:["2026-07-06","2026-07-07","2026-07-08","2026-07-09","2026-07-10","2026-07-11","2026-07-12","2026-07-20","2026-07-21","2026-07-22","2026-07-23","2026-07-24","2026-07-25","2026-07-26","2026-08-03","2026-08-04","2026-08-05","2026-08-06","2026-08-07","2026-08-08","2026-08-09","2026-08-17","2026-08-18","2026-08-19","2026-08-20","2026-08-21","2026-08-22","2026-08-23","2026-08-31"]},
  {id:7,  jmeno:"Filip Basl",          pin:"3286", role:"user",  misto:"vycep",    dostupnost:["2026-06-29","2026-06-30","2026-07-01","2026-07-02","2026-07-03","2026-07-04","2026-07-05","2026-07-06","2026-07-07","2026-07-08","2026-07-09","2026-07-10","2026-07-11","2026-07-12","2026-07-13","2026-07-14","2026-07-15","2026-07-16","2026-07-17","2026-07-18","2026-07-19","2026-07-20","2026-07-21","2026-07-22","2026-07-23","2026-07-24","2026-07-25","2026-07-26","2026-07-27","2026-07-28","2026-07-29","2026-07-30","2026-07-31","2026-08-01","2026-08-02","2026-08-03","2026-08-04","2026-08-05","2026-08-06","2026-08-07","2026-08-08","2026-08-09","2026-08-10","2026-08-11","2026-08-12","2026-08-26","2026-08-27","2026-08-28","2026-08-29","2026-08-30","2026-08-31"]},
  {id:8,  jmeno:"Bín Nguyen",          pin:"2679", role:"user",  misto:"zmrzlina", dostupnost:["2026-07-20","2026-07-21","2026-07-22","2026-07-23","2026-07-24","2026-07-25","2026-07-26","2026-07-27","2026-07-28","2026-07-29","2026-07-30","2026-07-31","2026-08-01","2026-08-02","2026-08-03","2026-08-04","2026-08-05","2026-08-06","2026-08-07","2026-08-08","2026-08-09","2026-08-10","2026-08-11","2026-08-12","2026-08-13","2026-08-14","2026-08-15","2026-08-16","2026-08-17","2026-08-18","2026-08-19","2026-08-20","2026-08-21","2026-08-22","2026-08-23","2026-08-24","2026-08-25","2026-08-26","2026-08-27","2026-08-28","2026-08-29","2026-08-30","2026-08-31"]},
  {id:9,  jmeno:"Denis Šindler",       pin:"9935", role:"user",  misto:"vycep",    dostupnost:["2026-07-06","2026-07-07","2026-07-08","2026-07-09","2026-07-10","2026-07-11","2026-07-12","2026-07-20","2026-07-21","2026-07-22","2026-07-23","2026-07-24","2026-07-25","2026-07-26","2026-08-03","2026-08-04","2026-08-05","2026-08-06","2026-08-07","2026-08-08","2026-08-09","2026-08-17","2026-08-18","2026-08-19","2026-08-20","2026-08-21","2026-08-22","2026-08-23"]},
  {id:10, jmeno:"Gabriela Matoušková", pin:"2424", role:"user",  misto:null,       dostupnost:["2026-06-29","2026-06-30","2026-07-01","2026-07-02","2026-07-03","2026-07-04","2026-07-05","2026-07-06","2026-07-07","2026-07-08","2026-07-09","2026-07-10","2026-07-11","2026-07-20","2026-07-21","2026-07-26","2026-07-27","2026-07-28","2026-07-29","2026-07-30","2026-07-31","2026-08-01","2026-08-02","2026-08-17","2026-08-18","2026-08-19","2026-08-20","2026-08-21","2026-08-22","2026-08-23","2026-08-24","2026-08-25","2026-08-26","2026-08-27","2026-08-28"]},
  {id:11, jmeno:"Eliška Provázková",   pin:"7912", role:"user",  misto:"obcerstv", dostupnost:["2026-06-28","2026-06-29","2026-06-30","2026-07-01","2026-07-02","2026-07-03","2026-07-04","2026-07-05","2026-07-13","2026-07-14","2026-07-15","2026-07-16","2026-07-17","2026-07-18","2026-07-19","2026-07-27","2026-07-28","2026-07-29","2026-07-30","2026-07-31","2026-08-01","2026-08-02","2026-08-10","2026-08-11","2026-08-12","2026-08-13","2026-08-14","2026-08-15","2026-08-16","2026-08-24","2026-08-25","2026-08-26","2026-08-27","2026-08-28","2026-08-29","2026-08-30"]},
  {id:12, jmeno:"Viktorie Baťková",    pin:"1520", role:"user",  misto:"slapada",  dostupnost:["2026-07-01","2026-07-02","2026-07-03","2026-07-04","2026-07-05","2026-07-06","2026-07-07","2026-07-08","2026-07-21","2026-07-22","2026-07-23","2026-07-24","2026-07-25","2026-07-26","2026-07-27","2026-07-28","2026-07-29","2026-07-30","2026-07-31","2026-08-01","2026-08-02","2026-08-03","2026-08-04","2026-08-05","2026-08-06","2026-08-07","2026-08-08","2026-08-09"]},
  {id:13, jmeno:"Jan Urban",           pin:"1488", role:"user",  misto:null,       dostupnost:["2026-07-27","2026-07-28","2026-07-29","2026-07-30","2026-07-31","2026-08-01","2026-08-02"]},
  {id:14, jmeno:"Lucie Seberova",      pin:"2535", role:"user",  misto:"kuchynB",  dostupnost:["2026-06-25","2026-06-26","2026-06-27","2026-06-28","2026-06-29","2026-06-30","2026-07-01","2026-07-02","2026-07-03","2026-07-04","2026-07-05","2026-07-06","2026-07-07","2026-07-08","2026-07-09","2026-07-10","2026-08-03","2026-08-04","2026-08-05","2026-08-06","2026-08-07","2026-08-08","2026-08-09"]},
  {id:15, jmeno:"Michaela Urbanová",   pin:"4582", role:"user",  misto:null,       dostupnost:["2026-07-06","2026-07-07","2026-07-08","2026-07-09","2026-07-10","2026-07-11","2026-07-12","2026-07-13","2026-07-14","2026-07-15","2026-07-16","2026-07-17","2026-07-18","2026-07-19","2026-07-21","2026-07-22","2026-07-23","2026-07-25","2026-07-26","2026-08-03","2026-08-04","2026-08-05","2026-08-06","2026-08-07","2026-08-08","2026-08-09","2026-08-17","2026-08-18","2026-08-19","2026-08-20","2026-08-21","2026-08-22","2026-08-23"]},
  {id:16, jmeno:"Matěj Štůla",         pin:"4811", role:"user",  misto:"kuchynB",  dostupnost:["2026-07-06","2026-07-07","2026-07-08","2026-07-09","2026-07-10","2026-07-11","2026-07-12","2026-08-10","2026-08-11","2026-08-12","2026-08-13","2026-08-14","2026-08-15","2026-08-16","2026-08-17","2026-08-18","2026-08-19","2026-08-20","2026-08-21","2026-08-22","2026-08-23","2026-08-24","2026-08-25","2026-08-26","2026-08-27","2026-08-28","2026-08-29","2026-08-30"]},
  {id:17, jmeno:"Honza Bradáč",        pin:"9279", role:"user",  misto:"kuchynB",  dostupnost:["2026-07-11","2026-07-12","2026-07-13","2026-07-14","2026-07-15","2026-07-16","2026-07-20","2026-07-21","2026-07-22","2026-07-23","2026-07-24","2026-07-25","2026-07-26"]},
  {id:19, jmeno:"Natálie Růžičková",   pin:"3847", role:"user",  misto:"kramek",   dostupnost:["2026-08-01","2026-08-02","2026-08-03","2026-08-04","2026-08-05","2026-08-06","2026-08-07","2026-08-08","2026-08-09","2026-08-10","2026-08-11","2026-08-12","2026-08-13","2026-08-14","2026-08-15","2026-08-16","2026-08-17","2026-08-18","2026-08-19","2026-08-20","2026-08-21","2026-08-22","2026-08-23","2026-08-24","2026-08-25","2026-08-26","2026-08-27","2026-08-28","2026-08-29","2026-08-30","2026-08-31"]},
];

const SCHEDULE_DEFAULT = [{"id":1,"workerId":7,"datum":"2026-06-26","mistoId":"vycep"},{"id":2,"workerId":2,"datum":"2026-06-26","mistoId":"kuchynA"},{"id":3,"workerId":14,"datum":"2026-06-26","mistoId":"kuchynB"},{"id":4,"workerId":10,"datum":"2026-06-26","mistoId":"kramek"},{"id":5,"workerId":4,"datum":"2026-06-26","mistoId":"slapada"},{"id":6,"workerId":11,"datum":"2026-06-26","mistoId":"obcerstv"},{"id":7,"workerId":15,"datum":"2026-06-26","mistoId":"zmrzlina"},{"id":8,"workerId":7,"datum":"2026-06-27","mistoId":"vycep"},{"id":9,"workerId":2,"datum":"2026-06-27","mistoId":"kuchynA"},{"id":10,"workerId":14,"datum":"2026-06-27","mistoId":"kuchynB"},{"id":11,"workerId":10,"datum":"2026-06-27","mistoId":"kramek"},{"id":12,"workerId":4,"datum":"2026-06-27","mistoId":"slapada"},{"id":13,"workerId":11,"datum":"2026-06-27","mistoId":"obcerstv"},{"id":14,"workerId":15,"datum":"2026-06-27","mistoId":"zmrzlina"},{"id":15,"workerId":7,"datum":"2026-06-28","mistoId":"vycep"},{"id":16,"workerId":2,"datum":"2026-06-28","mistoId":"kuchynA"},{"id":17,"workerId":14,"datum":"2026-06-28","mistoId":"kuchynB"},{"id":18,"workerId":10,"datum":"2026-06-28","mistoId":"kramek"},{"id":19,"workerId":4,"datum":"2026-06-28","mistoId":"slapada"},{"id":20,"workerId":11,"datum":"2026-06-28","mistoId":"obcerstv"},{"id":21,"workerId":15,"datum":"2026-06-28","mistoId":"zmrzlina"},{"id":22,"workerId":7,"datum":"2026-06-29","mistoId":"vycep"},{"id":23,"workerId":2,"datum":"2026-06-29","mistoId":"kuchynA"},{"id":24,"workerId":14,"datum":"2026-06-29","mistoId":"kuchynB"},{"id":25,"workerId":10,"datum":"2026-06-29","mistoId":"kramek"},{"id":26,"workerId":4,"datum":"2026-06-29","mistoId":"slapada"},{"id":27,"workerId":11,"datum":"2026-06-29","mistoId":"obcerstv"},{"id":28,"workerId":15,"datum":"2026-06-29","mistoId":"zmrzlina"},{"id":29,"workerId":7,"datum":"2026-06-30","mistoId":"vycep"},{"id":30,"workerId":2,"datum":"2026-06-30","mistoId":"kuchynA"},{"id":31,"workerId":14,"datum":"2026-06-30","mistoId":"kuchynB"},{"id":32,"workerId":10,"datum":"2026-06-30","mistoId":"kramek"},{"id":33,"workerId":4,"datum":"2026-06-30","mistoId":"slapada"},{"id":34,"workerId":11,"datum":"2026-06-30","mistoId":"obcerstv"},{"id":35,"workerId":15,"datum":"2026-06-30","mistoId":"zmrzlina"},{"id":36,"workerId":7,"datum":"2026-07-01","mistoId":"vycep"},{"id":37,"workerId":2,"datum":"2026-07-01","mistoId":"kuchynA"},{"id":38,"workerId":14,"datum":"2026-07-01","mistoId":"kuchynB"},{"id":39,"workerId":3,"datum":"2026-07-01","mistoId":"recepce"},{"id":41,"workerId":4,"datum":"2026-07-01","mistoId":"slapada"},{"id":42,"workerId":11,"datum":"2026-07-01","mistoId":"obcerstv"},{"id":43,"workerId":10,"datum":"2026-07-01","mistoId":"zmrzlina"},{"id":44,"workerId":7,"datum":"2026-07-02","mistoId":"vycep"},{"id":45,"workerId":2,"datum":"2026-07-02","mistoId":"kuchynA"},{"id":46,"workerId":14,"datum":"2026-07-02","mistoId":"kuchynB"},{"id":47,"workerId":3,"datum":"2026-07-02","mistoId":"recepce"},{"id":49,"workerId":4,"datum":"2026-07-02","mistoId":"slapada"},{"id":50,"workerId":11,"datum":"2026-07-02","mistoId":"obcerstv"},{"id":51,"workerId":10,"datum":"2026-07-02","mistoId":"zmrzlina"},{"id":52,"workerId":7,"datum":"2026-07-03","mistoId":"vycep"},{"id":53,"workerId":2,"datum":"2026-07-03","mistoId":"kuchynA"},{"id":54,"workerId":14,"datum":"2026-07-03","mistoId":"kuchynB"},{"id":55,"workerId":3,"datum":"2026-07-03","mistoId":"recepce"},{"id":57,"workerId":4,"datum":"2026-07-03","mistoId":"slapada"},{"id":58,"workerId":11,"datum":"2026-07-03","mistoId":"obcerstv"},{"id":59,"workerId":10,"datum":"2026-07-03","mistoId":"zmrzlina"},{"id":60,"workerId":7,"datum":"2026-07-04","mistoId":"vycep"},{"id":61,"workerId":2,"datum":"2026-07-04","mistoId":"kuchynA"},{"id":62,"workerId":14,"datum":"2026-07-04","mistoId":"kuchynB"},{"id":63,"workerId":3,"datum":"2026-07-04","mistoId":"recepce"},{"id":65,"workerId":4,"datum":"2026-07-04","mistoId":"slapada"},{"id":66,"workerId":11,"datum":"2026-07-04","mistoId":"obcerstv"},{"id":67,"workerId":10,"datum":"2026-07-04","mistoId":"zmrzlina"},{"id":68,"workerId":7,"datum":"2026-07-05","mistoId":"vycep"},{"id":69,"workerId":2,"datum":"2026-07-05","mistoId":"kuchynA"},{"id":70,"workerId":14,"datum":"2026-07-05","mistoId":"kuchynB"},{"id":71,"workerId":3,"datum":"2026-07-05","mistoId":"recepce"},{"id":73,"workerId":4,"datum":"2026-07-05","mistoId":"slapada"},{"id":74,"workerId":11,"datum":"2026-07-05","mistoId":"obcerstv"},{"id":75,"workerId":10,"datum":"2026-07-05","mistoId":"zmrzlina"},{"id":76,"workerId":9,"datum":"2026-07-06","mistoId":"vycep"},{"id":77,"workerId":2,"datum":"2026-07-06","mistoId":"kuchynA"},{"id":78,"workerId":14,"datum":"2026-07-06","mistoId":"kuchynB"},{"id":79,"workerId":3,"datum":"2026-07-06","mistoId":"recepce"},{"id":80,"workerId":16,"datum":"2026-07-06","mistoId":"kramek"},{"id":81,"workerId":4,"datum":"2026-07-06","mistoId":"slapada"},{"id":82,"workerId":6,"datum":"2026-07-06","mistoId":"obcerstv"},{"id":83,"workerId":5,"datum":"2026-07-06","mistoId":"zmrzlina"},{"id":84,"workerId":9,"datum":"2026-07-07","mistoId":"vycep"},{"id":85,"workerId":2,"datum":"2026-07-07","mistoId":"kuchynA"},{"id":86,"workerId":14,"datum":"2026-07-07","mistoId":"kuchynB"},{"id":87,"workerId":3,"datum":"2026-07-07","mistoId":"recepce"},{"id":88,"workerId":16,"datum":"2026-07-07","mistoId":"kramek"},{"id":89,"workerId":4,"datum":"2026-07-07","mistoId":"slapada"},{"id":90,"workerId":6,"datum":"2026-07-07","mistoId":"obcerstv"},{"id":91,"workerId":5,"datum":"2026-07-07","mistoId":"zmrzlina"},{"id":92,"workerId":9,"datum":"2026-07-08","mistoId":"vycep"},{"id":93,"workerId":2,"datum":"2026-07-08","mistoId":"kuchynA"},{"id":94,"workerId":14,"datum":"2026-07-08","mistoId":"kuchynB"},{"id":95,"workerId":3,"datum":"2026-07-08","mistoId":"recepce"},{"id":96,"workerId":16,"datum":"2026-07-08","mistoId":"kramek"},{"id":97,"workerId":4,"datum":"2026-07-08","mistoId":"slapada"},{"id":98,"workerId":6,"datum":"2026-07-08","mistoId":"obcerstv"},{"id":99,"workerId":5,"datum":"2026-07-08","mistoId":"zmrzlina"},{"id":100,"workerId":9,"datum":"2026-07-09","mistoId":"vycep"},{"id":101,"workerId":2,"datum":"2026-07-09","mistoId":"kuchynA"},{"id":102,"workerId":14,"datum":"2026-07-09","mistoId":"kuchynB"},{"id":103,"workerId":3,"datum":"2026-07-09","mistoId":"recepce"},{"id":104,"workerId":16,"datum":"2026-07-09","mistoId":"kramek"},{"id":105,"workerId":4,"datum":"2026-07-09","mistoId":"slapada"},{"id":106,"workerId":6,"datum":"2026-07-09","mistoId":"obcerstv"},{"id":107,"workerId":5,"datum":"2026-07-09","mistoId":"zmrzlina"},{"id":108,"workerId":9,"datum":"2026-07-10","mistoId":"vycep"},{"id":109,"workerId":2,"datum":"2026-07-10","mistoId":"kuchynA"},{"id":110,"workerId":14,"datum":"2026-07-10","mistoId":"kuchynB"},{"id":111,"workerId":3,"datum":"2026-07-10","mistoId":"recepce"},{"id":112,"workerId":16,"datum":"2026-07-10","mistoId":"kramek"},{"id":113,"workerId":4,"datum":"2026-07-10","mistoId":"slapada"},{"id":114,"workerId":6,"datum":"2026-07-10","mistoId":"obcerstv"},{"id":115,"workerId":5,"datum":"2026-07-10","mistoId":"zmrzlina"},{"id":116,"workerId":9,"datum":"2026-07-11","mistoId":"vycep"},{"id":117,"workerId":2,"datum":"2026-07-11","mistoId":"kuchynA"},{"id":118,"workerId":17,"datum":"2026-07-11","mistoId":"kuchynB"},{"id":119,"workerId":3,"datum":"2026-07-11","mistoId":"recepce"},{"id":120,"workerId":16,"datum":"2026-07-11","mistoId":"kramek"},{"id":121,"workerId":4,"datum":"2026-07-11","mistoId":"slapada"},{"id":122,"workerId":6,"datum":"2026-07-11","mistoId":"obcerstv"},{"id":123,"workerId":5,"datum":"2026-07-11","mistoId":"zmrzlina"},{"id":124,"workerId":9,"datum":"2026-07-12","mistoId":"vycep"},{"id":125,"workerId":2,"datum":"2026-07-12","mistoId":"kuchynA"},{"id":126,"workerId":17,"datum":"2026-07-12","mistoId":"kuchynB"},{"id":127,"workerId":3,"datum":"2026-07-12","mistoId":"recepce"},{"id":128,"workerId":16,"datum":"2026-07-12","mistoId":"kramek"},{"id":129,"workerId":4,"datum":"2026-07-12","mistoId":"slapada"},{"id":130,"workerId":6,"datum":"2026-07-12","mistoId":"obcerstv"},{"id":131,"workerId":5,"datum":"2026-07-12","mistoId":"zmrzlina"},{"id":132,"workerId":7,"datum":"2026-07-13","mistoId":"vycep"},{"id":133,"workerId":2,"datum":"2026-07-13","mistoId":"kuchynA"},{"id":134,"workerId":17,"datum":"2026-07-13","mistoId":"kuchynB"},{"id":135,"workerId":3,"datum":"2026-07-13","mistoId":"recepce"},{"id":136,"workerId":15,"datum":"2026-07-13","mistoId":"kramek"},{"id":137,"workerId":4,"datum":"2026-07-13","mistoId":"slapada"},{"id":138,"workerId":11,"datum":"2026-07-13","mistoId":"obcerstv"},{"id":139,"workerId":5,"datum":"2026-07-13","mistoId":"zmrzlina"},{"id":140,"workerId":7,"datum":"2026-07-14","mistoId":"vycep"},{"id":141,"workerId":2,"datum":"2026-07-14","mistoId":"kuchynA"},{"id":142,"workerId":17,"datum":"2026-07-14","mistoId":"kuchynB"},{"id":143,"workerId":3,"datum":"2026-07-14","mistoId":"recepce"},{"id":144,"workerId":15,"datum":"2026-07-14","mistoId":"kramek"},{"id":145,"workerId":4,"datum":"2026-07-14","mistoId":"slapada"},{"id":146,"workerId":11,"datum":"2026-07-14","mistoId":"obcerstv"},{"id":147,"workerId":5,"datum":"2026-07-14","mistoId":"zmrzlina"},{"id":148,"workerId":7,"datum":"2026-07-15","mistoId":"vycep"},{"id":149,"workerId":2,"datum":"2026-07-15","mistoId":"kuchynA"},{"id":150,"workerId":17,"datum":"2026-07-15","mistoId":"kuchynB"},{"id":151,"workerId":3,"datum":"2026-07-15","mistoId":"recepce"},{"id":152,"workerId":15,"datum":"2026-07-15","mistoId":"kramek"},{"id":153,"workerId":4,"datum":"2026-07-15","mistoId":"slapada"},{"id":154,"workerId":11,"datum":"2026-07-15","mistoId":"obcerstv"},{"id":155,"workerId":5,"datum":"2026-07-15","mistoId":"zmrzlina"},{"id":156,"workerId":7,"datum":"2026-07-16","mistoId":"vycep"},{"id":157,"workerId":2,"datum":"2026-07-16","mistoId":"kuchynA"},{"id":158,"workerId":17,"datum":"2026-07-16","mistoId":"kuchynB"},{"id":159,"workerId":3,"datum":"2026-07-16","mistoId":"recepce"},{"id":160,"workerId":15,"datum":"2026-07-16","mistoId":"kramek"},{"id":161,"workerId":4,"datum":"2026-07-16","mistoId":"slapada"},{"id":162,"workerId":11,"datum":"2026-07-16","mistoId":"obcerstv"},{"id":163,"workerId":5,"datum":"2026-07-16","mistoId":"zmrzlina"},{"id":164,"workerId":7,"datum":"2026-07-17","mistoId":"vycep"},{"id":165,"workerId":2,"datum":"2026-07-17","mistoId":"kuchynA"},{"id":166,"workerId":9,"datum":"2026-07-17","mistoId":"kuchynB"},{"id":167,"workerId":3,"datum":"2026-07-17","mistoId":"recepce"},{"id":168,"workerId":15,"datum":"2026-07-17","mistoId":"kramek"},{"id":169,"workerId":4,"datum":"2026-07-17","mistoId":"slapada"},{"id":170,"workerId":11,"datum":"2026-07-17","mistoId":"obcerstv"},{"id":171,"workerId":5,"datum":"2026-07-17","mistoId":"zmrzlina"},{"id":172,"workerId":7,"datum":"2026-07-18","mistoId":"vycep"},{"id":173,"workerId":2,"datum":"2026-07-18","mistoId":"kuchynA"},{"id":174,"workerId":9,"datum":"2026-07-18","mistoId":"kuchynB"},{"id":175,"workerId":3,"datum":"2026-07-18","mistoId":"recepce"},{"id":176,"workerId":15,"datum":"2026-07-18","mistoId":"kramek"},{"id":177,"workerId":4,"datum":"2026-07-18","mistoId":"slapada"},{"id":178,"workerId":11,"datum":"2026-07-18","mistoId":"obcerstv"},{"id":179,"workerId":5,"datum":"2026-07-18","mistoId":"zmrzlina"},{"id":180,"workerId":7,"datum":"2026-07-19","mistoId":"vycep"},{"id":181,"workerId":2,"datum":"2026-07-19","mistoId":"kuchynA"},{"id":182,"workerId":9,"datum":"2026-07-19","mistoId":"kuchynB"},{"id":183,"workerId":3,"datum":"2026-07-19","mistoId":"recepce"},{"id":184,"workerId":15,"datum":"2026-07-19","mistoId":"kramek"},{"id":185,"workerId":4,"datum":"2026-07-19","mistoId":"slapada"},{"id":186,"workerId":11,"datum":"2026-07-19","mistoId":"obcerstv"},{"id":187,"workerId":5,"datum":"2026-07-19","mistoId":"zmrzlina"},{"id":188,"workerId":9,"datum":"2026-07-20","mistoId":"vycep"},{"id":189,"workerId":2,"datum":"2026-07-20","mistoId":"kuchynA"},{"id":190,"workerId":17,"datum":"2026-07-20","mistoId":"kuchynB"},{"id":191,"workerId":3,"datum":"2026-07-20","mistoId":"recepce"},{"id":193,"workerId":4,"datum":"2026-07-20","mistoId":"slapada"},{"id":194,"workerId":6,"datum":"2026-07-20","mistoId":"obcerstv"},{"id":195,"workerId":8,"datum":"2026-07-20","mistoId":"zmrzlina"},{"id":196,"workerId":9,"datum":"2026-07-21","mistoId":"vycep"},{"id":197,"workerId":2,"datum":"2026-07-21","mistoId":"kuchynA"},{"id":198,"workerId":17,"datum":"2026-07-21","mistoId":"kuchynB"},{"id":199,"workerId":3,"datum":"2026-07-21","mistoId":"recepce"},{"id":201,"workerId":12,"datum":"2026-07-21","mistoId":"slapada"},{"id":202,"workerId":6,"datum":"2026-07-21","mistoId":"obcerstv"},{"id":203,"workerId":8,"datum":"2026-07-21","mistoId":"zmrzlina"},{"id":204,"workerId":9,"datum":"2026-07-22","mistoId":"vycep"},{"id":205,"workerId":2,"datum":"2026-07-22","mistoId":"kuchynA"},{"id":206,"workerId":17,"datum":"2026-07-22","mistoId":"kuchynB"},{"id":207,"workerId":3,"datum":"2026-07-22","mistoId":"recepce"},{"id":209,"workerId":12,"datum":"2026-07-22","mistoId":"slapada"},{"id":210,"workerId":6,"datum":"2026-07-22","mistoId":"obcerstv"},{"id":211,"workerId":8,"datum":"2026-07-22","mistoId":"zmrzlina"},{"id":212,"workerId":9,"datum":"2026-07-23","mistoId":"vycep"},{"id":213,"workerId":2,"datum":"2026-07-23","mistoId":"kuchynA"},{"id":214,"workerId":17,"datum":"2026-07-23","mistoId":"kuchynB"},{"id":215,"workerId":3,"datum":"2026-07-23","mistoId":"recepce"},{"id":216,"workerId":12,"datum":"2026-07-23","mistoId":"kramek"},{"id":217,"workerId":4,"datum":"2026-07-23","mistoId":"slapada"},{"id":218,"workerId":6,"datum":"2026-07-23","mistoId":"obcerstv"},{"id":219,"workerId":8,"datum":"2026-07-23","mistoId":"zmrzlina"},{"id":220,"workerId":9,"datum":"2026-07-24","mistoId":"vycep"},{"id":221,"workerId":2,"datum":"2026-07-24","mistoId":"kuchynA"},{"id":222,"workerId":17,"datum":"2026-07-24","mistoId":"kuchynB"},{"id":223,"workerId":3,"datum":"2026-07-24","mistoId":"recepce"},{"id":224,"workerId":12,"datum":"2026-07-24","mistoId":"kramek"},{"id":225,"workerId":4,"datum":"2026-07-24","mistoId":"slapada"},{"id":226,"workerId":6,"datum":"2026-07-24","mistoId":"obcerstv"},{"id":227,"workerId":8,"datum":"2026-07-24","mistoId":"zmrzlina"},{"id":228,"workerId":9,"datum":"2026-07-25","mistoId":"vycep"},{"id":229,"workerId":2,"datum":"2026-07-25","mistoId":"kuchynA"},{"id":230,"workerId":17,"datum":"2026-07-25","mistoId":"kuchynB"},{"id":231,"workerId":3,"datum":"2026-07-25","mistoId":"recepce"},{"id":232,"workerId":12,"datum":"2026-07-25","mistoId":"kramek"},{"id":233,"workerId":4,"datum":"2026-07-25","mistoId":"slapada"},{"id":234,"workerId":6,"datum":"2026-07-25","mistoId":"obcerstv"},{"id":235,"workerId":8,"datum":"2026-07-25","mistoId":"zmrzlina"},{"id":236,"workerId":9,"datum":"2026-07-26","mistoId":"vycep"},{"id":237,"workerId":2,"datum":"2026-07-26","mistoId":"kuchynA"},{"id":238,"workerId":17,"datum":"2026-07-26","mistoId":"kuchynB"},{"id":239,"workerId":3,"datum":"2026-07-26","mistoId":"recepce"},{"id":240,"workerId":12,"datum":"2026-07-26","mistoId":"kramek"},{"id":241,"workerId":4,"datum":"2026-07-26","mistoId":"slapada"},{"id":242,"workerId":6,"datum":"2026-07-26","mistoId":"obcerstv"},{"id":243,"workerId":8,"datum":"2026-07-26","mistoId":"zmrzlina"},{"id":244,"workerId":7,"datum":"2026-07-27","mistoId":"vycep"},{"id":245,"workerId":2,"datum":"2026-07-27","mistoId":"kuchynA"},{"id":246,"workerId":13,"datum":"2026-07-27","mistoId":"kuchynB"},{"id":247,"workerId":3,"datum":"2026-07-27","mistoId":"recepce"},{"id":248,"workerId":10,"datum":"2026-07-27","mistoId":"kramek"},{"id":249,"workerId":12,"datum":"2026-07-27","mistoId":"slapada"},{"id":250,"workerId":11,"datum":"2026-07-27","mistoId":"obcerstv"},{"id":251,"workerId":8,"datum":"2026-07-27","mistoId":"zmrzlina"},{"id":252,"workerId":7,"datum":"2026-07-28","mistoId":"vycep"},{"id":253,"workerId":2,"datum":"2026-07-28","mistoId":"kuchynA"},{"id":254,"workerId":13,"datum":"2026-07-28","mistoId":"kuchynB"},{"id":255,"workerId":3,"datum":"2026-07-28","mistoId":"recepce"},{"id":256,"workerId":10,"datum":"2026-07-28","mistoId":"kramek"},{"id":257,"workerId":12,"datum":"2026-07-28","mistoId":"slapada"},{"id":258,"workerId":11,"datum":"2026-07-28","mistoId":"obcerstv"},{"id":259,"workerId":8,"datum":"2026-07-28","mistoId":"zmrzlina"},{"id":260,"workerId":7,"datum":"2026-07-29","mistoId":"vycep"},{"id":261,"workerId":2,"datum":"2026-07-29","mistoId":"kuchynA"},{"id":262,"workerId":13,"datum":"2026-07-29","mistoId":"kuchynB"},{"id":263,"workerId":3,"datum":"2026-07-29","mistoId":"recepce"},{"id":264,"workerId":10,"datum":"2026-07-29","mistoId":"kramek"},{"id":265,"workerId":12,"datum":"2026-07-29","mistoId":"slapada"},{"id":266,"workerId":11,"datum":"2026-07-29","mistoId":"obcerstv"},{"id":267,"workerId":8,"datum":"2026-07-29","mistoId":"zmrzlina"},{"id":268,"workerId":7,"datum":"2026-07-30","mistoId":"vycep"},{"id":269,"workerId":2,"datum":"2026-07-30","mistoId":"kuchynA"},{"id":270,"workerId":13,"datum":"2026-07-30","mistoId":"kuchynB"},{"id":271,"workerId":3,"datum":"2026-07-30","mistoId":"recepce"},{"id":272,"workerId":10,"datum":"2026-07-30","mistoId":"kramek"},{"id":273,"workerId":12,"datum":"2026-07-30","mistoId":"slapada"},{"id":274,"workerId":11,"datum":"2026-07-30","mistoId":"obcerstv"},{"id":275,"workerId":8,"datum":"2026-07-30","mistoId":"zmrzlina"},{"id":276,"workerId":7,"datum":"2026-07-31","mistoId":"vycep"},{"id":277,"workerId":2,"datum":"2026-07-31","mistoId":"kuchynA"},{"id":278,"workerId":13,"datum":"2026-07-31","mistoId":"kuchynB"},{"id":279,"workerId":3,"datum":"2026-07-31","mistoId":"recepce"},{"id":280,"workerId":10,"datum":"2026-07-31","mistoId":"kramek"},{"id":281,"workerId":12,"datum":"2026-07-31","mistoId":"slapada"},{"id":282,"workerId":11,"datum":"2026-07-31","mistoId":"obcerstv"},{"id":283,"workerId":8,"datum":"2026-07-31","mistoId":"zmrzlina"},{"id":284,"workerId":7,"datum":"2026-08-01","mistoId":"vycep"},{"id":285,"workerId":2,"datum":"2026-08-01","mistoId":"kuchynA"},{"id":286,"workerId":13,"datum":"2026-08-01","mistoId":"kuchynB"},{"id":287,"workerId":3,"datum":"2026-08-01","mistoId":"recepce"},{"id":288,"workerId":10,"datum":"2026-08-01","mistoId":"kramek"},{"id":289,"workerId":12,"datum":"2026-08-01","mistoId":"slapada"},{"id":290,"workerId":6,"datum":"2026-08-01","mistoId":"obcerstv"},{"id":291,"workerId":8,"datum":"2026-08-01","mistoId":"zmrzlina"},{"id":292,"workerId":7,"datum":"2026-08-02","mistoId":"vycep"},{"id":293,"workerId":2,"datum":"2026-08-02","mistoId":"kuchynA"},{"id":294,"workerId":13,"datum":"2026-08-02","mistoId":"kuchynB"},{"id":295,"workerId":3,"datum":"2026-08-02","mistoId":"recepce"},{"id":296,"workerId":19,"datum":"2026-08-02","mistoId":"kramek"},{"id":297,"workerId":12,"datum":"2026-08-02","mistoId":"slapada"},{"id":298,"workerId":6,"datum":"2026-08-02","mistoId":"obcerstv"},{"id":299,"workerId":8,"datum":"2026-08-02","mistoId":"zmrzlina"},{"id":300,"workerId":9,"datum":"2026-08-03","mistoId":"vycep"},{"id":301,"workerId":2,"datum":"2026-08-03","mistoId":"kuchynA"},{"id":302,"workerId":14,"datum":"2026-08-03","mistoId":"kuchynB"},{"id":303,"workerId":3,"datum":"2026-08-03","mistoId":"recepce"},{"id":304,"workerId":19,"datum":"2026-08-03","mistoId":"kramek"},{"id":305,"workerId":12,"datum":"2026-08-03","mistoId":"slapada"},{"id":306,"workerId":6,"datum":"2026-08-03","mistoId":"obcerstv"},{"id":307,"workerId":8,"datum":"2026-08-03","mistoId":"zmrzlina"},{"id":308,"workerId":9,"datum":"2026-08-04","mistoId":"vycep"},{"id":309,"workerId":2,"datum":"2026-08-04","mistoId":"kuchynA"},{"id":310,"workerId":14,"datum":"2026-08-04","mistoId":"kuchynB"},{"id":311,"workerId":3,"datum":"2026-08-04","mistoId":"recepce"},{"id":312,"workerId":19,"datum":"2026-08-04","mistoId":"kramek"},{"id":313,"workerId":12,"datum":"2026-08-04","mistoId":"slapada"},{"id":314,"workerId":6,"datum":"2026-08-04","mistoId":"obcerstv"},{"id":315,"workerId":8,"datum":"2026-08-04","mistoId":"zmrzlina"},{"id":316,"workerId":9,"datum":"2026-08-05","mistoId":"vycep"},{"id":317,"workerId":2,"datum":"2026-08-05","mistoId":"kuchynA"},{"id":318,"workerId":14,"datum":"2026-08-05","mistoId":"kuchynB"},{"id":319,"workerId":3,"datum":"2026-08-05","mistoId":"recepce"},{"id":320,"workerId":19,"datum":"2026-08-05","mistoId":"kramek"},{"id":321,"workerId":12,"datum":"2026-08-05","mistoId":"slapada"},{"id":322,"workerId":6,"datum":"2026-08-05","mistoId":"obcerstv"},{"id":323,"workerId":8,"datum":"2026-08-05","mistoId":"zmrzlina"},{"id":324,"workerId":9,"datum":"2026-08-06","mistoId":"vycep"},{"id":325,"workerId":2,"datum":"2026-08-06","mistoId":"kuchynA"},{"id":326,"workerId":14,"datum":"2026-08-06","mistoId":"kuchynB"},{"id":327,"workerId":3,"datum":"2026-08-06","mistoId":"recepce"},{"id":328,"workerId":19,"datum":"2026-08-06","mistoId":"kramek"},{"id":329,"workerId":12,"datum":"2026-08-06","mistoId":"slapada"},{"id":330,"workerId":6,"datum":"2026-08-06","mistoId":"obcerstv"},{"id":331,"workerId":8,"datum":"2026-08-06","mistoId":"zmrzlina"},{"id":332,"workerId":9,"datum":"2026-08-07","mistoId":"vycep"},{"id":333,"workerId":2,"datum":"2026-08-07","mistoId":"kuchynA"},{"id":334,"workerId":14,"datum":"2026-08-07","mistoId":"kuchynB"},{"id":335,"workerId":3,"datum":"2026-08-07","mistoId":"recepce"},{"id":336,"workerId":19,"datum":"2026-08-07","mistoId":"kramek"},{"id":337,"workerId":12,"datum":"2026-08-07","mistoId":"slapada"},{"id":338,"workerId":6,"datum":"2026-08-07","mistoId":"obcerstv"},{"id":339,"workerId":8,"datum":"2026-08-07","mistoId":"zmrzlina"},{"id":340,"workerId":9,"datum":"2026-08-08","mistoId":"vycep"},{"id":341,"workerId":2,"datum":"2026-08-08","mistoId":"kuchynA"},{"id":342,"workerId":14,"datum":"2026-08-08","mistoId":"kuchynB"},{"id":343,"workerId":3,"datum":"2026-08-08","mistoId":"recepce"},{"id":344,"workerId":19,"datum":"2026-08-08","mistoId":"kramek"},{"id":345,"workerId":12,"datum":"2026-08-08","mistoId":"slapada"},{"id":346,"workerId":6,"datum":"2026-08-08","mistoId":"obcerstv"},{"id":347,"workerId":8,"datum":"2026-08-08","mistoId":"zmrzlina"},{"id":348,"workerId":9,"datum":"2026-08-09","mistoId":"vycep"},{"id":349,"workerId":2,"datum":"2026-08-09","mistoId":"kuchynA"},{"id":350,"workerId":14,"datum":"2026-08-09","mistoId":"kuchynB"},{"id":351,"workerId":3,"datum":"2026-08-09","mistoId":"recepce"},{"id":352,"workerId":19,"datum":"2026-08-09","mistoId":"kramek"},{"id":353,"workerId":12,"datum":"2026-08-09","mistoId":"slapada"},{"id":354,"workerId":6,"datum":"2026-08-09","mistoId":"obcerstv"},{"id":355,"workerId":8,"datum":"2026-08-09","mistoId":"zmrzlina"},{"id":356,"workerId":7,"datum":"2026-08-10","mistoId":"vycep"},{"id":357,"workerId":2,"datum":"2026-08-10","mistoId":"kuchynA"},{"id":358,"workerId":16,"datum":"2026-08-10","mistoId":"kuchynB"},{"id":359,"workerId":3,"datum":"2026-08-10","mistoId":"recepce"},{"id":360,"workerId":10,"datum":"2026-08-10","mistoId":"kramek"},{"id":361,"workerId":4,"datum":"2026-08-10","mistoId":"slapada"},{"id":362,"workerId":11,"datum":"2026-08-10","mistoId":"obcerstv"},{"id":363,"workerId":8,"datum":"2026-08-10","mistoId":"zmrzlina"},{"id":364,"workerId":7,"datum":"2026-08-11","mistoId":"vycep"},{"id":365,"workerId":2,"datum":"2026-08-11","mistoId":"kuchynA"},{"id":366,"workerId":16,"datum":"2026-08-11","mistoId":"kuchynB"},{"id":367,"workerId":3,"datum":"2026-08-11","mistoId":"recepce"},{"id":368,"workerId":10,"datum":"2026-08-11","mistoId":"kramek"},{"id":369,"workerId":4,"datum":"2026-08-11","mistoId":"slapada"},{"id":370,"workerId":11,"datum":"2026-08-11","mistoId":"obcerstv"},{"id":371,"workerId":8,"datum":"2026-08-11","mistoId":"zmrzlina"},{"id":372,"workerId":7,"datum":"2026-08-12","mistoId":"vycep"},{"id":373,"workerId":2,"datum":"2026-08-12","mistoId":"kuchynA"},{"id":374,"workerId":16,"datum":"2026-08-12","mistoId":"kuchynB"},{"id":375,"workerId":3,"datum":"2026-08-12","mistoId":"recepce"},{"id":376,"workerId":19,"datum":"2026-08-12","mistoId":"kramek"},{"id":377,"workerId":4,"datum":"2026-08-12","mistoId":"slapada"},{"id":378,"workerId":11,"datum":"2026-08-12","mistoId":"obcerstv"},{"id":379,"workerId":8,"datum":"2026-08-12","mistoId":"zmrzlina"},{"id":380,"workerId":2,"datum":"2026-08-13","mistoId":"kuchynA"},{"id":381,"workerId":16,"datum":"2026-08-13","mistoId":"kuchynB"},{"id":382,"workerId":3,"datum":"2026-08-13","mistoId":"recepce"},{"id":383,"workerId":19,"datum":"2026-08-13","mistoId":"kramek"},{"id":384,"workerId":4,"datum":"2026-08-13","mistoId":"slapada"},{"id":385,"workerId":11,"datum":"2026-08-13","mistoId":"obcerstv"},{"id":386,"workerId":8,"datum":"2026-08-13","mistoId":"zmrzlina"},{"id":387,"workerId":2,"datum":"2026-08-14","mistoId":"kuchynA"},{"id":388,"workerId":16,"datum":"2026-08-14","mistoId":"kuchynB"},{"id":389,"workerId":3,"datum":"2026-08-14","mistoId":"recepce"},{"id":390,"workerId":19,"datum":"2026-08-14","mistoId":"kramek"},{"id":391,"workerId":4,"datum":"2026-08-14","mistoId":"slapada"},{"id":392,"workerId":11,"datum":"2026-08-14","mistoId":"obcerstv"},{"id":393,"workerId":8,"datum":"2026-08-14","mistoId":"zmrzlina"},{"id":394,"workerId":2,"datum":"2026-08-15","mistoId":"kuchynA"},{"id":395,"workerId":16,"datum":"2026-08-15","mistoId":"kuchynB"},{"id":396,"workerId":3,"datum":"2026-08-15","mistoId":"recepce"},{"id":397,"workerId":19,"datum":"2026-08-15","mistoId":"kramek"},{"id":398,"workerId":4,"datum":"2026-08-15","mistoId":"slapada"},{"id":399,"workerId":11,"datum":"2026-08-15","mistoId":"obcerstv"},{"id":400,"workerId":8,"datum":"2026-08-15","mistoId":"zmrzlina"},{"id":401,"workerId":2,"datum":"2026-08-16","mistoId":"kuchynA"},{"id":402,"workerId":16,"datum":"2026-08-16","mistoId":"kuchynB"},{"id":403,"workerId":3,"datum":"2026-08-16","mistoId":"recepce"},{"id":404,"workerId":19,"datum":"2026-08-16","mistoId":"kramek"},{"id":405,"workerId":4,"datum":"2026-08-16","mistoId":"slapada"},{"id":406,"workerId":11,"datum":"2026-08-16","mistoId":"obcerstv"},{"id":407,"workerId":8,"datum":"2026-08-16","mistoId":"zmrzlina"},{"id":408,"workerId":9,"datum":"2026-08-17","mistoId":"vycep"},{"id":409,"workerId":2,"datum":"2026-08-17","mistoId":"kuchynA"},{"id":410,"workerId":16,"datum":"2026-08-17","mistoId":"kuchynB"},{"id":411,"workerId":3,"datum":"2026-08-17","mistoId":"recepce"},{"id":412,"workerId":19,"datum":"2026-08-17","mistoId":"kramek"},{"id":413,"workerId":4,"datum":"2026-08-17","mistoId":"slapada"},{"id":414,"workerId":6,"datum":"2026-08-17","mistoId":"obcerstv"},{"id":415,"workerId":8,"datum":"2026-08-17","mistoId":"zmrzlina"},{"id":416,"workerId":9,"datum":"2026-08-18","mistoId":"vycep"},{"id":417,"workerId":2,"datum":"2026-08-18","mistoId":"kuchynA"},{"id":418,"workerId":16,"datum":"2026-08-18","mistoId":"kuchynB"},{"id":419,"workerId":3,"datum":"2026-08-18","mistoId":"recepce"},{"id":420,"workerId":10,"datum":"2026-08-18","mistoId":"kramek"},{"id":421,"workerId":4,"datum":"2026-08-18","mistoId":"slapada"},{"id":422,"workerId":6,"datum":"2026-08-18","mistoId":"obcerstv"},{"id":423,"workerId":8,"datum":"2026-08-18","mistoId":"zmrzlina"},{"id":424,"workerId":9,"datum":"2026-08-19","mistoId":"vycep"},{"id":425,"workerId":2,"datum":"2026-08-19","mistoId":"kuchynA"},{"id":426,"workerId":16,"datum":"2026-08-19","mistoId":"kuchynB"},{"id":427,"workerId":3,"datum":"2026-08-19","mistoId":"recepce"},{"id":428,"workerId":10,"datum":"2026-08-19","mistoId":"kramek"},{"id":429,"workerId":4,"datum":"2026-08-19","mistoId":"slapada"},{"id":430,"workerId":6,"datum":"2026-08-19","mistoId":"obcerstv"},{"id":431,"workerId":8,"datum":"2026-08-19","mistoId":"zmrzlina"},{"id":432,"workerId":9,"datum":"2026-08-20","mistoId":"vycep"},{"id":433,"workerId":2,"datum":"2026-08-20","mistoId":"kuchynA"},{"id":434,"workerId":16,"datum":"2026-08-20","mistoId":"kuchynB"},{"id":435,"workerId":3,"datum":"2026-08-20","mistoId":"recepce"},{"id":436,"workerId":19,"datum":"2026-08-20","mistoId":"kramek"},{"id":437,"workerId":4,"datum":"2026-08-20","mistoId":"slapada"},{"id":438,"workerId":6,"datum":"2026-08-20","mistoId":"obcerstv"},{"id":439,"workerId":8,"datum":"2026-08-20","mistoId":"zmrzlina"},{"id":440,"workerId":9,"datum":"2026-08-21","mistoId":"vycep"},{"id":441,"workerId":2,"datum":"2026-08-21","mistoId":"kuchynA"},{"id":442,"workerId":16,"datum":"2026-08-21","mistoId":"kuchynB"},{"id":443,"workerId":3,"datum":"2026-08-21","mistoId":"recepce"},{"id":444,"workerId":19,"datum":"2026-08-21","mistoId":"kramek"},{"id":445,"workerId":4,"datum":"2026-08-21","mistoId":"slapada"},{"id":446,"workerId":6,"datum":"2026-08-21","mistoId":"obcerstv"},{"id":447,"workerId":8,"datum":"2026-08-21","mistoId":"zmrzlina"},{"id":448,"workerId":9,"datum":"2026-08-22","mistoId":"vycep"},{"id":449,"workerId":2,"datum":"2026-08-22","mistoId":"kuchynA"},{"id":450,"workerId":16,"datum":"2026-08-22","mistoId":"kuchynB"},{"id":451,"workerId":3,"datum":"2026-08-22","mistoId":"recepce"},{"id":452,"workerId":19,"datum":"2026-08-22","mistoId":"kramek"},{"id":453,"workerId":4,"datum":"2026-08-22","mistoId":"slapada"},{"id":454,"workerId":6,"datum":"2026-08-22","mistoId":"obcerstv"},{"id":455,"workerId":8,"datum":"2026-08-22","mistoId":"zmrzlina"},{"id":456,"workerId":9,"datum":"2026-08-23","mistoId":"vycep"},{"id":457,"workerId":2,"datum":"2026-08-23","mistoId":"kuchynA"},{"id":458,"workerId":16,"datum":"2026-08-23","mistoId":"kuchynB"},{"id":459,"workerId":3,"datum":"2026-08-23","mistoId":"recepce"},{"id":460,"workerId":19,"datum":"2026-08-23","mistoId":"kramek"},{"id":461,"workerId":4,"datum":"2026-08-23","mistoId":"slapada"},{"id":462,"workerId":6,"datum":"2026-08-23","mistoId":"obcerstv"},{"id":463,"workerId":8,"datum":"2026-08-23","mistoId":"zmrzlina"},{"id":464,"workerId":2,"datum":"2026-08-24","mistoId":"kuchynA"},{"id":465,"workerId":16,"datum":"2026-08-24","mistoId":"kuchynB"},{"id":466,"workerId":3,"datum":"2026-08-24","mistoId":"recepce"},{"id":467,"workerId":19,"datum":"2026-08-24","mistoId":"kramek"},{"id":468,"workerId":4,"datum":"2026-08-24","mistoId":"slapada"},{"id":469,"workerId":11,"datum":"2026-08-24","mistoId":"obcerstv"},{"id":470,"workerId":8,"datum":"2026-08-24","mistoId":"zmrzlina"},{"id":471,"workerId":2,"datum":"2026-08-25","mistoId":"kuchynA"},{"id":472,"workerId":16,"datum":"2026-08-25","mistoId":"kuchynB"},{"id":473,"workerId":3,"datum":"2026-08-25","mistoId":"recepce"},{"id":474,"workerId":19,"datum":"2026-08-25","mistoId":"kramek"},{"id":475,"workerId":4,"datum":"2026-08-25","mistoId":"slapada"},{"id":476,"workerId":11,"datum":"2026-08-25","mistoId":"obcerstv"},{"id":477,"workerId":8,"datum":"2026-08-25","mistoId":"zmrzlina"},{"id":478,"workerId":2,"datum":"2026-08-26","mistoId":"kuchynA"},{"id":479,"workerId":16,"datum":"2026-08-26","mistoId":"kuchynB"},{"id":480,"workerId":3,"datum":"2026-08-26","mistoId":"recepce"},{"id":481,"workerId":10,"datum":"2026-08-26","mistoId":"kramek"},{"id":482,"workerId":4,"datum":"2026-08-26","mistoId":"slapada"},{"id":483,"workerId":11,"datum":"2026-08-26","mistoId":"obcerstv"},{"id":484,"workerId":8,"datum":"2026-08-26","mistoId":"zmrzlina"},{"id":485,"workerId":7,"datum":"2026-08-27","mistoId":"vycep"},{"id":486,"workerId":2,"datum":"2026-08-27","mistoId":"kuchynA"},{"id":487,"workerId":16,"datum":"2026-08-27","mistoId":"kuchynB"},{"id":488,"workerId":3,"datum":"2026-08-27","mistoId":"recepce"},{"id":489,"workerId":10,"datum":"2026-08-27","mistoId":"kramek"},{"id":490,"workerId":4,"datum":"2026-08-27","mistoId":"slapada"},{"id":491,"workerId":11,"datum":"2026-08-27","mistoId":"obcerstv"},{"id":492,"workerId":8,"datum":"2026-08-27","mistoId":"zmrzlina"},{"id":493,"workerId":7,"datum":"2026-08-28","mistoId":"vycep"},{"id":494,"workerId":2,"datum":"2026-08-28","mistoId":"kuchynA"},{"id":495,"workerId":16,"datum":"2026-08-28","mistoId":"kuchynB"},{"id":496,"workerId":3,"datum":"2026-08-28","mistoId":"recepce"},{"id":497,"workerId":19,"datum":"2026-08-28","mistoId":"kramek"},{"id":498,"workerId":4,"datum":"2026-08-28","mistoId":"slapada"},{"id":499,"workerId":11,"datum":"2026-08-28","mistoId":"obcerstv"},{"id":500,"workerId":8,"datum":"2026-08-28","mistoId":"zmrzlina"},{"id":501,"workerId":7,"datum":"2026-08-29","mistoId":"vycep"},{"id":502,"workerId":2,"datum":"2026-08-29","mistoId":"kuchynA"},{"id":503,"workerId":16,"datum":"2026-08-29","mistoId":"kuchynB"},{"id":504,"workerId":3,"datum":"2026-08-29","mistoId":"recepce"},{"id":505,"workerId":19,"datum":"2026-08-29","mistoId":"kramek"},{"id":506,"workerId":4,"datum":"2026-08-29","mistoId":"slapada"},{"id":507,"workerId":11,"datum":"2026-08-29","mistoId":"obcerstv"},{"id":508,"workerId":8,"datum":"2026-08-29","mistoId":"zmrzlina"},{"id":509,"workerId":7,"datum":"2026-08-30","mistoId":"vycep"},{"id":510,"workerId":2,"datum":"2026-08-30","mistoId":"kuchynA"},{"id":511,"workerId":16,"datum":"2026-08-30","mistoId":"kuchynB"},{"id":512,"workerId":3,"datum":"2026-08-30","mistoId":"recepce"},{"id":513,"workerId":19,"datum":"2026-08-30","mistoId":"kramek"},{"id":514,"workerId":4,"datum":"2026-08-30","mistoId":"slapada"},{"id":515,"workerId":11,"datum":"2026-08-30","mistoId":"obcerstv"},{"id":516,"workerId":8,"datum":"2026-08-30","mistoId":"zmrzlina"}];

// Runtime data
var LOAD_OK = { schedule:false, ucty:false, uklid_log:false, penalizace:false, pracovni_dny:false, workers:false, trzby:false, naklady:false, businesses:false, venues:false, admin_venues:false, stanoviste:false, worker_venues:false, worker_dostupnost:false };
var SCHEDULE = [];
var UCTY_POLOZKY = [];
var UKLID_LOG = [];
var PENALIZACE = [];
var PRACOVNI_DNY = []; // {id, workerId, datum, prichod, odchod, obed, vecere}
var NAKLADY = []; // {id, venue_id, workerId, datum, popis, castka} - Makro, pivo, zásoby...

// ===================== SUPABASE SAVE/LOAD =====================

// Obecná spolehlivá pomůcka pro ukládání - vždy zkontroluje, jestli se zápis opravdu povedl
async function dbUpsert(table, rows) {
  if (!rows || !rows.length) return { ok:true };
  try {
    var res = await db.from(table).upsert(rows);
    if (res && res.error) return { ok:false, error:res.error };
    return { ok:true };
  } catch(e) {
    return { ok:false, error:e };
  }
}

// DŮLEŽITÉ: každá save* funkce ukládá CELÉ pole z paměti (upsert). Pokud se
// odpovídající tabulka při loadAll() nepovedla načíst, pole v paměti je
// zastaralé/prázdné - uložit by ho znamenalo přepsat reálná data v databázi
// starou/prázdnou kopií. Proto se save odmítne a appka musí ukázat chybu
// (zkus obnovit stránku), místo aby tiše smazala něčí zapsané hodiny.
function requireLoadOk(key) {
  if (!LOAD_OK[key]) return { ok:false, error:'Data se nepodařilo bezpečně načíst - obnov prosím stránku (F5) předtím, než budeš znovu ukládat.' };
  return null;
}

async function saveSchedule() {
  var blocked = requireLoadOk('schedule'); if (blocked) return blocked;
  return await dbUpsert('schedule', SCHEDULE);
}
async function saveUcty() {
  var blocked = requireLoadOk('ucty'); if (blocked) return blocked;
  return await dbUpsert('ucty', UCTY_POLOZKY);
}
async function saveUklidLog() {
  var blocked = requireLoadOk('uklid_log'); if (blocked) return blocked;
  return await dbUpsert('uklid_log', UKLID_LOG);
}
async function savePenalizace() {
  var blocked = requireLoadOk('penalizace'); if (blocked) return blocked;
  return await dbUpsert('penalizace', PENALIZACE);
}
async function savePracovniDny() {
  var blocked = requireLoadOk('pracovni_dny'); if (blocked) return blocked;
  return await dbUpsert('pracovni_dny', PRACOVNI_DNY);
}
// Admin rovnou založí nového brigádníka jménem a PINem (bez registrace přes
// e-mail) - hodí se hlavně pro provozovny, kde lidi appku moc nepoužívají.
// ===================== VLOG (Kosatka) =====================
var VLOG_POSTS = [];
async function loadVlogPosts() {
  try {
    var r = await db.from('vlog_posts').select('*').order('vytvoreno', {ascending:false});
    if (r.error) throw r.error;
    VLOG_POSTS = r.data || [];
    await cleanupOldVlogPosts();
    return { ok:true };
  } catch(e) {
    console.error('Načtení VLOGu selhalo:', e);
    return { ok:false, error:e };
  }
}
// Příspěvky starší než 14 dní appka potichu smaže (i s fotkou v úložišti),
// pokaždé když někdo otevře VLOG. Žádný samostatný časovač na pozadí to
// nepotřebuje - stačí, že appku někdo běžně otevírá.
async function cleanupOldVlogPosts() {
  var hranice = new Date(); hranice.setDate(hranice.getDate()-14);
  var stare = VLOG_POSTS.filter(function(p){ return new Date(p.vytvoreno) < hranice; });
  for (var i=0; i<stare.length; i++) {
    await removeVlogPost(stare[i].id);
  }
}
function vlogStoragePathFromUrl(url) {
  if (!url) return null;
  var m = url.match(/\/avatars\/(.+)$/);
  return m ? m[1] : null;
}
async function addVlogPost(workerId, text, fotoFile) {
  var fotoUrl = null;
  if (fotoFile) {
    try {
      var ext = (fotoFile.name.split('.').pop() || 'jpg').toLowerCase();
      var path = 'vlog-'+workerId+'-'+Date.now()+'.'+ext;
      var up = await db.storage.from('avatars').upload(path, fotoFile, { upsert:true });
      if (up.error) return { ok:false, error:up.error };
      fotoUrl = db.storage.from('avatars').getPublicUrl(path).data.publicUrl;
    } catch(e) { return { ok:false, error:e }; }
  }
  try {
    var row = { worker_id:workerId, text:text||'', foto_url:fotoUrl };
    var res = await db.from('vlog_posts').insert([row]).select();
    if (res.error) return { ok:false, error:res.error };
    VLOG_POSTS.unshift(res.data[0]);
    return { ok:true };
  } catch(e) {
    return { ok:false, error:e };
  }
}
async function removeVlogPost(id) {
  var post = VLOG_POSTS.find(function(p){ return p.id===id; });
  if (post && post.foto_url) {
    var path = vlogStoragePathFromUrl(post.foto_url);
    if (path) { try { await db.storage.from('avatars').remove([path]); } catch(e) { console.error('Smazání fotky z úložiště selhalo:', e); } }
  }
  var res = await db.from('vlog_posts').delete().eq('id', id);
  if (!res.error) VLOG_POSTS = VLOG_POSTS.filter(function(p){ return p.id!==id; });
  return res;
}

// Nahraje profilovku do Supabase Storage (bucket "avatars", musí být předem
// ručně založený a nastavený jako public - viz migrace 008) a uloží veřejnou
// URL do workers.foto_url.
async function uploadProfilovka(workerId, file) {
  if (!file) return { ok:false, error:'Nevybral/a jsi žádný soubor.' };
  if (file.size > 5*1024*1024) return { ok:false, error:'Fotka je moc velká (max 5 MB).' };
  try {
    var ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    var path = 'worker-'+workerId+'-'+Date.now()+'.'+ext;
    var up = await db.storage.from('avatars').upload(path, file, { upsert:true });
    if (up.error) return { ok:false, error:up.error };
    var pub = db.storage.from('avatars').getPublicUrl(path);
    var url = pub.data.publicUrl;
    var res = await db.from('workers').update({ foto_url: url }).eq('id', workerId);
    if (res.error) return { ok:false, error:res.error };
    var w = getWorkerById(workerId);
    if (w) w.foto_url = url;
    return { ok:true, url:url };
  } catch(e) {
    return { ok:false, error:e };
  }
}

// Smaže zapsané hodiny (příchod/odchod) pro daný den - cílený delete
// jednoho řádku, bezpečné i při zastaralém poli v paměti.
async function removePracovniDen(id) {
  try {
    var res = await db.from('pracovni_dny').delete().eq('id', id);
    if (res && res.error) return { ok:false, error:res.error };
    PRACOVNI_DNY = PRACOVNI_DNY.filter(function(p){ return p.id!==id; });
    return { ok:true };
  } catch(e) {
    return { ok:false, error:e };
  }
}

// Dostupnost zvlášť pro každou "zaklad" provozovnu (Kosatka dál používá
// workers.dostupnost beze změny, tohle je jen pro Republiku/Anděl).
function getDostupnostVenue(workerId, venueId) {
  var row = WORKER_DOSTUPNOST.find(function(d){ return d.worker_id===workerId && d.venue_id===venueId; });
  return row ? (row.dny || []) : [];
}
async function saveMyDostupnostVenue(workerId, venueId, dates) {
  var existing = WORKER_DOSTUPNOST.find(function(d){ return d.worker_id===workerId && d.venue_id===venueId; });
  try {
    if (existing) {
      existing.dny = dates;
      var res = await db.from('worker_dostupnost').update({ dny: dates }).eq('id', existing.id);
      if (res.error) return { ok:false, error:res.error };
    } else {
      var row = { worker_id:workerId, venue_id:venueId, dny:dates };
      var res2 = await db.from('worker_dostupnost').insert([row]).select();
      if (res2.error) return { ok:false, error:res2.error };
      WORKER_DOSTUPNOST.push(res2.data[0]);
    }
    return { ok:true };
  } catch(e) {
    return { ok:false, error:'Nepovedlo se uložit (výpadek připojení?). Zkus to prosím znovu.' };
  }
}

// Admin rovnou založí nového brigádníka jménem a PINem (bez registrace přes
// e-mail) - hodí se hlavně pro provozovny, kde lidi appku moc nepoužívají.
async function createWorkerDirect(jmeno, pin, venueId) {
  var blocked = requireLoadOk('workers'); if (blocked) return blocked;
  jmeno = (jmeno||'').trim();
  pin = (pin||'').trim();
  if (!jmeno) return { ok:false, error:'Chybí jméno.' };
  if (!/^[0-9]{4}$/.test(pin)) return { ok:false, error:'PIN musí mít přesně 4 číslice.' };
  if (WORKERS.some(function(w){ return w.pin===pin; })) return { ok:false, error:'Tenhle PIN už někdo má, zvol jiný.' };
  var row = { id:getNextId(WORKERS), jmeno:jmeno, pin:pin, role:'user', misto:null, venue_id:venueId, dostupnost:[], schvaleno:true, email:null, auth_user_id:null };
  var res = await dbUpsert('workers', [row]);
  if (!res.ok) return res;
  WORKERS.push(row);
  return { ok:true, worker:row };
}

async function saveWorkers() {
  var blocked = requireLoadOk('workers'); if (blocked) return blocked;
  var rows = WORKERS.map(function(w) {
    return {
      id:w.id, jmeno:w.jmeno, pin:w.pin, role:w.role, misto:w.misto, dostupnost:w.dostupnost,
      email:w.email||null, auth_user_id:w.auth_user_id||null,
      venue_id:w.venue_id||null, schvaleno:(w.schvaleno===false?false:true)
    };
  });
  return await dbUpsert('workers', rows);
}

// Self-service uložení VLASTNÍ dostupnosti brigádníka. Záměrně NEpoužívá
// saveWorkers() (ten by upsertoval celou tabulku ze zastaralé paměti a mohl
// by tak přepsat i cizí řádky) - místo toho cíleně upraví jen jeden řádek
// podle id, takže nemůže smazat/přepsat data nikoho jiného.
async function saveMyDostupnost(workerId, dates) {
  try {
    var res = await db.from('workers').update({ dostupnost: dates }).eq('id', workerId);
    if (res && res.error) return { ok:false, error:res.error };
    var w = getWorkerById(workerId);
    if (w) w.dostupnost = dates;
    return { ok:true };
  } catch(e) {
    return { ok:false, error:'Nepovedlo se uložit (výpadek připojení?). Zkus to prosím znovu.' };
  }
}

// Viditelné upozornění nahoře na stránce, když se něco nepodařilo načíst -
// dřív appka v tomhle případě tiše jela dál se starými/výchozími daty a nikdo
// si ničeho nevšiml, dokud "nezmizely" hodiny nebo účty.
function showLoadErrorBannerIfNeeded() {
  var failed = Object.keys(LOAD_OK).filter(function(k){ return !LOAD_OK[k]; });
  var existing = document.getElementById('load-error-banner');
  if (!failed.length) {
    // Všechno se teď načetlo v pořádku - pokud tu z dřívějška visel varovný
    // pruh, schováme ho, ať tam nezůstává natrvalo.
    if (existing) existing.remove();
    return;
  }
  console.error('Nepodařilo se načíst tyto tabulky:', failed.join(', '));
  if (existing) return;
  var el = document.createElement('div');
  el.id = 'load-error-banner';
  el.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#dc2626;color:#fff;padding:10px 16px;font-size:14px;font-weight:600;text-align:center;';
  el.textContent = '⚠️ Nepodařilo se načíst data ze serveru (' + failed.join(', ') + '). Neukládej nic, dokud stránku neobnovíš (F5) - jinak hrozí ztráta dat.';
  document.body.appendChild(el);
}

// ===================== HELPERS =====================

function todayStr() {
  var d = new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function tomorrowStr() {
  var d = new Date(); d.setDate(d.getDate()+1);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function yesterdayStr() {
  var d = new Date(); d.setDate(d.getDate()-1);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function getMonthDays(year, month) {
  var days = [], last = new Date(year, month, 0).getDate();
  for (var d=1; d<=last; d++) days.push(year+'-'+String(month).padStart(2,'0')+'-'+String(d).padStart(2,'0'));
  return days;
}
function isWeekend(ds) {
  var p=ds.split('-'); var d=new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2]));
  return d.getDay()===0||d.getDay()===6;
}
function isMuzikaDay(ds) {
  var p=ds.split('-'); var d=new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2]));
  return MUZIKA_DNY.indexOf(d.getDay())!==-1;
}
function formatDate(ds) {
  var p=ds.split('-'); var d=new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2]));
  return ['Ne','Po','Út','St','Čt','Pá','So'][d.getDay()]+' '+d.getDate()+'.'+(d.getMonth()+1)+'.';
}
function formatDateFull(ds) {
  var p=ds.split('-'); var d=new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2]));
  var mn=['ledna','února','března','dubna','května','června','července','srpna','září','října','listopadu','prosince'];
  return d.getDate()+'. '+mn[d.getMonth()]+' '+d.getFullYear();
}
function getWorkerById(id) { for (var i=0;i<WORKERS.length;i++) if(WORKERS[i].id===id) return WORKERS[i]; return null; }
function getStanoviste(id) { for (var i=0;i<STANOVISTE.length;i++) if(STANOVISTE[i].id===id) return STANOVISTE[i]; return null; }
function getNextId(arr) { var m=0; for(var i=0;i<arr.length;i++) if(arr[i].id>m) m=arr[i].id; return m+1; }

function getSazba(mistoId, workerId) {
  var st = getStanoviste(mistoId);
  return (st && st.sazba) ? st.sazba : HODINOVA_SAZBA;
}

// Výpočet hodin z příchodu/odchodu (přes půlnoc ok)
function calcHodiny(prichod, odchod) {
  if (!prichod || !odchod) return 0;
  var ph = parseInt(prichod.split(':')[0]), pm = parseInt(prichod.split(':')[1]);
  var oh = parseInt(odchod.split(':')[0]), om = parseInt(odchod.split(':')[1]);
  var mins = (oh*60+om) - (ph*60+pm);
  if (mins < 0) mins += 24*60; // přes půlnoc
  return Math.round(mins/60 * 10) / 10;
}

// Najdi záznam pracovního dne
function getPracovniDen(workerId, datum) {
  for (var i=0; i<PRACOVNI_DNY.length; i++) {
    if (PRACOVNI_DNY[i].workerId===workerId && PRACOVNI_DNY[i].datum===datum) return PRACOVNI_DNY[i];
  }
  return null;
}

// Dny kde má brigádník směnu ale nezapsal příchod/odchod (pro upozornění)
function getMissingDays(workerId) {
  var today = todayStr();
  var missing = [];
  for (var i=0; i<SCHEDULE.length; i++) {
    var s = SCHEDULE[i];
    if (s.workerId !== workerId) continue;
    if (s.datum > today) continue; // jen minulé + dnes
    var pd = getPracovniDen(workerId, s.datum);
    if (!pd || !pd.prichod || !pd.odchod) {
      if (missing.indexOf(s.datum) === -1) missing.push(s.datum);
    }
  }
  return missing.sort();
}

function getVydelek(workerId) {
  var hodiny=0, hruby=0, pen=0, ucty=0;
  var today = todayStr();
  // Projdi všechny dny kde má směnu
  var smenyDny = {};
  for (var i=0; i<SCHEDULE.length; i++) {
    var s = SCHEDULE[i];
    if (s.workerId !== workerId) continue;
    if (s.datum > today) continue;
    if (!smenyDny[s.datum]) smenyDny[s.datum] = [];
    smenyDny[s.datum].push(s);
  }
  for (var datum in smenyDny) {
    var pd = getPracovniDen(workerId, datum);
    if (!pd || !pd.prichod || !pd.odchod) continue;
    var h = calcHodiny(pd.prichod, pd.odchod);
    hodiny += h;
    // Sazba podle stanoviště té směny
    var s0 = smenyDny[datum][0];
    hruby += h * getSazba(s0.mistoId, workerId);
  }
  for (var i=0; i<PENALIZACE.length; i++) if(PENALIZACE[i].workerId===workerId) pen += PENALIZACE[i].castka;
  for (var i=0; i<UCTY_POLOZKY.length; i++) { var p=UCTY_POLOZKY[i]; if(p.workerId===workerId&&!p.smazano) ucty+=p.castka; }
  return { hodiny:hodiny, hruby:hruby, penalizaceTotal:pen, uctyDluh:ucty, cisty:hruby-pen-ucty };
}

function getTotalVydelekFull(workerId) {
  // Včetně budoucích (pro admin přehled) - bere pevné hodiny z raspisu
  var hodiny=0, hruby=0;
  var seen = {};
  for (var i=0; i<SCHEDULE.length; i++) {
    var s = SCHEDULE[i];
    if (s.workerId !== workerId) continue;
    var pd = getPracovniDen(workerId, s.datum);
    if (pd && pd.prichod && pd.odchod) {
      if (!seen[s.datum]) {
        var h = calcHodiny(pd.prichod, pd.odchod);
        hodiny += h;
        hruby += h * getSazba(s.mistoId, workerId);
        seen[s.datum] = true;
      }
    }
  }
  return { hodiny:hodiny, hruby:hruby };
}


// ===================== TRŽBY (denní tržba podle oddělení) =====================
var TRZBA_MISTA = ['kramek','vycep','obcerstv','zmrzlina','restaurace'];
var TRZBY = [];

async function saveTrzbyAll() {
  if (!TRZBY.length) return;
  await db.from('trzby').upsert(TRZBY);
}
function getTrzba(mistoId, datum) {
  return TRZBY.find(function(t){return t.mistoId===mistoId && t.datum===datum;}) || null;
}
async function submitTrzba(mistoId, datum, castka, workerId, poznamka) {
  var existing = getTrzba(mistoId, datum);
  var kv = (typeof getVenueBySlug==='function') ? getVenueBySlug('kosatka') : null;
  if (existing) {
    existing.castka = castka; existing.workerId = workerId; existing.poznamka = poznamka||'';
    if (kv && !existing.venue_id) existing.venue_id = kv.id;
    await db.from('trzby').upsert([existing]);
    return existing;
  }
  var row = { id: getNextId(TRZBY), mistoId: mistoId, datum: datum, castka: castka, workerId: workerId||null, poznamka: poznamka||'', venue_id: kv ? kv.id : null };
  TRZBY.push(row);
  await db.from('trzby').upsert([row]);
  return row;
}
function getTrzbyForMonth(year, month) {
  var prefix = year+'-'+String(month).padStart(2,'0');
  return TRZBY.filter(function(t){return t.datum.indexOf(prefix)===0;});
}

// ===================== ÚČTY (položky se NIKDY nesmí trvale smazat) =====================
// Přidání položky na účet - ukládá se hned a jednotlivě (ne celé pole najednou), aby selhání
// uložení jedné položky nemohlo ovlivnit ostatní, a aby šlo spolehlivě poznat, jestli se zápis povedl.
// produktId/mnozstvi jsou nepovinné - když je brigádník vybere ze skladu, dá se to přesně dohledat
// při týdenním porovnání skladu (protože do popisu si lidi často píšou jen "pivo" apod.)
async function addUcetPolozka(workerId, mistoId, popis, castka, produktId, mnozstvi) {
  var row = { id:getNextId(UCTY_POLOZKY), workerId:workerId, datum:todayStr(), mistoId:mistoId, popis:popis, castka:castka, smazano:false, produktId:produktId||null, mnozstvi:produktId?(mnozstvi||1):null };
  try {
    var res = await db.from('ucty').upsert([row]);
    if (res && res.error) return { ok:false, error:res.error };
  } catch(e) {
    return { ok:false, error:e };
  }
  UCTY_POLOZKY.push(row); // do lokální paměti přidáme AŽ po potvrzeném uložení do databáze
  return { ok:true, row:row };
}

// Kapela hraje a pije na účet PODNIKU (ne na účet žádného konkrétního brigádníka).
// Zapisuje výčepák/ka - workerId je null, aby se to nikdy nepočítalo do ničího
// osobního dluhu (getVydelek filtruje jen workerId===currentUser.id).
// odepsanoBy = kdo (jaký brigádník) to na účet podniku odepsal, pro dohledatelnost.
async function addKapelaPolozka(odepsanoByWorkerId, mistoId, kapelaNazev, popis, castka, produktId, mnozstvi) {
  var row = {
    id:getNextId(UCTY_POLOZKY), workerId:null, datum:todayStr(), mistoId:mistoId,
    popis:popis, castka:castka, smazano:false, produktId:produktId||null, mnozstvi:produktId?(mnozstvi||1):null,
    typ:'kapela', kapela_nazev:kapelaNazev||'Kapela', hrazeno_podnikem:true,
    odepsano_by:odepsanoByWorkerId, odepsano_at:new Date().toISOString()
  };
  try {
    var res = await db.from('ucty').upsert([row]);
    if (res && res.error) return { ok:false, error:res.error };
  } catch(e) {
    return { ok:false, error:e };
  }
  UCTY_POLOZKY.push(row);
  return { ok:true, row:row };
}

function getKapelaPolozky() {
  return UCTY_POLOZKY.filter(function(p){ return p.typ==='kapela' && !p.smazano; })
    .sort(function(a,b){ return b.datum.localeCompare(a.datum) || b.id-a.id; });
}

// Úprava položky na účtu - POUZE admin, nikdy nejde smazat. Původní hodnoty se zachovají
// pro transparentnost (je vidět, že a jak byla položka opravena).
async function updateUcetPolozka(id, fields) {
  var p = UCTY_POLOZKY.find(function(x){return x.id===id;});
  if (!p) return { ok:false, error:'Položka nenalezena' };
  var puvodniPopis = p.upraveno ? p.puvodniPopis : p.popis;
  var puvodniCastka = p.upraveno ? p.puvodniCastka : p.castka;
  var updated = Object.assign({}, p, fields, { upraveno:true, puvodniPopis:puvodniPopis, puvodniCastka:puvodniCastka });
  try {
    var res = await db.from('ucty').upsert([updated]);
    if (res && res.error) return { ok:false, error:res.error };
  } catch(e) {
    return { ok:false, error:e };
  }
  Object.assign(p, updated);
  return { ok:true };
}


function nowClockStr() {
  var d = new Date();
  var dn=['Neděle','Pondělí','Úterý','Středa','Čtvrtek','Pátek','Sobota'];
  var hh=String(d.getHours()).padStart(2,'0'), mm=String(d.getMinutes()).padStart(2,'0'), ss=String(d.getSeconds()).padStart(2,'0');
  return dn[d.getDay()]+' '+d.getDate()+'.'+(d.getMonth()+1)+'.'+d.getFullYear()+' \u00b7 '+hh+':'+mm+':'+ss;
}
function startLiveClock(elId) {
  var el = document.getElementById(elId);
  if (!el) return;
  function tick(){ el.textContent = nowClockStr(); }
  tick();
  setInterval(tick, 1000);
}

// ===================== VÝPLATY (evidence vyplacených peněz) =====================
var VYPLATY = [];

async function saveVyplaty() {
  return await dbUpsert('vyplaty', VYPLATY);
}

function getVyplaceno(workerId) {
  var total = 0;
  for (var i=0;i<VYPLATY.length;i++) if (VYPLATY[i].workerId===workerId) total += VYPLATY[i].castka;
  return total;
}

// Množina všech dnů, které už byly zahrnuté v nějaké výplatě (bez ohledu na to, jestli šlo o souvislé období)
function getVyplacenDny(workerId) {
  var set = {};
  for (var i=0;i<VYPLATY.length;i++) {
    var v = VYPLATY[i];
    if (v.workerId!==workerId) continue;
    (v.dny||[]).forEach(function(d){ set[d]=true; });
  }
  return set;
}

function getVyplatyForWorker(workerId) {
  return VYPLATY.filter(function(v){return v.workerId===workerId;}).sort(function(a,b){return b.datum.localeCompare(a.datum);});
}

// Uloží novou výplatu - "dny" je pole konkrétních dat, které tato výplata pokrývá
async function addVyplata(workerId, castka, poznamka, dny) {
  var v = { id:getNextId(VYPLATY), workerId:workerId, datum:todayStr(), castka:castka, poznamka:poznamka||'', dny:dny||[] };
  var res = await dbUpsert('vyplaty', [v]);
  if (!res.ok) return { ok:false, error:res.error };
  VYPLATY.push(v);
  return { ok:true, row:v };
}

async function delVyplata(id) {
  try {
    var res = await db.from('vyplaty').delete().eq('id', id);
    if (res && res.error) return { ok:false, error:res.error };
  } catch(e) { return { ok:false, error:e }; }
  VYPLATY = VYPLATY.filter(function(v){return v.id!==id;});
  return { ok:true };
}

// ===================== STANOVIŠTĚ PRO DEN (fallback mimo rozpis) =====================
// Pro výpočet výdělku a sazby v den, kdy brigádník nemá naplánovanou směnu
// (např. si jen dopisuje čas z předchozí noci), použij jeho výchozí stanoviště.
function getMistoProDen(workerId, datum) {
  var s = SCHEDULE.find(function(x){return x.workerId===workerId && x.datum===datum;});
  if (s) return s.mistoId;
  var w = getWorkerById(workerId);
  return w ? w.misto : null;
}

// Vrátí seznam VŠECH nevyplacených dnů brigádníka (s hodinami/Kč pro ten den), seřazené od nejstaršího.
// Používá se v modálu "Vyplatit", aby admin mohl vybrat přesně, za které dny teď platí.
function getNevyplaceneDny(workerId) {
  var paidDays = getVyplacenDny(workerId);
  var today = todayStr();
  var seen = {};
  var out = [];
  for (var i=0;i<PRACOVNI_DNY.length;i++) {
    var pd = PRACOVNI_DNY[i];
    if (pd.workerId!==workerId) continue;
    if (pd.datum > today) continue;
    if (!pd.prichod || !pd.odchod) continue;
    if (seen[pd.datum]) continue;
    seen[pd.datum]=true;
    if (paidDays[pd.datum]) continue;
    var h = calcHodiny(pd.prichod, pd.odchod);
    var mistoId = getMistoProDen(workerId, pd.datum);
    var hruby = h*getSazba(mistoId, workerId);
    var pen = 0;
    for (var j=0;j<PENALIZACE.length;j++) { var pn=PENALIZACE[j]; if (pn.workerId===workerId && pn.datum===pd.datum) pen+=pn.castka; }
    var ucty = 0;
    for (var k=0;k<UCTY_POLOZKY.length;k++) { var uc=UCTY_POLOZKY[k]; if (uc.workerId===workerId && !uc.smazano && uc.datum===pd.datum) ucty+=uc.castka; }
    out.push({ datum:pd.datum, hodiny:h, hruby:hruby, penalizace:pen, ucty:ucty, cisty:hruby-pen-ucty });
  }
  out.sort(function(a,b){return a.datum.localeCompare(b.datum);});
  return out;
}

// ===================== PŘEPOČET VÝDĚLKU (bere jen dny, co ještě nebyly v žádné výplatě) =====================
function getVydelek(workerId) {
  var dny = getNevyplaceneDny(workerId);
  var hodiny=0, hruby=0, pen=0, ucty=0;
  dny.forEach(function(d){ hodiny+=d.hodiny; hruby+=d.hruby; pen+=d.penalizace; ucty+=d.ucty; });
  var vyplaceno = getVyplaceno(workerId);
  return { hodiny:hodiny, hruby:hruby, penalizaceTotal:pen, uctyDluh:ucty, vyplaceno:vyplaceno, cisty:hruby-pen-ucty, nevyplaceneDny:dny };
}

function getTotalVydelekFull(workerId) {
  var hodiny=0, hruby=0;
  var seen = {};
  for (var i=0;i<PRACOVNI_DNY.length;i++) {
    var pd = PRACOVNI_DNY[i];
    if (pd.workerId!==workerId) continue;
    if (!pd.prichod || !pd.odchod) continue;
    if (seen[pd.datum]) continue;
    seen[pd.datum]=true;
    var h = calcHodiny(pd.prichod, pd.odchod);
    hodiny += h;
    var mistoId = getMistoProDen(workerId, pd.datum);
    hruby += h * getSazba(mistoId, workerId);
  }
  return { hodiny:hodiny, hruby:hruby };
}

// ===================== SKLAD (Krámek + Výčep) =====================
var SKLAD_PRODUKTY = [];
var SKLAD_POHYBY = [];
var SKLAD_INVENTURY = [];
var SKLAD_PRODEJE = [];

// Kolik 4cl panáků je typicky v jedné 0,7l lahvi lihoviny (pro přepočet "zbývá X panáků" na desetinnou část lahve)
var PANAKU_NA_LAHEV = 17;

var SKLAD_KATEGORIE_KRAM = ['Potraviny','Cukrovinky','Hračky','Alkoholické nápoje','Nealkoholické nápoje','Drogerie','Pečivo','Ostatní'];
var SKLAD_KATEGORIE_VYCEP = ['Pivo','Víno','Lihoviny','Nealko/Mixery','Ostatní'];
function getKategorieList(sklad) {
  return sklad==='vycep' ? SKLAD_KATEGORIE_VYCEP : SKLAD_KATEGORIE_KRAM;
}


// Rozřadí produkt do jedné z 8 kategorií podle názvu (podle klíčových slov a značek).
// Používá se jak pro nové produkty, tak pro přeřazení už existujících v tlačítku "Přegenerovat kategorie".
function classifyKategorie(sklad, nazev) {
  function noDia(s) {
    return s.replace(/[áàâä]/g,'a').replace(/[éèêë]/g,'e').replace(/[íìîï]/g,'i').replace(/[óòôö]/g,'o')
      .replace(/[úùûü]/g,'u').replace(/ý/g,'y').replace(/č/g,'c').replace(/ď/g,'d').replace(/ě/g,'e')
      .replace(/ň/g,'n').replace(/ř/g,'r').replace(/š/g,'s').replace(/ť/g,'t').replace(/ů/g,'u').replace(/ž/g,'z');
  }
  var s = noDia(String(nazev).toLowerCase());

  if (sklad === 'vycep') {
    var PIVO = ['pivo','gambrinus','pilsner','chodovar','birell','frisco','radegast','staropramen','krusovice','heineken','corona','branik','kelimek - pivo','reza'];
    var VINO = ['vino','sekt','prosecco','prosseco','prosecoo','strik','houba','frankovka','bostavan','borgomori'];
    for (var i=0;i<PIVO.length;i++) if (s.indexOf(PIVO[i])!==-1) return 'Pivo';
    for (var i=0;i<VINO.length;i++) if (s.indexOf(VINO[i])!==-1) return 'Víno';
    var NEALKO_MIX = ['tonic','cola','kelimek','zapalovac'];
    for (var i=0;i<NEALKO_MIX.length;i++) if (s.indexOf(NEALKO_MIX[i])!==-1) return 'Nealko/Mixery';
    return 'Lihoviny';
  }

  var RULES = [
    ['Pečivo', ['rohlik','chleb','houska','bageta','loupak','vdolek','satecek','strudl',' veka','koblih','bulka','toust','preclik','briosk','croissant','crois.']],
    ['Cukrovinky', ['cokolad','bonbon','lizatk','lizatka','zvyka','zvykac','susenk','oplatk','keks','tycink',
      'haribo','kitkat','mentos','chupa','orion','twix','bounty','mars ','marsu','snickers','milka','kinder',
      'lentilk','dropsy','gumov','marshmall','wafer','pribiniov','fidorka','margot','yoyo','cool ','lollipop',
      'griliash','delisia','manner','milkway','toffifee','skittles','duo penotti','nutella','3bit','shoko',
      'porleo','anita','bebeto','bonpari','casali','corny','exara','figaro','fitness ber','florian','hit choco',
      'hit nuts','horicke trub','jojo','m&m','mickey lolipops','nimm2','pez ','papita','sour mad','sour powder',
      'tictac','twister','argo lizatk','balzam jahoda','bananas tom','bananas john','duo kmotr','smilies',
      'cukr.vata','candy schaum','4d fruit gummy','7days coc','7days crois','7day','crois. clasic','crois. maxi','crois. org',
      'airwaves','alaska cocoa','alaska coconut','alaska hazelnut','alaska milk','alaska nuts','balila trub','hortice','orbit ']],
    ['Hračky', ['hracka','panenk','auticko','bublifuk','pistole na vodu','nafukovac','plysak','vetrnik','frisbee','skakac','bublinov','stavebnice','popups marvel','music monkey']],
    ['Alkoholické nápoje', ['pivo','vino','vodka','whisk','liker','jack daniels','martini','fernet','becherovk','griotte','slivovic',
      'absinth','tequila','metaxa','baileys','jagermeister','campari','bozkov','chnapka','duo kmotr',
      'corona extra','branik','krusovice','heineken','gambrinus','pilsner','radegast','staropramen','stella',
      'frankovka','bostavan','borgomori','avanti spritz','chodovar']],
    ['Nealkoholické nápoje', ['voda','limonad',' kola','cola','fanta','sprite','ledovy caj','ice tea','icetea','dzus','juice',
      'energetick','redbull','red bull','monster','birell','kinley','tonic','vitamin water','isotonic',
      'powerade','aloe vera','fuzetea','fuze tea','mattoni','rajec','toma ','relax ','cappy','frisco',
      'pepsi','schweppes','semtex','big shock','4move','adrenalin','aquila','beneta','devore','excelent',
      'natura nepe','vitalfruit','jemca ','jemca lesni','cosmos do vody','eis kaffe','eiskaffe','concertino',
      'basil drink','bomba jungle','bomba pink']],
    ['Drogerie', ['opalovac','repelent','mydlo','sampon','zubni pasta','vlhcene ubrousky','deodorant','plena','vlozk',
      'zilet','toaletni papir','toaletmi papir','kapesnik','krem na','hygien','nivea','pasta na zuby',
      'aquafresh','always classic','huggies','indulona','odol','palmolive','phantom kartacek','astrid',
      'fresh air','fa kids']],
    ['Potraviny', ['pizza','chips','sunka','salam','klobas','parek','sardink','konzerv','tunak','majonez','kecup',
      'horcice','dzem','med','maslo',' syr','jogurt','mleko','vejce','rybi','krekr','arasid','orisk',
      'pochutin','pistaci','burak','slanin','kimchi','a-one','polevka','tortilla','burger','hot dog',
      'pribina','pomazank','veprove','hovezi','kachni','kureci','cheddar','eidam','gervais','hame ',
      'herkules','madeta','majka','rixy','smetanito','viva pastika','dobre horicke jog','bibis',
      'texas tuna','bramburky','bohemia','cheetos','arado popcorn','aro krupky','bersi','cinema',
      'lednacek','misa jahoda','misa tvaroh','seville premium','chocapic','jihlavanka','marila standart',
      'mokate','nescafe','paprikas','snotsqueeze','sul 1kg',' sul ','sul1kg']]
  ];
  for (var i=0;i<RULES.length;i++) {
    var cat=RULES[i][0], keys=RULES[i][1];
    for (var j=0;j<keys.length;j++) if (s.indexOf(keys[j])!==-1) return cat;
  }
  return 'Ostatní';
}

// Přeřadí kategorie u VŠECH existujících produktů podle názvu (pro opravu starých dat po nasazení)
async function reklasifikujVsechnyKategorie() {
  var toSave = [];
  for (var i=0;i<SKLAD_PRODUKTY.length;i++) {
    var p = SKLAD_PRODUKTY[i];
    var novaKat = classifyKategorie(p.sklad, p.nazev);
    if (p.kategorie !== novaKat) { p.kategorie = novaKat; toSave.push(p); }
  }
  if (toSave.length) await db.from('sklad_produkty').upsert(toSave);
  return toSave.length;
}

var SKLAD_PRODUKTY_SEED = [{"id": 1, "sklad": "vycep", "nazev": "Pilsner Urquell (sud)", "kategorie": "Pivo", "jednotka": "sud", "mnozstvi": 0, "aktivni": true}, {"id": 2, "sklad": "vycep", "nazev": "Chodovar 11° (sud)", "kategorie": "Pivo", "jednotka": "sud", "mnozstvi": 0, "aktivni": true}, {"id": 3, "sklad": "vycep", "nazev": "Chodovar tmavé (sud)", "kategorie": "Pivo", "jednotka": "sud", "mnozstvi": 0, "aktivni": true}, {"id": 4, "sklad": "vycep", "nazev": "Gambrinus 11 (sud)", "kategorie": "Pivo", "jednotka": "sud", "mnozstvi": 0, "aktivni": true}, {"id": 5, "sklad": "vycep", "nazev": "Frisco", "kategorie": "Nealko/Mixery", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 6, "sklad": "vycep", "nazev": "Pivo řezané (sud)", "kategorie": "Pivo", "jednotka": "sud", "mnozstvi": 0, "aktivni": true}, {"id": 7, "sklad": "vycep", "nazev": "Gambrinus 10° (sud)", "kategorie": "Pivo", "jednotka": "sud", "mnozstvi": 0, "aktivni": true}, {"id": 8, "sklad": "vycep", "nazev": "Gambrinus (sud)", "kategorie": "Pivo", "jednotka": "sud", "mnozstvi": 0, "aktivni": true}, {"id": 9, "sklad": "vycep", "nazev": "Birell (plechovka)", "kategorie": "Pivo", "jednotka": "plechovka", "mnozstvi": 0, "aktivni": true}, {"id": 10, "sklad": "vycep", "nazev": "Pilsner Urquell (plechovka)", "kategorie": "Pivo", "jednotka": "plechovka", "mnozstvi": 0, "aktivni": true}, {"id": 11, "sklad": "vycep", "nazev": "Kelímek - Pivo", "kategorie": "Pivo", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 12, "sklad": "vycep", "nazev": "Prosecco (láhev)", "kategorie": "Víno", "jednotka": "láhev", "mnozstvi": 0, "aktivni": true}, {"id": 13, "sklad": "vycep", "nazev": "Víno dle nabídky (láhev)", "kategorie": "Víno", "jednotka": "láhev", "mnozstvi": 0, "aktivni": true}, {"id": 14, "sklad": "vycep", "nazev": "Střik (láhev vína)", "kategorie": "Víno", "jednotka": "láhev", "mnozstvi": 0, "aktivni": true}, {"id": 15, "sklad": "vycep", "nazev": "Houba (láhev vína)", "kategorie": "Víno", "jednotka": "láhev", "mnozstvi": 0, "aktivni": true}, {"id": 16, "sklad": "vycep", "nazev": "Bohemia sekt demi 0,75l", "kategorie": "Víno", "jednotka": "láhev", "mnozstvi": 0, "aktivni": true}, {"id": 17, "sklad": "vycep", "nazev": "Bailey's", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 18, "sklad": "vycep", "nazev": "Amundsen Jablko", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 19, "sklad": "vycep", "nazev": "Amundsen Meloun", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 20, "sklad": "vycep", "nazev": "Beafeter Pink", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 21, "sklad": "vycep", "nazev": "Božkov Jablko", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 22, "sklad": "vycep", "nazev": "Božkov Káva", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 23, "sklad": "vycep", "nazev": "Božkov Rum mandle", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 24, "sklad": "vycep", "nazev": "Božkov Vodka", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 25, "sklad": "vycep", "nazev": "Capitan Morgan Pineapl", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 26, "sklad": "vycep", "nazev": "Jack Daniels Apple", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 27, "sklad": "vycep", "nazev": "Jack Daniels Fire", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 28, "sklad": "vycep", "nazev": "Jameson", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 29, "sklad": "vycep", "nazev": "Rum Diplomatico Excl.", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 30, "sklad": "vycep", "nazev": "Metaxa 5*", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 31, "sklad": "vycep", "nazev": "Absolut", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 32, "sklad": "vycep", "nazev": "Havana Club Aňejo 3", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 33, "sklad": "vycep", "nazev": "Captain Morgan Spic.", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 34, "sklad": "vycep", "nazev": "Legendario Elixir", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 35, "sklad": "vycep", "nazev": "Olmeca Gold", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 36, "sklad": "vycep", "nazev": "Olmeca Silver", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 37, "sklad": "vycep", "nazev": "Beefeater", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 38, "sklad": "vycep", "nazev": "Jägermeister", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 39, "sklad": "vycep", "nazev": "Becherovka", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 40, "sklad": "vycep", "nazev": "Becherovka Lemond", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 41, "sklad": "vycep", "nazev": "Magistr", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 42, "sklad": "vycep", "nazev": "Fernet Stock", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 43, "sklad": "vycep", "nazev": "Fernet Citrus", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 44, "sklad": "vycep", "nazev": "Koskenkorva peach", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 45, "sklad": "vycep", "nazev": "Amundsen", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 46, "sklad": "vycep", "nazev": "Aperol", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 47, "sklad": "vycep", "nazev": "Božkov Griotka", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 48, "sklad": "vycep", "nazev": "Božkov Zelená", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 49, "sklad": "vycep", "nazev": "Polar Jahoda", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 50, "sklad": "vycep", "nazev": "Božkov Rum", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 51, "sklad": "vycep", "nazev": "Slivovice", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 52, "sklad": "vycep", "nazev": "Tullamore Dew", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 53, "sklad": "vycep", "nazev": "Johnnie Walker", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 54, "sklad": "vycep", "nazev": "Jim Beam", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 55, "sklad": "vycep", "nazev": "Jack Daniels Honey", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 56, "sklad": "vycep", "nazev": "Jack Daniels orig.", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 57, "sklad": "vycep", "nazev": "Rum Republica", "kategorie": "Lihoviny", "jednotka": "4cl", "mnozstvi": 0, "aktivni": true}, {"id": 58, "sklad": "kram", "nazev": "3Bit classic", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 59, "sklad": "kram", "nazev": "3Bit nuts 46g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 60, "sklad": "kram", "nazev": "3Bite 46g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 61, "sklad": "kram", "nazev": "4D Fruit gummy 65g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 62, "sklad": "kram", "nazev": "4Move Orange 750ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 63, "sklad": "kram", "nazev": "7Days Coc. Bar vani. 32g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 64, "sklad": "kram", "nazev": "7Days crois. Clasic 60g", "kategorie": "Pečivo", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 65, "sklad": "kram", "nazev": "7Days crois. Maxi 98g", "kategorie": "Pečivo", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 66, "sklad": "kram", "nazev": "7Days crois. Org. 60g", "kategorie": "Pečivo", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 67, "sklad": "kram", "nazev": "7days Cocoa bar 30g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 68, "sklad": "kram", "nazev": "A-one hovezi 85g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 69, "sklad": "kram", "nazev": "A-one kachni 85g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 70, "sklad": "kram", "nazev": "A-one veprove 85g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 71, "sklad": "kram", "nazev": "Adrenalin cactus 250ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 72, "sklad": "kram", "nazev": "Adrenalin classic 250ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 73, "sklad": "kram", "nazev": "Airwaves Cool Classis", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 74, "sklad": "kram", "nazev": "Airwaves Lime 14g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 75, "sklad": "kram", "nazev": "Alaska Cocoa Cr. 18g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 76, "sklad": "kram", "nazev": "Alaska Coconut Cr. 18g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 77, "sklad": "kram", "nazev": "Alaska Hazelnut Cream", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 78, "sklad": "kram", "nazev": "Alaska Milk Cr. 18g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 79, "sklad": "kram", "nazev": "Alaska Nuts cr. 18g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 80, "sklad": "kram", "nazev": "Alex lizatko Mouth 15g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 81, "sklad": "kram", "nazev": "Aloe Vera", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 82, "sklad": "kram", "nazev": "Always Classic Night", "kategorie": "Drogerie", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 83, "sklad": "kram", "nazev": "Anita 50g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 84, "sklad": "kram", "nazev": "Anita Nugatova 50g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 85, "sklad": "kram", "nazev": "Aquafresh 100ml", "kategorie": "Drogerie", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 86, "sklad": "kram", "nazev": "Aquila bros. Light 1,5L", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 87, "sklad": "kram", "nazev": "Aquila cerny bros. 1,5L", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 88, "sklad": "kram", "nazev": "Aquila cerny citron 1,5L", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 89, "sklad": "kram", "nazev": "Aquila zeleny cit. 1,5L", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 90, "sklad": "kram", "nazev": "Arado Popcorn 90g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 91, "sklad": "kram", "nazev": "Arado Slane Tycinky 43g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 92, "sklad": "kram", "nazev": "Aro Arasidove Krupky 70g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 93, "sklad": "kram", "nazev": "Aro Tav. Syr 140g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 94, "sklad": "kram", "nazev": "Aro kartáček medium", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 95, "sklad": "kram", "nazev": "Aro krupky 70g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 96, "sklad": "kram", "nazev": "Avanti Spritz 0,75L", "kategorie": "Alkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 97, "sklad": "kram", "nazev": "Balila Trub. Kokos 18g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 98, "sklad": "kram", "nazev": "Bananas Tom 25ml", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 99, "sklad": "kram", "nazev": "Basil drink Cockt. 290ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 100, "sklad": "kram", "nazev": "Basil drink Lychee 290ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 101, "sklad": "kram", "nazev": "Basil drink Wat. 290ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 102, "sklad": "kram", "nazev": "Bebeto Super Belts 75g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 103, "sklad": "kram", "nazev": "Bebeto sour 35g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 104, "sklad": "kram", "nazev": "Bebeto sticks", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 105, "sklad": "kram", "nazev": "Beneta Jemne p. 2L", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 106, "sklad": "kram", "nazev": "Beneta Nep. 2L", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 107, "sklad": "kram", "nazev": "Beneta Perliva 2L", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 108, "sklad": "kram", "nazev": "Bersi Jalapeno 120g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 109, "sklad": "kram", "nazev": "Bersi Uzena Sunka 60g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 110, "sklad": "kram", "nazev": "Bersi XXL 120g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 111, "sklad": "kram", "nazev": "Bersi pikantni 120g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 112, "sklad": "kram", "nazev": "Bersi syr. Koule 120g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 113, "sklad": "kram", "nazev": "Bersi syr. Maxi 300g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 114, "sklad": "kram", "nazev": "Bibis instant. 55g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 115, "sklad": "kram", "nazev": "Boh. Sunka - 100g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 116, "sklad": "kram", "nazev": "Boh. Vroubky Pizza 120g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 117, "sklad": "kram", "nazev": "Bohemia Krispers 60g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 118, "sklad": "kram", "nazev": "Bohemia Solene 130g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 119, "sklad": "kram", "nazev": "Bohemia Tycinky Solene", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 120, "sklad": "kram", "nazev": "Bohemia chips syr 130g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 121, "sklad": "kram", "nazev": "Bohemia hrad. Kmin 100g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 122, "sklad": "kram", "nazev": "Bohemia hrad. Kmin 90g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 123, "sklad": "kram", "nazev": "Bohemia krispers 60g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 124, "sklad": "kram", "nazev": "Bohemia krupky ars. 100g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 125, "sklad": "kram", "nazev": "Bohemia krupky ars. 50g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 126, "sklad": "kram", "nazev": "Bohemia krupky mega 150g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 127, "sklad": "kram", "nazev": "Bohemia paprika 130g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 128, "sklad": "kram", "nazev": "Bohemia slanina 130g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 129, "sklad": "kram", "nazev": "Bohemia spiz 130g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 130, "sklad": "kram", "nazev": "Bohemia sul 130g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 131, "sklad": "kram", "nazev": "Bohemia sul 60g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 132, "sklad": "kram", "nazev": "Bohemia tyc. Sol. 160g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 133, "sklad": "kram", "nazev": "Bohemia tyc. Sul 80g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 134, "sklad": "kram", "nazev": "Bohemia tyc. Syr 80g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 135, "sklad": "kram", "nazev": "Bohemia vro. Horc. 120g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 136, "sklad": "kram", "nazev": "Bohemia vro. Sul 120g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 137, "sklad": "kram", "nazev": "Bomba jungle 250ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 138, "sklad": "kram", "nazev": "Bomba pink 250ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 139, "sklad": "kram", "nazev": "BonPari org. 90g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 140, "sklad": "kram", "nazev": "Borgomori Bianco 0,75L", "kategorie": "Alkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 141, "sklad": "kram", "nazev": "Bostavan Chardo. 0,75L", "kategorie": "Alkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 142, "sklad": "kram", "nazev": "Bostavan Merlot 0,75L", "kategorie": "Alkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 143, "sklad": "kram", "nazev": "Bozkov Vodka 0,2L", "kategorie": "Alkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 144, "sklad": "kram", "nazev": "Bozkov original 200ml", "kategorie": "Alkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 145, "sklad": "kram", "nazev": "Bozkov vodka 0,04L", "kategorie": "Alkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 146, "sklad": "kram", "nazev": "Bramburky hosp. Ces. 70g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 147, "sklad": "kram", "nazev": "Bramburky hospo. Sul 70g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 148, "sklad": "kram", "nazev": "Bramburky hospo. Syr 70g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 149, "sklad": "kram", "nazev": "Branik Lezak 0,5L", "kategorie": "Alkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 150, "sklad": "kram", "nazev": "Brikety", "kategorie": "Ostatní", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 151, "sklad": "kram", "nazev": "Candy schaum 70ml", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 152, "sklad": "kram", "nazev": "Cappy - jablko", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 153, "sklad": "kram", "nazev": "Cappy - pomeranc  200ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 154, "sklad": "kram", "nazev": "Casali bananXL 140g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 155, "sklad": "kram", "nazev": "Cheddar 100g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 156, "sklad": "kram", "nazev": "Cheetos cheese 80g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 157, "sklad": "kram", "nazev": "Cheetos ketchup 85g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 158, "sklad": "kram", "nazev": "Chleb - 1/2", "kategorie": "Pečivo", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 159, "sklad": "kram", "nazev": "Chleb - 200g", "kategorie": "Pečivo", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 160, "sklad": "kram", "nazev": "Chleb cely", "kategorie": "Pečivo", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 161, "sklad": "kram", "nazev": "Chleba cely 1200g", "kategorie": "Pečivo", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 162, "sklad": "kram", "nazev": "Chnapka", "kategorie": "Alkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 163, "sklad": "kram", "nazev": "Chocapic 25g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 164, "sklad": "kram", "nazev": "ChupaCh. Zvyk. Paint 27g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 165, "sklad": "kram", "nazev": "ChupaChups Babol 27g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 166, "sklad": "kram", "nazev": "ChupaChups Fro. Pop 26g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 167, "sklad": "kram", "nazev": "ChupaChups Melody 15g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 168, "sklad": "kram", "nazev": "Cinema Time Ham Cheese", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 169, "sklad": "kram", "nazev": "Cinema Time Salted 90g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 170, "sklad": "kram", "nazev": "CinemaTime - butter", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 171, "sklad": "kram", "nazev": "CinemaTime - salted", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 172, "sklad": "kram", "nazev": "Coca Cola", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 173, "sklad": "kram", "nazev": "CocaCola - 500ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 174, "sklad": "kram", "nazev": "CocaCola - zero 330ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 175, "sklad": "kram", "nazev": "CocaCola 1l", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 176, "sklad": "kram", "nazev": "CocaCola 330ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 177, "sklad": "kram", "nazev": "Cola 2l", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 178, "sklad": "kram", "nazev": "Cola zero - 2L", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 179, "sklad": "kram", "nazev": "Concertino Light Fresh", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 180, "sklad": "kram", "nazev": "Cool Cit. 500ml", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 181, "sklad": "kram", "nazev": "Corny Banan 50g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 182, "sklad": "kram", "nazev": "Corny Big Banana", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 183, "sklad": "kram", "nazev": "Corny Big Brownie", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 184, "sklad": "kram", "nazev": "Corny Big Straberry", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 185, "sklad": "kram", "nazev": "Corny Coconut 50g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 186, "sklad": "kram", "nazev": "Corny Cranbery 50g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 187, "sklad": "kram", "nazev": "Corny Protein", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 188, "sklad": "kram", "nazev": "Corny brownie 50g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 189, "sklad": "kram", "nazev": "Corny chocolate 40g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 190, "sklad": "kram", "nazev": "Corny white 40g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 191, "sklad": "kram", "nazev": "Corona extra 0,355L", "kategorie": "Alkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 192, "sklad": "kram", "nazev": "Cosmos do vody 10ks", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 193, "sklad": "kram", "nazev": "Ctyrlistek Zvykacky 35g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 194, "sklad": "kram", "nazev": "Cukr.Vata Minions 20g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 195, "sklad": "kram", "nazev": "Devore Canella 500ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 196, "sklad": "kram", "nazev": "Devore Orange 500ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 197, "sklad": "kram", "nazev": "DobraVoda J. Per -1,5L", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 198, "sklad": "kram", "nazev": "DobraVoda Jah.Nep. 1,5L", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 199, "sklad": "kram", "nazev": "DobraVoda Mal. Nep. 1,5L", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 200, "sklad": "kram", "nazev": "DobraVoda Nep. 1.5L", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 201, "sklad": "kram", "nazev": "Dobre horicke jog. 38g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 202, "sklad": "kram", "nazev": "Dobre horicke orisky 38g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 203, "sklad": "kram", "nazev": "Duo Kmotr - 75g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 204, "sklad": "kram", "nazev": "Eidam 100g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 205, "sklad": "kram", "nazev": "Eis kaffe - 250 ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 206, "sklad": "kram", "nazev": "EisKaffe", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 207, "sklad": "kram", "nazev": "Exara Caramel 90g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 208, "sklad": "kram", "nazev": "Excelent - 500ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 209, "sklad": "kram", "nazev": "Fa Kids 250ml", "kategorie": "Drogerie", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 210, "sklad": "kram", "nazev": "Fanta - shokata 330ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 211, "sklad": "kram", "nazev": "Fanta - zero 330ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 212, "sklad": "kram", "nazev": "Fanta 1l", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 213, "sklad": "kram", "nazev": "Fanta Pomeranc", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 214, "sklad": "kram", "nazev": "Fanta Pomeranc 1l", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 215, "sklad": "kram", "nazev": "Fanta Shokata", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 216, "sklad": "kram", "nazev": "Figaro banana 30g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 217, "sklad": "kram", "nazev": "Fini zvykacky 20g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 218, "sklad": "kram", "nazev": "Fitness berries 23,5g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 219, "sklad": "kram", "nazev": "Florian Bor. 150g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 220, "sklad": "kram", "nazev": "Florian Jah. 150g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 221, "sklad": "kram", "nazev": "Florian Lis.O. 150g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 222, "sklad": "kram", "nazev": "Florian mer. 150g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 223, "sklad": "kram", "nazev": "Florian stra. 150g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 224, "sklad": "kram", "nazev": "Florina jogurt", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 225, "sklad": "kram", "nazev": "Frankovka 1L", "kategorie": "Alkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 226, "sklad": "kram", "nazev": "Fresh Air 120 pcs", "kategorie": "Drogerie", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 227, "sklad": "kram", "nazev": "Frisco Bellini", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 228, "sklad": "kram", "nazev": "Frisco Daiquiri 330ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 229, "sklad": "kram", "nazev": "Frisco FizTonic 330ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 230, "sklad": "kram", "nazev": "Frisco jab. 330ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 231, "sklad": "kram", "nazev": "Frisco lesni ov. 330ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 232, "sklad": "kram", "nazev": "Frisco mango 330ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 233, "sklad": "kram", "nazev": "Frisco spritz 330ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 234, "sklad": "kram", "nazev": "Fuze Tea Aloe Jah. 1,5l", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 235, "sklad": "kram", "nazev": "FuzeTea Bros. - 1,5L", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 236, "sklad": "kram", "nazev": "FuzeTea Bros. - 500ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 237, "sklad": "kram", "nazev": "FuzeTea Jah. - 1,5L", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 238, "sklad": "kram", "nazev": "FuzeTea Jah. - 500ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 239, "sklad": "kram", "nazev": "Gambrinus - 500ml", "kategorie": "Alkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 240, "sklad": "kram", "nazev": "Gervais - original 80g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 241, "sklad": "kram", "nazev": "Gervais - pazitka 80g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 242, "sklad": "kram", "nazev": "Gervais Redkvicka 80g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 243, "sklad": "kram", "nazev": "Hame Dzem Jahoda 20g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 244, "sklad": "kram", "nazev": "Hame Favorit 150g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 245, "sklad": "kram", "nazev": "Hame Veprove vl. 125g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 246, "sklad": "kram", "nazev": "Haribo Balla Balla 100g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 247, "sklad": "kram", "nazev": "Haribo Cherries 100g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 248, "sklad": "kram", "nazev": "Haribo Goldbaren 100g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 249, "sklad": "kram", "nazev": "Haribo Saft Gold. 85g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 250, "sklad": "kram", "nazev": "Heineken - 500ml", "kategorie": "Alkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 251, "sklad": "kram", "nazev": "Herkules - 75g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 252, "sklad": "kram", "nazev": "Hit choco 220g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 253, "sklad": "kram", "nazev": "Hit nuts 220g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 254, "sklad": "kram", "nazev": "Horcice plno. - 100g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 255, "sklad": "kram", "nazev": "Horicke trub. Kokos 38g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 256, "sklad": "kram", "nazev": "Horicke trub. Nugat 34g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 257, "sklad": "kram", "nazev": "Hortice Kremzska 100g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 258, "sklad": "kram", "nazev": "Hovezi Gulas415g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 259, "sklad": "kram", "nazev": "Hradecke Tycinky 90g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 260, "sklad": "kram", "nazev": "Huggies", "kategorie": "Drogerie", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 261, "sklad": "kram", "nazev": "Indulona sos 85ml", "kategorie": "Drogerie", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 262, "sklad": "kram", "nazev": "Jack Daniels Coca Cola", "kategorie": "Alkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 263, "sklad": "kram", "nazev": "Jemca Jahoda", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 264, "sklad": "kram", "nazev": "Jemca indicky čaj bal.", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 265, "sklad": "kram", "nazev": "Jemča lesní jahoda", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 266, "sklad": "kram", "nazev": "Jemča pomeranč bal.", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 267, "sklad": "kram", "nazev": "Jemča černý rybíz ba.", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 268, "sklad": "kram", "nazev": "Jihlavanka Kava 250g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 269, "sklad": "kram", "nazev": "JoJo Mini Medvidci 42g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 270, "sklad": "kram", "nazev": "JoJo jahudky 80g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 271, "sklad": "kram", "nazev": "KimChi Kureci - 75g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 272, "sklad": "kram", "nazev": "Kinley Zero Tonic 1,5l", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 273, "sklad": "kram", "nazev": "Kinley tonic 1,5 l", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 274, "sklad": "kram", "nazev": "KitKat Chunky White 40g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 275, "sklad": "kram", "nazev": "Kobliha", "kategorie": "Pečivo", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 276, "sklad": "kram", "nazev": "Kobliha 1ks", "kategorie": "Pečivo", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 277, "sklad": "kram", "nazev": "Korunová položka 15%", "kategorie": "Ostatní", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 278, "sklad": "kram", "nazev": "Korunová položka 21%", "kategorie": "Ostatní", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 279, "sklad": "kram", "nazev": "Krusovice Cerne - 500ml", "kategorie": "Alkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 280, "sklad": "kram", "nazev": "Krusovice Lezak - 500ml", "kategorie": "Alkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 281, "sklad": "kram", "nazev": "Kureci Parky 250g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 282, "sklad": "kram", "nazev": "Lednacek Kakao 31g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 283, "sklad": "kram", "nazev": "Lednacek Vanilka 31g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 284, "sklad": "kram", "nazev": "Linteo kapesníky 10x10", "kategorie": "Drogerie", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 285, "sklad": "kram", "nazev": "Lovecky Salam - 75g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 286, "sklad": "kram", "nazev": "M&Ms peanut 45g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 287, "sklad": "kram", "nazev": "Madeta Mleko 1,5 l", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 288, "sklad": "kram", "nazev": "Madeta niva 150g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 289, "sklad": "kram", "nazev": "Majka - 120g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 290, "sklad": "kram", "nazev": "Marila Standart 250g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 291, "sklad": "kram", "nazev": "Mars 51g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 292, "sklad": "kram", "nazev": "Maslo 250g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 293, "sklad": "kram", "nazev": "Mattoni Perliva 1,5L", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 294, "sklad": "kram", "nazev": "Med Kvetinovy 20g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 295, "sklad": "kram", "nazev": "Mickey lolipops", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 296, "sklad": "kram", "nazev": "Misa Jahoda 47g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 297, "sklad": "kram", "nazev": "Misa Tvaroh 47g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 298, "sklad": "kram", "nazev": "Mleko Polo. 1L", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 299, "sklad": "kram", "nazev": "Mokate Gold Cappuccino", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 300, "sklad": "kram", "nazev": "Monster Aussie Le. 500ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 301, "sklad": "kram", "nazev": "Monster E. Mega 553ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 302, "sklad": "kram", "nazev": "Monster Fiesta Ma. 500ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 303, "sklad": "kram", "nazev": "Monster Khaotic 500ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 304, "sklad": "kram", "nazev": "Monster Punch E. 500ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 305, "sklad": "kram", "nazev": "Monster Ultra Par. 500ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 306, "sklad": "kram", "nazev": "Music Monkey", "kategorie": "Hračky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 307, "sklad": "kram", "nazev": "Natura nepe. 1,5L", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 308, "sklad": "kram", "nazev": "Nescafe 16,5g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 309, "sklad": "kram", "nazev": "Nimm2 Soft 90g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 310, "sklad": "kram", "nazev": "Nivea HairMilk 200ml", "kategorie": "Drogerie", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 311, "sklad": "kram", "nazev": "Odol 75ml", "kategorie": "Drogerie", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 312, "sklad": "kram", "nazev": "Orbit Spearmint 14g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 313, "sklad": "kram", "nazev": "Otma kecup 310g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 314, "sklad": "kram", "nazev": "PEZ dextrose", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 315, "sklad": "kram", "nazev": "Palmolive", "kategorie": "Drogerie", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 316, "sklad": "kram", "nazev": "Papita Caramel 33g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 317, "sklad": "kram", "nazev": "Paprikas - 75g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 318, "sklad": "kram", "nazev": "Pepo Drev. Podpal.", "kategorie": "Ostatní", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 319, "sklad": "kram", "nazev": "Phantom Kartacek", "kategorie": "Drogerie", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 320, "sklad": "kram", "nazev": "Pilsner - 330ml", "kategorie": "Alkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 321, "sklad": "kram", "nazev": "PilsnerUrquel", "kategorie": "Alkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 322, "sklad": "kram", "nazev": "Plamenak bublifuk", "kategorie": "Hračky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 323, "sklad": "kram", "nazev": "PopUps Marvel 10g", "kategorie": "Hračky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 324, "sklad": "kram", "nazev": "Porleo 30g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 325, "sklad": "kram", "nazev": "Porleo Jahoda 30g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 326, "sklad": "kram", "nazev": "Porleo choco", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 327, "sklad": "kram", "nazev": "Powerade Blackcurrant", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 328, "sklad": "kram", "nazev": "Radegast - 500ml", "kategorie": "Alkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 329, "sklad": "kram", "nazev": "Rashid arasidy 60g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 330, "sklad": "kram", "nazev": "RedBull - 250ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 331, "sklad": "kram", "nazev": "Relax Kaktus", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 332, "sklad": "kram", "nazev": "Relax Pyre Pres. - 120g", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 333, "sklad": "kram", "nazev": "Relax kaktus 250ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 334, "sklad": "kram", "nazev": "Rioba Dzem  Boruvka 20g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 335, "sklad": "kram", "nazev": "Rioba Dzem Jahoda 20g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 336, "sklad": "kram", "nazev": "Rixy cheese 40g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 337, "sklad": "kram", "nazev": "Rixy pizza 40g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 338, "sklad": "kram", "nazev": "Rohlik 1ks", "kategorie": "Pečivo", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 339, "sklad": "kram", "nazev": "Seville premium 200g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 340, "sklad": "kram", "nazev": "Shoko Bananen XL 140g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 341, "sklad": "kram", "nazev": "Skittles Kysele 38g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 342, "sklad": "kram", "nazev": "Skittles Ovocne 38g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 343, "sklad": "kram", "nazev": "Smetanito kremove", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 344, "sklad": "kram", "nazev": "Smilies 27g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 345, "sklad": "kram", "nazev": "Smilies Milk 27g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 346, "sklad": "kram", "nazev": "Smilies Mlec. 27g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 347, "sklad": "kram", "nazev": "SnotSqueeze  jab. 120g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 348, "sklad": "kram", "nazev": "Sour Mad. 60g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 349, "sklad": "kram", "nazev": "Sour Mad. Crush 60g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 350, "sklad": "kram", "nazev": "Sour Powder", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 351, "sklad": "kram", "nazev": "Sprite 1l", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 352, "sklad": "kram", "nazev": "Sprite Zero 330ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 353, "sklad": "kram", "nazev": "Sprite plech", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 354, "sklad": "kram", "nazev": "Staropramen 11  - 500ml", "kategorie": "Alkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 355, "sklad": "kram", "nazev": "Staropramen 12 - 500ml", "kategorie": "Alkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 356, "sklad": "kram", "nazev": "Stella - 500ml", "kategorie": "Alkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 357, "sklad": "kram", "nazev": "Stella Artois 1ks", "kategorie": "Alkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 358, "sklad": "kram", "nazev": "Sul 1Kg", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 359, "sklad": "kram", "nazev": "Texas Tuna 185g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 360, "sklad": "kram", "nazev": "TicTac 18g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 361, "sklad": "kram", "nazev": "Toaletmi papir 8ks", "kategorie": "Drogerie", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 362, "sklad": "kram", "nazev": "Toma Jablko", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 363, "sklad": "kram", "nazev": "Toma Jablko 250ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 364, "sklad": "kram", "nazev": "Toma Jahoda", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 365, "sklad": "kram", "nazev": "Toma Jahoda 250ml", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 366, "sklad": "kram", "nazev": "Twister 72g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 367, "sklad": "kram", "nazev": "Twister Mallow 73g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 368, "sklad": "kram", "nazev": "Vazka papirky", "kategorie": "Ostatní", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 369, "sklad": "kram", "nazev": "Vejce 6ks", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 370, "sklad": "kram", "nazev": "VitalFruit jab. - 2L", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 371, "sklad": "kram", "nazev": "VitalFruit jah. - 2L", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 372, "sklad": "kram", "nazev": "VitalFruit pom. - 2L", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 373, "sklad": "kram", "nazev": "Vitamin Water Citron", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 374, "sklad": "kram", "nazev": "Vitamin Water Lev. Bor", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 375, "sklad": "kram", "nazev": "Vitamin Water Malina", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 376, "sklad": "kram", "nazev": "Vitamin Water Zero Bros.", "kategorie": "Nealkoholické nápoje", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 377, "sklad": "kram", "nazev": "Viva Pastika Drubez. 48g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 378, "sklad": "kram", "nazev": "Viva Pastika Jatrova 48g", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 379, "sklad": "kram", "nazev": "Viva Pekeln. Tousty 120g", "kategorie": "Pečivo", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 380, "sklad": "kram", "nazev": "Zapalovac", "kategorie": "Ostatní", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 381, "sklad": "kram", "nazev": "argo bonbony fire 60g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 382, "sklad": "kram", "nazev": "argo lizatka sour 90g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 383, "sklad": "kram", "nazev": "astrid deti 30spf 200ml", "kategorie": "Drogerie", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 384, "sklad": "kram", "nazev": "astrid sprej 50spf 150ml", "kategorie": "Drogerie", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 385, "sklad": "kram", "nazev": "balzam jahoda 4,8g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 386, "sklad": "kram", "nazev": "bananas John", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 387, "sklad": "kram", "nazev": "bebeto belts 75g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 388, "sklad": "kram", "nazev": "croissant cookies 60g", "kategorie": "Pečivo", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 389, "sklad": "kram", "nazev": "m&mS chocolate 45g", "kategorie": "Cukrovinky", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 390, "sklad": "kram", "nazev": "med", "kategorie": "Potraviny", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}, {"id": 391, "sklad": "kram", "nazev": "zapalovac", "kategorie": "Ostatní", "jednotka": "ks", "mnozstvi": 0, "aktivni": true}];

function getSkladProdukty(sklad) {
  return SKLAD_PRODUKTY.filter(function(p){return p.sklad===sklad && p.aktivni!==false;}).sort(function(a,b){return a.nazev.localeCompare(b.nazev,'cs');});
}
function getSkladProdukt(id) { return SKLAD_PRODUKTY.find(function(p){return p.id===id;}); }

async function addSkladProdukt(sklad, nazev, kategorie, jednotka, mnozstvi) {
  var p = { id:getNextId(SKLAD_PRODUKTY), sklad:sklad, nazev:nazev, kategorie:kategorie||'', jednotka:jednotka||'ks', mnozstvi:mnozstvi||0, aktivni:true };
  SKLAD_PRODUKTY.push(p);
  await db.from('sklad_produkty').upsert([p]);
  return p;
}
async function updateSkladProdukt(id, fields) {
  var p = getSkladProdukt(id);
  if (!p) return;
  Object.keys(fields).forEach(function(k){ p[k]=fields[k]; });
  await db.from('sklad_produkty').upsert([p]);
}
async function deleteSkladProdukt(id) {
  await updateSkladProdukt(id, {aktivni:false});
}

// Zápis pohybu (výdej ze skladu / příjem na sklad / ruční oprava) — rovnou upraví aktuální stav skladu
async function addSkladPohyb(sklad, produktId, workerId, typ, mnozstvi, poznamka) {
  var poh = { id:getNextId(SKLAD_POHYBY), sklad:sklad, produktId:produktId, workerId:workerId||null, datum:todayStr(), typ:typ, mnozstvi:mnozstvi, poznamka:poznamka||'' };
  SKLAD_POHYBY.push(poh);
  var p = getSkladProdukt(produktId);
  if (p) {
    if (typ==='vydej') p.mnozstvi = Math.max(0, (p.mnozstvi||0) - mnozstvi);
    else if (typ==='prijem') p.mnozstvi = (p.mnozstvi||0) + mnozstvi;
    else if (typ==='oprava') p.mnozstvi = mnozstvi;
  }
  await db.from('sklad_pohyby').upsert([poh]);
  if (p) await db.from('sklad_produkty').upsert([p]);
  return poh;
}
async function delSkladPohyb(id) {
  var poh = SKLAD_POHYBY.find(function(x){return x.id===id;});
  if (!poh) return;
  var p = getSkladProdukt(poh.produktId);
  if (p) {
    if (poh.typ==='vydej') p.mnozstvi = (p.mnozstvi||0) + poh.mnozstvi;
    else if (poh.typ==='prijem') p.mnozstvi = Math.max(0,(p.mnozstvi||0) - poh.mnozstvi);
    await db.from('sklad_produkty').upsert([p]);
  }
  await db.from('sklad_pohyby').delete().eq('id', id);
  SKLAD_POHYBY = SKLAD_POHYBY.filter(function(x){return x.id!==id;});
}

function getSkladPohybyList(sklad, limit) {
  var list = SKLAD_POHYBY.filter(function(x){return x.sklad===sklad;}).sort(function(a,b){return (b.datum+b.id).localeCompare(a.datum+a.id);});
  return limit ? list.slice(0,limit) : list;
}

// Neděle, kterou končí týden (po–ne) obsahující dané datum — používá se jako klíč týdne
function getWeekEndSunday(datum) {
  var p=datum.split('-'); var d=new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2]));
  var day=d.getDay();
  var diff=(day===0)?0:(7-day);
  d.setDate(d.getDate()+diff);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function getWeekStartMonday(nedeleStr) {
  var p=nedeleStr.split('-'); var d=new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2]));
  d.setDate(d.getDate()-6);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

// Uloží/přepíše týdenní inventuru (fyzické spočítání) a rovnou nastaví aktuální stav skladu na napočítanou hodnotu
async function submitInventura(sklad, workerId, produktId, mnozstvi, tyden) {
  tyden = tyden || getWeekEndSunday(todayStr());
  var existing = SKLAD_INVENTURY.find(function(x){return x.sklad===sklad && x.produktId===produktId && x.tyden===tyden;});
  if (existing) {
    existing.mnozstvi = mnozstvi; existing.workerId = workerId; existing.datum = todayStr();
    await db.from('sklad_inventury').upsert([existing]);
  } else {
    var row = { id:getNextId(SKLAD_INVENTURY), sklad:sklad, produktId:produktId, workerId:workerId, tyden:tyden, mnozstvi:mnozstvi, datum:todayStr() };
    SKLAD_INVENTURY.push(row);
    await db.from('sklad_inventury').upsert([row]);
  }
  var p = getSkladProdukt(produktId);
  if (p) { p.mnozstvi = mnozstvi; await db.from('sklad_produkty').upsert([p]); }
}

function getInventuraForWeek(sklad, tyden) {
  var map = {};
  SKLAD_INVENTURY.filter(function(x){return x.sklad===sklad && x.tyden===tyden;}).forEach(function(x){ map[x.produktId]=x.mnozstvi; });
  return map;
}
function getAllInventuraWeeks(sklad) {
  var weeks = {};
  SKLAD_INVENTURY.filter(function(x){return x.sklad===sklad;}).forEach(function(x){ weeks[x.tyden]=true; });
  return Object.keys(weeks).sort();
}

function getPohybySumForWeek(sklad, tyden, typ) {
  var startStr = getWeekStartMonday(tyden), endStr = tyden;
  var map = {};
  SKLAD_POHYBY.filter(function(x){return x.sklad===sklad && x.typ===typ && x.datum>=startStr && x.datum<=endStr;}).forEach(function(x){
    map[x.produktId] = (map[x.produktId]||0) + x.mnozstvi;
  });
  return map;
}

// Kolik kusů konkrétních produktů si lidi vzali "na účet" (staff tab) v daném týdnu -
// tohle se nepropisuje jako klasický výdej ze skladu, ale patří do stejné bilance,
// protože fyzicky ubylo ze skladu, jen se to zaplatilo přes účet místo hotově.
function getUctyProduktSumForWeek(sklad, tyden) {
  var startStr = getWeekStartMonday(tyden), endStr = tyden;
  var map = {};
  UCTY_POLOZKY.filter(function(x){
    return !x.smazano && x.produktId && x.datum>=startStr && x.datum<=endStr;
  }).forEach(function(x){
    var p = getSkladProdukt(x.produktId);
    if (!p || p.sklad !== sklad) return;
    map[x.produktId] = (map[x.produktId]||0) + (x.mnozstvi||1);
  });
  return map;
}

// Parsování textového týdenního PLU exportu z pokladny (formát: "Název produktu   (Nx)   123,00")
function parsePluReport(text) {
  var lines = text.split(/\r?\n/);
  var out = [];
  var re = /^(.+?)\(\s*(\d+)x\)\s*([\d.,]+)\s*$/;
  for (var i=0;i<lines.length;i++) {
    var l = lines[i].replace(/\u00a0/g,' ').replace(/\s+$/,'');
    var m = l.match(re);
    if (m) {
      var nazev = m[1].replace(/\s+$/,'').trim();
      var mnozstvi = parseInt(m[2],10);
      var castka = parseFloat(m[3].replace(/\./g,'').replace(',','.'));
      if (nazev && !isNaN(mnozstvi)) out.push({ nazev:nazev, mnozstvi:mnozstvi, castka:castka||0 });
    }
  }
  return out;
}

// Uloží nahraný týdenní export prodejů (přepíše předchozí data pro daný sklad+týden)
async function saveSkladProdejeReport(sklad, tyden, rows) {
  var toDelete = SKLAD_PRODEJE.filter(function(x){return x.sklad===sklad && x.tyden===tyden;});
  for (var i=0;i<toDelete.length;i++) await db.from('sklad_prodeje').delete().eq('id', toDelete[i].id);
  SKLAD_PRODEJE = SKLAD_PRODEJE.filter(function(x){return !(x.sklad===sklad && x.tyden===tyden);});
  var nid = getNextId(SKLAD_PRODEJE);
  var newRows = rows.map(function(r){ var row = { id:nid, sklad:sklad, tyden:tyden, nazev:r.nazev, mnozstvi:r.mnozstvi, castka:r.castka }; nid++; return row; });
  SKLAD_PRODEJE = SKLAD_PRODEJE.concat(newRows);
  if (newRows.length) await db.from('sklad_prodeje').upsert(newRows);
}

function getProdejeForWeek(sklad, tyden) {
  return SKLAD_PRODEJE.filter(function(x){return x.sklad===sklad && x.tyden===tyden;});
}
function getAllProdejeWeeks(sklad) {
  var weeks = {};
  SKLAD_PRODEJE.filter(function(x){return x.sklad===sklad;}).forEach(function(x){ weeks[x.tyden]=true; });
  return Object.keys(weeks).sort();
}

// ===================== NAČTENÍ VŠECH DAT (rozšířeno o výplaty a sklad) =====================
async function loadAll() {
  try {
    var r = await db.from('schedule').select('*');
    if (r.error) throw r.error;
    SCHEDULE = r.data || [];
    LOAD_OK.schedule = true;
  } catch(e) { LOAD_OK.schedule = false; console.error('Načtení "schedule" selhalo:', e); }

  try { var r2 = await db.from('ucty').select('*'); if (r2.error) throw r2.error; UCTY_POLOZKY = r2.data || []; LOAD_OK.ucty = true; } catch(e) { LOAD_OK.ucty = false; console.error('Načtení "ucty" selhalo:', e); }
  try { var r3 = await db.from('uklid_log').select('*'); if (r3.error) throw r3.error; UKLID_LOG = r3.data || []; LOAD_OK.uklid_log = true; } catch(e) { LOAD_OK.uklid_log = false; console.error('Načtení "uklid_log" selhalo:', e); }
  try { var r4 = await db.from('penalizace').select('*'); if (r4.error) throw r4.error; PENALIZACE = r4.data || []; LOAD_OK.penalizace = true; } catch(e) { LOAD_OK.penalizace = false; console.error('Načtení "penalizace" selhalo:', e); }
  try { var r5 = await db.from('pracovni_dny').select('*'); if (r5.error) throw r5.error; PRACOVNI_DNY = r5.data || []; LOAD_OK.pracovni_dny = true; } catch(e) { LOAD_OK.pracovni_dny = false; console.error('Načtení "pracovni_dny" selhalo:', e); }

  try {
    var rw = await db.from('workers').select('*');
    if (rw.error) throw rw.error;
    WORKERS = rw.data || [];
    LOAD_OK.workers = true;
  } catch(e) { LOAD_OK.workers = false; console.error('Načtení "workers" selhalo:', e); }

  try { var rv = await db.from('vyplaty').select('*'); VYPLATY = rv.data || []; } catch(e) { VYPLATY = []; }
  try { var rtz = await db.from('trzby').select('*'); if (rtz.error) throw rtz.error; TRZBY = rtz.data || []; LOAD_OK.trzby = true; } catch(e) { LOAD_OK.trzby = false; console.error('Načtení "trzby" selhalo:', e); }
  try { var rnk = await db.from('naklady').select('*'); if (rnk.error) throw rnk.error; NAKLADY = rnk.data || []; LOAD_OK.naklady = true; } catch(e) { LOAD_OK.naklady = false; console.error('Načtení "naklady" selhalo:', e); }

  showLoadErrorBannerIfNeeded();

  try {
    var rs = await db.from('sklad_produkty').select('*');
    SKLAD_PRODUKTY = rs.data || [];
    var chybiSklady = ['kram','vycep'].filter(function(s){
      return !SKLAD_PRODUKTY.some(function(p){return p.sklad===s;});
    });
    if (chybiSklady.length) {
      var doplnit = JSON.parse(JSON.stringify(SKLAD_PRODUKTY_SEED)).filter(function(p){return chybiSklady.indexOf(p.sklad)!==-1;});
      SKLAD_PRODUKTY = SKLAD_PRODUKTY.concat(doplnit);
      if (doplnit.length) await db.from('sklad_produkty').upsert(doplnit);
    }
  } catch(e) { SKLAD_PRODUKTY = JSON.parse(JSON.stringify(SKLAD_PRODUKTY_SEED)); }

  try { var rp = await db.from('sklad_pohyby').select('*'); SKLAD_POHYBY = rp.data || []; } catch(e) { SKLAD_POHYBY = []; }
  try { var ri = await db.from('sklad_inventury').select('*'); SKLAD_INVENTURY = ri.data || []; } catch(e) { SKLAD_INVENTURY = []; }
  try { var rpr = await db.from('sklad_prodeje').select('*'); SKLAD_PRODEJE = rpr.data || []; } catch(e) { SKLAD_PRODEJE = []; }

  await loadVenues();
}

// ===================== PODNIKY / PROVOZOVNY (Kosatka + Republika 24 + Anděl) =====================
var BUSINESSES = [];
var VENUES = [];
var ADMIN_VENUES = [];
var WORKER_VENUES = []; // {id, worker_id, venue_id} - brigádník může mít i vedlejší provozovny
var WORKER_DOSTUPNOST = []; // {id, worker_id, venue_id, dny} - dostupnost zvlášť pro každou "zaklad" provozovnu
var STANOVISTE_ZAKLAD = {}; // venue_id -> [stanoviste]

async function loadVenues() {
  try { var rb = await db.from('businesses').select('*').order('poradi'); if (rb.error) throw rb.error; BUSINESSES = rb.data || []; LOAD_OK.businesses = true; } catch(e) { BUSINESSES = []; LOAD_OK.businesses = false; console.error('Načtení "businesses" selhalo:', e); }
  try { var rv = await db.from('venues').select('*').order('poradi'); if (rv.error) throw rv.error; VENUES = rv.data || []; LOAD_OK.venues = true; } catch(e) { VENUES = []; LOAD_OK.venues = false; console.error('Načtení "venues" selhalo:', e); }
  try { var rav = await db.from('admin_venues').select('*'); if (rav.error) throw rav.error; ADMIN_VENUES = rav.data || []; LOAD_OK.admin_venues = true; } catch(e) { ADMIN_VENUES = []; LOAD_OK.admin_venues = false; console.error('Načtení "admin_venues" selhalo:', e); }
  try { var rwv = await db.from('worker_venues').select('*'); if (rwv.error) throw rwv.error; WORKER_VENUES = rwv.data || []; LOAD_OK.worker_venues = true; } catch(e) { WORKER_VENUES = []; LOAD_OK.worker_venues = false; console.error('Načtení "worker_venues" selhalo:', e); }
  try { var rwd = await db.from('worker_dostupnost').select('*'); if (rwd.error) throw rwd.error; WORKER_DOSTUPNOST = rwd.data || []; LOAD_OK.worker_dostupnost = true; } catch(e) { WORKER_DOSTUPNOST = []; LOAD_OK.worker_dostupnost = false; console.error('Načtení "worker_dostupnost" selhalo:', e); }
  try {
    var rs = await db.from('stanoviste').select('*').order('poradi');
    if (rs.error) throw rs.error;
    STANOVISTE_ZAKLAD = {};
    (rs.data||[]).forEach(function(s){
      if (!STANOVISTE_ZAKLAD[s.venue_id]) STANOVISTE_ZAKLAD[s.venue_id]=[];
      STANOVISTE_ZAKLAD[s.venue_id].push(s);
    });
    LOAD_OK.stanoviste = true;
  } catch(e) { STANOVISTE_ZAKLAD = {}; LOAD_OK.stanoviste = false; console.error('Načtení "stanoviste" selhalo:', e); }
  showLoadErrorBannerIfNeeded();
}

// ── Venue-scoped funkce pro nové "zaklad" podniky (Republika 24, Anděl) ──
// Kosatka appka (app.html/admin.html) tyhle funkce nepoužívá, takže nemají
// šanci nic v ní rozbít - jsou to čistě nové, přídavné funkce.

function getMyShiftsVenue(workerId, venueId) {
  return SCHEDULE.filter(function(s){return s.workerId===workerId && s.venue_id===venueId;});
}
function getScheduleForVenue(venueId) {
  return SCHEDULE.filter(function(s){return s.venue_id===venueId;});
}
async function addShiftVenue(venueId, workerId, stanovisteId, datum) {
  var existing = SCHEDULE.find(function(s){return s.venue_id===venueId && s.workerId===workerId && s.datum===datum && s.mistoId===stanovisteId;});
  if (existing) return { ok:true, row:existing };
  var row = { id:getNextId(SCHEDULE), workerId:workerId, datum:datum, mistoId:stanovisteId, venue_id:venueId };
  SCHEDULE.push(row);
  var res = await saveSchedule();
  if (!res.ok) { SCHEDULE = SCHEDULE.filter(function(s){return s.id!==row.id;}); return res; }
  return { ok:true, row:row };
}
async function delShiftVenue(id) {
  var predchozi = SCHEDULE;
  SCHEDULE = SCHEDULE.filter(function(s){return s.id!==id;});
  try {
    var res = await db.from('schedule').delete().eq('id', id);
    if (res.error) { SCHEDULE = predchozi; return { ok:false, error:res.error }; }
  } catch(e) { SCHEDULE = predchozi; return { ok:false, error:e }; }
  return { ok:true };
}

async function saveTimeVenue(workerId, venueId, datum, prichod, odchod) {
  var pd = getPracovniDen(workerId, datum);
  if (pd) { pd.prichod=prichod; pd.odchod=odchod; pd.venue_id=venueId; }
  else { pd = {id:getNextId(PRACOVNI_DNY), workerId:workerId, datum:datum, prichod:prichod, odchod:odchod, obed:false, vecere:false, venue_id:venueId}; PRACOVNI_DNY.push(pd); }
  return await savePracovniDny();
}

function getVydelekVenue(workerId, venueId) {
  var hodiny=0, ucty=0, pen=0;
  var today = todayStr();
  var venue = getVenueById(venueId);
  var sazba = (venue && venue.sazba_hodinova) || 180;
  var seen = {};
  PRACOVNI_DNY.forEach(function(pd){
    if (pd.workerId!==workerId || pd.venue_id!==venueId || pd.datum>today) return;
    if (seen[pd.datum]) return; seen[pd.datum]=true;
    if (pd.prichod && pd.odchod) hodiny += calcHodiny(pd.prichod, pd.odchod);
  });
  var hruby = Math.round(hodiny*sazba);
  UCTY_POLOZKY.forEach(function(p){ if(p.workerId===workerId && p.venue_id===venueId && !p.smazano) ucty+=p.castka; });
  PENALIZACE.forEach(function(p){ if(p.workerId===workerId && p.venue_id===venueId) pen+=p.castka; });
  return { hodiny:hodiny, hruby:hruby, uctyDluh:ucty, penalizaceTotal:pen, cisty:hruby-ucty-pen };
}

async function addUcetPolozkaVenue(workerId, venueId, stanovisteId, popis, castka) {
  var row = { id:getNextId(UCTY_POLOZKY), workerId:workerId, datum:todayStr(), mistoId:stanovisteId, popis:popis, castka:castka, smazano:false, produktId:null, mnozstvi:null, venue_id:venueId };
  try {
    var res = await db.from('ucty').upsert([row]);
    if (res && res.error) return { ok:false, error:res.error };
  } catch(e) { return { ok:false, error:e }; }
  UCTY_POLOZKY.push(row);
  return { ok:true, row:row };
}
// ── PENALIZACE (venue-scoped) ──
function getPenalizaceForVenue(venueId) {
  return PENALIZACE.filter(function(p){return p.venue_id===venueId;});
}
async function addPenalizaceVenue(venueId, workerId, duvod, castka, poznamka) {
  var row = { id:getNextId(PENALIZACE), workerId:workerId, duvod:duvod, castka:castka, poznamka:poznamka||'', datum:todayStr(), venue_id:venueId };
  PENALIZACE.push(row);
  var res = await savePenalizace();
  if (!res.ok) { PENALIZACE = PENALIZACE.filter(function(p){return p.id!==row.id;}); return res; }
  return { ok:true, row:row };
}

// ── ÚKLID (venue-scoped, obecná denní rotace úklidu provozovny) ──
function getUklidLogForVenue(venueId) {
  return UKLID_LOG.filter(function(l){return l.venue_id===venueId;});
}
async function addUklidVenue(venueId, workerId) {
  var now = new Date();
  var cas = String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  var predchozi = UKLID_LOG.filter(function(l){return l.datum===todayStr()&&l.workerId===workerId&&l.venue_id===venueId;});
  UKLID_LOG = UKLID_LOG.filter(function(l){return !(l.datum===todayStr()&&l.workerId===workerId&&l.venue_id===venueId);});
  var row = { id:getNextId(UKLID_LOG), datum:todayStr(), workerId:workerId, cas:cas, venue_id:venueId, vytrit:true };
  UKLID_LOG.push(row);
  var res = await saveUklidLog();
  if (!res.ok) { UKLID_LOG = UKLID_LOG.filter(function(l){return l.id!==row.id;}).concat(predchozi); return res; }
  return { ok:true, row:row };
}

// ── VÝPLATY (venue-scoped) ──
function getVyplatyForVenueWorker(venueId, workerId) {
  return VYPLATY.filter(function(v){return v.venue_id===venueId && v.workerId===workerId;});
}
function getVyplacenoVenue(venueId, workerId) {
  var total=0; VYPLATY.forEach(function(v){ if(v.venue_id===venueId && v.workerId===workerId) total+=v.castka; });
  return total;
}
async function addVyplataVenue(venueId, workerId, castka, poznamka, dny) {
  var row = { id:getNextId(VYPLATY), workerId:workerId, datum:todayStr(), castka:castka, poznamka:poznamka||'', dny:dny||[], venue_id:venueId };
  VYPLATY.push(row);
  var res = await saveVyplaty();
  if (!res.ok) { VYPLATY = VYPLATY.filter(function(v){return v.id!==row.id;}); return res; }
  return { ok:true, row:row };
}

// ── JÍDLO (venue-scoped, znovupoužívá pracovni_dny jako Kosatka) ──
function getJidloForVenueDate(venueId, datum) {
  return getWorkersForVenue(venueId).map(function(w){
    var pd = getPracovniDen(w.id, datum);
    return { worker:w, obed: pd?!!pd.obed:false, vecere: pd?!!pd.vecere:false };
  });
}
async function saveMealVenue(workerId, venueId, datum, type) {
  var pd = getPracovniDen(workerId, datum);
  if (pd) { pd[type]=true; pd.venue_id=venueId; }
  else { pd = {id:getNextId(PRACOVNI_DNY), workerId:workerId, datum:datum, prichod:null, odchod:null, obed:false, vecere:false, venue_id:venueId}; pd[type]=true; PRACOVNI_DNY.push(pd); }
  return await savePracovniDny();
}

// ── OBJEDNÁVKY (venue-scoped) - appka pro Kosatku sahá na tuhle tabulku
// přímo (raw db.from), tyhle funkce jsou přídavné wrappery pro nové provozovny.
async function addObjednavkaVenue(venueId, workerId, stanoviste, polozka, mnozstvi, poznamka) {
  var row = { workerId:workerId, datum:todayStr(), stanoviste:stanoviste, polozka:polozka, mnozstvi:mnozstvi, poznamka:poznamka||null, splneno:false, venue_id:venueId };
  try {
    var res = await db.from('objednavky').insert(row).select();
    if (res.error) return { ok:false, error:res.error };
    return { ok:true, row: res.data ? res.data[0] : row };
  } catch(e) { return { ok:false, error:e }; }
}
async function getObjednavkyForVenue(venueId) {
  try {
    var r = await db.from('objednavky').select('*').eq('venue_id', venueId).order('created_at', { ascending:false });
    return r.data || [];
  } catch(e) { return []; }
}
async function getObjednavkyForVenueWorker(venueId, workerId) {
  try {
    var r = await db.from('objednavky').select('*').eq('venue_id', venueId).eq('workerId', workerId).order('created_at', { ascending:false });
    return r.data || [];
  } catch(e) { return []; }
}
async function setObjednavkaSplneno(id, splneno) {
  try {
    var res = await db.from('objednavky').update({ splneno:splneno }).eq('id', id);
    if (res.error) return { ok:false, error:res.error };
    return { ok:true };
  } catch(e) { return { ok:false, error:e }; }
}

function getWorkersForVenue(venueId) {
  var secondaryIds = WORKER_VENUES.filter(function(wv){return wv.venue_id===venueId;}).map(function(wv){return wv.worker_id;});
  return WORKERS.filter(function(w){return w.role==='user' && (w.venue_id===venueId || secondaryIds.indexOf(w.id)!==-1);});
}
function getPendingWorkers() {
  return WORKERS.filter(function(w){return w.schvaleno===false;});
}
async function approveWorker(workerId, venueId, role) {
  var w = WORKERS.find(function(x){return x.id===workerId;});
  if (!w) return { ok:false, error:'Brigádník nenalezen' };
  var updated = { id:w.id, venue_id:venueId, role:role||'user', schvaleno:true };
  try {
    var res = await db.from('workers').update(updated).eq('id', workerId);
    if (res.error) return { ok:false, error:res.error };
  } catch(e) { return { ok:false, error:e }; }
  Object.assign(w, updated);
  // Správce se rovnou přiřadí i k té provozovně v admin_venues, ať se nemusí
  // ještě jednou nastavovat v záložce Podniky.
  if (updated.role === 'spravce' && venueId) {
    await setAdminVenues(workerId, [venueId]);
  }
  return { ok:true };
}
async function setAdminVenues(workerId, venueIds) {
  try {
    await db.from('admin_venues').delete().eq('worker_id', workerId);
    var rows = venueIds.map(function(vid){ return { worker_id:workerId, venue_id:vid }; });
    if (rows.length) { var res = await db.from('admin_venues').insert(rows); if (res.error) return { ok:false, error:res.error }; }
    ADMIN_VENUES = ADMIN_VENUES.filter(function(av){return av.worker_id!==workerId;}).concat(rows);
    return { ok:true };
  } catch(e) { return { ok:false, error:e }; }
}

function getUctyForWorkerVenue(workerId, venueId) {
  return UCTY_POLOZKY.filter(function(p){return p.workerId===workerId && p.venue_id===venueId && !p.smazano;});
}

function getTrzbaVenue(venueId, stanovisteId, datum) {
  return TRZBY.find(function(t){return t.venue_id===venueId && t.mistoId===stanovisteId && t.datum===datum;}) || null;
}
async function submitTrzbaVenue(venueId, stanovisteId, datum, castka, workerId, poznamka) {
  var blocked = requireLoadOk('trzby'); if (blocked) return blocked;
  var existing = getTrzbaVenue(venueId, stanovisteId, datum);
  if (existing) {
    existing.castka=castka; existing.workerId=workerId; existing.poznamka=poznamka||'';
    await db.from('trzby').upsert([existing]);
    return existing;
  }
  var row = { id:getNextId(TRZBY), mistoId:stanovisteId, datum:datum, castka:castka, workerId:workerId||null, poznamka:poznamka||'', venue_id:venueId };
  TRZBY.push(row);
  await db.from('trzby').upsert([row]);
  return row;
}

// ===================== NÁKLADY (Makro, pivo, zásoby...) =====================
function getNakladyForVenue(venueId) {
  return NAKLADY.filter(function(n){ return n.venue_id===venueId; }).sort(function(a,b){ return a.datum<b.datum?1:-1; });
}
function getNakladyForVenueMonth(venueId, year, month) {
  var prefix = year+'-'+String(month).padStart(2,'0');
  return getNakladyForVenue(venueId).filter(function(n){ return (n.datum||'').indexOf(prefix)===0; });
}
async function submitNaklad(venueId, workerId, datum, popis, castka) {
  var blocked = requireLoadOk('naklady'); if (blocked) return blocked;
  var row = { id:getNextId(NAKLADY), venue_id:venueId, workerId:workerId||null, datum:datum, popis:popis, castka:castka };
  NAKLADY.push(row);
  var res = await dbUpsert('naklady', [row]);
  if (!res.ok) { NAKLADY = NAKLADY.filter(function(n){return n.id!==row.id;}); }
  return res;
}
async function removeNaklad(id) {
  var res = await db.from('naklady').delete().eq('id', id);
  if (!res.error) NAKLADY = NAKLADY.filter(function(n){ return n.id!==id; });
  return res;
}

// Čistý zisk provozovny za měsíc = tržby - náklady - vyplacené mzdy.
function getZiskVenueMonth(venueId, year, month) {
  var trzby = getTrzbyForVenueMonth ? getTrzbyForVenueMonth(venueId, year, month) : [];
  var trzbySum = trzby.reduce(function(s,t){ return s+(t.castka||0); }, 0);
  var naklady = getNakladyForVenueMonth(venueId, year, month);
  var nakladySum = naklady.reduce(function(s,n){ return s+(n.castka||0); }, 0);
  var prefix = year+'-'+String(month).padStart(2,'0');
  var vyplatySum = VYPLATY.filter(function(v){ return v.venue_id===venueId && (v.datum||'').indexOf(prefix)===0; })
    .reduce(function(s,v){ return s+(v.castka||0); }, 0);
  return { trzby:trzbySum, naklady:nakladySum, vyplaty:vyplatySum, zisk: trzbySum - nakladySum - vyplatySum };
}
function getTrzbyForVenueMonth(venueId, year, month) {
  var prefix = year+'-'+String(month).padStart(2,'0');
  return TRZBY.filter(function(t){return t.venue_id===venueId && t.datum.indexOf(prefix)===0;});
}

function getBusinessById(id) { return BUSINESSES.find(function(b){return b.id===id;}) || null; }
function getVenueById(id) { return VENUES.find(function(v){return v.id===id;}) || null; }
function getVenueBySlug(slug) { return VENUES.find(function(v){return v.slug===slug;}) || null; }
function getStanovisteZaklad(venueId) { return STANOVISTE_ZAKLAD[venueId] || []; }

// Které provozovny smí uživatel vidět/spravovat.
// role 'admin'   -> úplně vše (super-admin, typicky majitel)
// role 'spravce' -> jen provozovny přiřazené v admin_venues
// role 'user'    -> jen svoje vlastní venue_id (typicky přesně jedna)
function getAccessibleVenues(worker) {
  if (!worker) return [];
  if (worker.role === 'admin') return VENUES.slice();
  if (worker.role === 'spravce') {
    var ids = ADMIN_VENUES.filter(function(av){return av.worker_id===worker.id;}).map(function(av){return av.venue_id;});
    return VENUES.filter(function(v){return ids.indexOf(v.id)!==-1;});
  }
  var w = WORKERS.find(function(x){return x.id===worker.id;}) || worker;
  var ids2 = WORKER_VENUES.filter(function(wv){return wv.worker_id===worker.id;}).map(function(wv){return wv.venue_id;});
  if (w.venue_id && ids2.indexOf(w.venue_id)===-1) ids2.push(w.venue_id);
  return VENUES.filter(function(v){return ids2.indexOf(v.id)!==-1;});
}

// Přidá/odebere brigádníkovi vedlejší provozovnu (nemění jeho hlavní venue_id).
async function addWorkerVenue(workerId, venueId) {
  if (WORKER_VENUES.some(function(wv){return wv.worker_id===workerId && wv.venue_id===venueId;})) return {ok:true};
  var row = { worker_id:workerId, venue_id:venueId };
  var res = await db.from('worker_venues').insert([row]).select();
  if (res.error) return { ok:false, error:res.error };
  WORKER_VENUES.push(res.data[0]);
  return { ok:true };
}
async function removeWorkerVenue(workerId, venueId) {
  var res = await db.from('worker_venues').delete().eq('worker_id', workerId).eq('venue_id', venueId);
  if (!res.error) WORKER_VENUES = WORKER_VENUES.filter(function(wv){return !(wv.worker_id===workerId && wv.venue_id===venueId);});
  return res;
}

// Kam přesměrovat po přihlášení: pokud má přístup jen na jednu provozovnu, jde
// se rovnou do ní (žádné klikání navíc); pokud na víc, ukáže se výběr podniků.
//
// DŮLEŽITÉ: nikdy nesmí vrátit 'index.html' - to by přihlašovací stránku
// přesměrovalo samu na sebe = nekonečné dokolečka načítání. Když appka neví,
// kam uživatele poslat, vrátí null a volající to musí ošetřit (zobrazit
// zprávu, NE přesměrovat).
function resolveLoginDestination(worker) {
  // Multi-podnikové tabulky (venues/businesses) ještě nemusí v Supabase
  // existovat (SQL migrace ještě neproběhla) - appka se pak chová jako dřív,
  // čistě jako Kosatka, ať nic nezůstane rozbité.
  if (!VENUES || VENUES.length === 0) {
    return (worker.role === 'admin' || worker.role === 'spravce') ? 'admin.html' : 'app.html';
  }
  // DŮLEŽITÉ: appka už NIKDY nikoho automaticky nepřeskakuje rovnou do jedné
  // provozovny. Vždycky se nejdřív ukáže hlavní panel s domečky podniků -
  // i když má člověk přístup jen na jedno místo. To byl dřív důvod, proč
  // "nešlo vybrat podnik": appka ho přeskočila dřív, než se stihl zobrazit.
  return 'podniky.html';
}
// Bezpečné přesměrování - nikdy nenavigujeme na null/prázdno ani na
// stránku, na které už jsme (to by způsobilo nekonečné dokolečka).
function safeRedirect(url) {
  if (!url) return false;
  var here = window.location.pathname.split('/').pop() || 'index.html';
  if (url.split('?')[0] === here) return false;
  window.location.href = url;
  return true;
}

function venueAppUrl(venue) {
  if (venue.rezim === 'kosatka') return 'app.html';
  return 'podnik.html?v=' + venue.slug;
}
function venueAdminUrl(venue) {
  if (venue.rezim === 'kosatka') return 'admin.html';
  return 'podnik-admin.html?v=' + venue.slug;
}
