import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cfg = window.LOGICNEST_CONFIG || {};
const ADMIN_PASSWORD = cfg.ADMIN_PASSWORD || '';
const PAGE_SIZE = 6;
const supabase = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

const $ = (id) => document.getElementById(id);
const loginForm = $('adminLoginForm');
const loginBox = $('loginBox');
const loginStatus = $('loginStatus');
const dashboard = $('dashboard');
const ticketsMeta = $('ticketsMeta');
const ticketsList = $('ticketsList');
const pageInfo = $('pageInfo');
const prevPage = $('prevPage');
const nextPage = $('nextPage');
const refreshBtn = $('refreshBtn');
const logoutBtn = $('logoutBtn');

let currentPage = 1;
let totalTickets = 0;

function lock(){ sessionStorage.removeItem('logicnest_admin'); dashboard.style.display='none'; loginBox.style.display='block'; }
function unlock(){ sessionStorage.setItem('logicnest_admin','true'); loginBox.style.display='none'; dashboard.style.display='block'; loadTickets(); }

function renderHelp(message){
  ticketsList.innerHTML = `<article class="panel"><h3>Admin Query Help</h3><p class="lead">${message}</p><p class="lead">Run this SQL in Supabase:</p><pre>alter table public.tickets enable row level security;\ncreate policy "Allow ticket reads" on public.tickets for select to anon using (true);</pre></article>`;
}

async function loadTickets(){
  ticketsMeta.textContent = 'Loading tickets...';
  const from=(currentPage-1)*PAGE_SIZE, to=from+PAGE_SIZE-1;
  const query = supabase.from('tickets').select('id,name,email,budget,message,source,created_at',{count:'exact'}).order('created_at',{ascending:false}).range(from,to);
  const {data,error,count} = await query;

  if(error){
    ticketsMeta.textContent = `Could not load tickets: ${error.message}`;
    if(String(error.message).toLowerCase().includes('row-level security') || error.code === '42501') {
      renderHelp('Read access is blocked by RLS. Tickets can insert but cannot be selected by anon until read policy is added.');
    }
    return;
  }

  totalTickets = count || 0;
  const totalPages = Math.max(1, Math.ceil(totalTickets / PAGE_SIZE));
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  ticketsMeta.textContent = `${totalTickets} ticket(s) found`;
  prevPage.disabled = currentPage <= 1;
  nextPage.disabled = currentPage >= totalPages;

  ticketsList.innerHTML = '';
  if(!data?.length){ ticketsList.innerHTML='<article class="panel"><p class="lead">No tickets found on this page. Try Refresh or Previous.</p></article>'; return; }

  data.forEach((t)=>{
    const card=document.createElement('article');
    card.className='panel reveal show';
    card.innerHTML=`<h3>${t.name || 'Unnamed Client'}</h3><p class="lead"><b>Email:</b> ${t.email || '-'}</p><p class="lead"><b>Budget:</b> ${t.budget || '-'}</p><p class="lead"><b>Date:</b> ${t.created_at ? new Date(t.created_at).toLocaleString() : 'No timestamp'}</p><p>${t.message || ''}</p>`;
    ticketsList.appendChild(card);
  });
}

loginForm.addEventListener('submit',(e)=>{e.preventDefault();const v=$('adminPassword').value;if(!ADMIN_PASSWORD){loginStatus.textContent='ADMIN_PASSWORD missing in config.js';return;}if(v!==ADMIN_PASSWORD){loginStatus.textContent='Wrong password';return;}loginStatus.textContent='Access granted';unlock();});
refreshBtn.addEventListener('click',()=>loadTickets());
logoutBtn.addEventListener('click',lock);
prevPage.addEventListener('click',()=>{if(currentPage>1){currentPage--;loadTickets();}});
nextPage.addEventListener('click',()=>{const max=Math.max(1,Math.ceil(totalTickets/PAGE_SIZE));if(currentPage<max){currentPage++;loadTickets();}});

if(sessionStorage.getItem('logicnest_admin')==='true') unlock(); else lock();
