document.querySelectorAll('#year').forEach((el)=>el.textContent=new Date().getFullYear());
const observer = new IntersectionObserver((entries)=>{entries.forEach((e)=>{if(e.isIntersecting)e.target.classList.add('show');});},{threshold:.15});
document.querySelectorAll('.reveal').forEach((el)=>observer.observe(el));

const root = document.documentElement;
const saved = localStorage.getItem('logicnest_theme');
if (saved === 'light') root.classList.add('light');
const toggle = document.getElementById('themeToggle');
if (toggle) {
  const update = () => toggle.textContent = root.classList.contains('light') ? 'Dark Mode' : 'Light Mode';
  update();
  toggle.addEventListener('click', () => {
    root.classList.toggle('light');
    localStorage.setItem('logicnest_theme', root.classList.contains('light') ? 'light' : 'dark');
    update();
  });
}
