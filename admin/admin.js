import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cfg = window.LOGICNEST_CONFIG || {};
const ADMIN_PASSWORD = cfg.ADMIN_PASSWORD || '';
const PAGE_SIZE = 6;

const loginForm = document.getElementById('adminLoginForm');
const loginBox = document.getElementById('loginBox');
const loginStatus = document.getElementById('loginStatus');
const dashboard = document.getElementById('dashboard');
const ticketsMeta = document.getElementById('ticketsMeta');
const ticketsList = document.getElementById('ticketsList');
const pageInfo = document.getElementById('pageInfo');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const refreshBtn = document.getElementById('refreshBtn');
const logoutBtn = document.getElementById('logoutBtn');

let currentPage = 1;
let totalTickets = 0;

if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
  loginStatus.textContent = 'Missing config.js values: SUPABASE_URL or SUPABASE_ANON_KEY.';
}
const supabase = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

function lock() { sessionStorage.removeItem('logicnest_admin'); dashboard.style.display = 'none'; loginBox.style.display = 'block'; }
function unlock() { sessionStorage.setItem('logicnest_admin', 'true'); loginBox.style.display = 'none'; dashboard.style.display = 'block'; loadTickets(); }

async function loadTickets() {
  ticketsMeta.textContent = 'Loading tickets...';
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error, count } = await supabase.from('tickets').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);
  if (error) { ticketsMeta.textContent = `Could not load tickets: ${error.message}`; return; }

  totalTickets = count || 0;
  const totalPages = Math.max(1, Math.ceil(totalTickets / PAGE_SIZE));
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  ticketsMeta.textContent = `${totalTickets} ticket(s) found`;
  prevPage.disabled = currentPage <= 1;
  nextPage.disabled = currentPage >= totalPages;

  ticketsList.innerHTML = '';
  if (!data?.length) { ticketsList.innerHTML = '<article class="panel"><p class="lead">No tickets on this page.</p></article>'; return; }
  data.forEach((t) => {
    const card = document.createElement('article');
    card.className = 'panel reveal show';
    card.innerHTML = `<h3>${t.name}</h3><p class="lead"><b>Email:</b> ${t.email}</p><p class="lead"><b>Budget:</b> ${t.budget}</p><p class="lead"><b>Date:</b> ${new Date(t.created_at).toLocaleString()}</p><p>${t.message}</p>`;
    ticketsList.appendChild(card);
  });
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const entered = document.getElementById('adminPassword').value;
  if (!ADMIN_PASSWORD) { loginStatus.textContent = 'ADMIN_PASSWORD is empty in config.js'; return; }
  if (entered !== ADMIN_PASSWORD) { loginStatus.textContent = 'Wrong password'; return; }
  loginStatus.textContent = 'Access granted';
  unlock();
});

refreshBtn.addEventListener('click', loadTickets);
logoutBtn.addEventListener('click', lock);
prevPage.addEventListener('click', () => { if (currentPage > 1) { currentPage--; loadTickets(); } });
nextPage.addEventListener('click', () => { const max = Math.max(1, Math.ceil(totalTickets / PAGE_SIZE)); if (currentPage < max) { currentPage++; loadTickets(); } });

if (sessionStorage.getItem('logicnest_admin') === 'true') unlock(); else lock();
