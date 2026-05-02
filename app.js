import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 1) Replace these with your real project credentials.
const SUPABASE_URL = 'https://saymqnihmcrowapmrajj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNheW1xbmlobWNyb3dhcG1yYWpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MTI0MTcsImV4cCI6MjA5MzI4ODQxN30.2Fe_iQTczYVT5uRbk1RS4uJVgWi6aIeRXhXNDcPJJTg';
const DISCORD_INVITE_URL = 'https://discord.gg/pN8Snr8VT';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('discordInvite').href = DISCORD_INVITE_URL;

const form = document.getElementById('ticketForm');
const statusEl = document.getElementById('formStatus');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  statusEl.textContent = 'Submitting your ticket...';

  const formData = new FormData(form);
  const payload = {
    name: formData.get('name'),
    email: formData.get('email'),
    budget: formData.get('budget'),
    message: formData.get('message'),
    source: 'website',
    created_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('tickets').insert(payload);

  if (error) {
    statusEl.textContent = `Could not submit ticket: ${error.message}`;
    return;
  }

  form.reset();
  statusEl.textContent = '✅ Ticket created! We will contact you soon.';
});

const revealElements = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.2 }
);
revealElements.forEach((el) => observer.observe(el));
