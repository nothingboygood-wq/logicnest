import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cfg = window.LOGICNEST_CONFIG || {};
const supabase = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

const form = document.getElementById('ticketForm');
const statusEl = document.getElementById('formStatus');
const budgetSelect = document.getElementById('budgetSelect');
const customBudgetWrap = document.getElementById('customBudgetWrap');
const customBudgetInput = document.getElementById('customBudgetInput');

if (budgetSelect) {
  budgetSelect.addEventListener('change', () => {
    const isCustom = budgetSelect.value === 'custom';
    customBudgetWrap.style.display = isCustom ? 'grid' : 'none';
    customBudgetInput.required = isCustom;
  });
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  statusEl.textContent = 'Submitting...';
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  payload.budget = payload.budget === 'custom' ? payload.custom_budget : payload.budget;
  payload.source = 'website';

  const { error } = await supabase.from('tickets').insert(payload);
  statusEl.textContent = error ? `Error: ${error.message}` : '✅ Ticket submitted';
  if (!error) {
    form.reset();
    customBudgetWrap.style.display = 'none';
    customBudgetInput.required = false;
  }
});
