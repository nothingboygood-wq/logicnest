import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cfg = window.LOGICNEST_CONFIG || {};
const supabase = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

const form = document.getElementById('ticketForm');
const statusEl = document.getElementById('formStatus');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  statusEl.textContent = 'Submitting...';
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  payload.source = 'website';
  const { error } = await supabase.from('tickets').insert(payload);
  statusEl.textContent = error ? `Error: ${error.message}` : '✅ Ticket submitted';
  if (!error) form.reset();
});
