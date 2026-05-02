import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cfg = window.LOGICNEST_CONFIG || {};
const ADMIN_PASSWORD = cfg.ADMIN_PASSWORD;
const PAGE_SIZE = 6;
const supabase = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

const loginForm = document.getElementById('adminLoginForm');
const loginBox = document.getElementById('loginBox');
const loginStatus = document.getElementById('loginStatus');
const dashboard = document.getElementById('dashboard');
const ticketsMeta = document.getElementById('ticketsMeta');
const ticketsList = document.getElementById('ticketsList');
const pageInfo = document.getElementById('pageInfo');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
let currentPage = 1, totalTickets = 0;

function lock(){sessionStorage.removeItem('logicnest_admin');dashboard.style.display='none';loginBox.style.display='grid';}
function unlock(){sessionStorage.setItem('logicnest_admin','true');loginBox.style.display='none';dashboard.style.display='block';loadTickets();}

async function loadTickets(){
  const from=(currentPage-1)*PAGE_SIZE,to=from+PAGE_SIZE-1;
  const {data,error,count}=await supabase.from('tickets').select('*',{count:'exact'}).order('created_at',{ascending:false}).range(from,to);
  if(error){ticketsMeta.textContent=error.message;return;}
  totalTickets=count||0;const totalPages=Math.max(1,Math.ceil(totalTickets/PAGE_SIZE));
  pageInfo.textContent=`Page ${currentPage} of ${totalPages}`;prevPage.disabled=currentPage<=1;nextPage.disabled=currentPage>=totalPages;
  ticketsMeta.textContent=`${totalTickets} total ticket(s)`;ticketsList.innerHTML='';
  (data||[]).forEach(t=>{const c=document.createElement('article');c.className='panel';c.innerHTML=`<h3>${t.name}</h3><p>${t.email}</p><p>${t.budget}</p><p>${t.message}</p>`;ticketsList.appendChild(c);});
}
loginForm.addEventListener('submit',(e)=>{e.preventDefault();const p=document.getElementById('adminPassword').value; if(p!==ADMIN_PASSWORD){loginStatus.textContent='Wrong password';return;} unlock();});
prevPage.addEventListener('click',()=>{if(currentPage>1){currentPage--;loadTickets();}});
nextPage.addEventListener('click',()=>{const max=Math.max(1,Math.ceil(totalTickets/PAGE_SIZE));if(currentPage<max){currentPage++;loadTickets();}});
if(sessionStorage.getItem('logicnest_admin')==='true') unlock(); else lock();
