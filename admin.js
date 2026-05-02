import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://saymqnihmcrowapmrajj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNheW1xbmlobWNyb3dhcG1yYWpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MTI0MTcsImV4cCI6MjA5MzI4ODQxN30.2Fe_iQTczYVT5uRbk1RS4uJVgWi6aIeRXhXNDcPJJTg';
const ADMIN_PASSWORD = 'Sg6046770';
const PAGE_SIZE = 6;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginForm = document.getElementById('adminLoginForm');
const loginBox = document.getElementById('loginBox');
const loginStatus = document.getElementById('loginStatus');
const dashboard = document.getElementById('dashboard');
const ticketsMeta = document.getElementById('ticketsMeta');
const ticketsList = document.getElementById('ticketsList');
const pageInfo = document.getElementById('pageInfo');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const logoutBtn = document.getElementById('logoutBtn');

let currentPage = 1;
let totalTickets = 0;

function setLocked() {
  sessionStorage.removeItem('logicnest_admin');
  dashboard.style.display = 'none';
  loginBox.style.display = 'grid';
}

function setUnlocked() {
  sessionStorage.setItem('logicnest_admin', 'true');
  loginBox.style.display = 'none';
  dashboard.style.display = 'block';
  loadTickets();
}

async function loadTickets() {
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from('tickets')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    ticketsMeta.textContent = `Error loading tickets: ${error.message}`;
    return;
  }

  totalTickets = count || 0;
  const totalPages = Math.max(1, Math.ceil(totalTickets / PAGE_SIZE));
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  ticketsMeta.textContent = `${totalTickets} total ticket(s)`;
  prevPage.disabled = currentPage <= 1;
  nextPage.disabled = currentPage >= totalPages;

  ticketsList.innerHTML = '';
  if (!data?.length) {
    ticketsList.innerHTML = '<p class="small-note">No tickets yet.</p>';
    return;
  }

  for (const ticket of data) {
    const card = document.createElement('article');
    card.className = 'ticket-card';
    card.innerHTML = `
      <h3>${ticket.name}</h3>
      <p><strong>Email:</strong> ${ticket.email}</p>
      <p><strong>Budget:</strong> ${ticket.budget}</p>
      <p><strong>Submitted:</strong> ${new Date(ticket.created_at).toLocaleString()}</p>
      <p>${ticket.message}</p>
    `;
    ticketsList.appendChild(card);
  }
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const pass = document.getElementById('adminPassword').value;
  if (pass !== ADMIN_PASSWORD) {
    loginStatus.textContent = 'Incorrect password.';
    return;
  }
  loginStatus.textContent = 'Access granted.';
  setUnlocked();
});

logoutBtn.addEventListener('click', setLocked);

prevPage.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage -= 1;
    loadTickets();
  }
});

nextPage.addEventListener('click', () => {
  const totalPages = Math.max(1, Math.ceil(totalTickets / PAGE_SIZE));
  if (currentPage < totalPages) {
    currentPage += 1;
    loadTickets();
  }
});

if (sessionStorage.getItem('logicnest_admin') === 'true') {
  setUnlocked();
} else {
  setLocked();
}
