// ─── EmailJS 設定 ──────────────────────────────────────
const EJ_PUBLIC_KEY       = 'jp-46tMB3qEvifupo';
const EJ_SERVICE_ID       = 'service_mm08v06';
const EJ_TEMPLATE_NOTIFY  = 'template_noqldqf';
const EJ_TEMPLATE_CONFIRM = 'template_yxay7fq';
// ────────────────────────────────────────────────────────

emailjs.init(EJ_PUBLIC_KEY);

function calcAge() {
  const b = new Date(1994, 8, 16), t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
  return a;
}

function calcExp() {
  const s = new Date(2017, 7, 1), t = new Date();
  return Math.floor((t - s) / (1000 * 60 * 60 * 24 * 365.25));
}

const age = calcAge(), exp = calcExp();
document.getElementById('h-age').textContent = age;
document.getElementById('h-exp').textContent = exp;
document.getElementById('t-exp').textContent = '"' + exp + '+ years"';
document.getElementById('fy').textContent = new Date().getFullYear();

document.getElementById('contact-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const fd      = new FormData(e.target);
  const name    = fd.get('name');
  const email   = fd.get('email');
  const subject = fd.get('subject') || 'ポートフォリオからのお問い合わせ';
  const message = fd.get('message');
  const btn     = document.getElementById('send-btn');

  btn.textContent = 'Sending...';
  btn.disabled = true;

  const params = { from_name: name, from_email: email, email, subject, message };

  Promise.all([
    emailjs.send(EJ_SERVICE_ID, EJ_TEMPLATE_NOTIFY,  params),
    emailjs.send(EJ_SERVICE_ID, EJ_TEMPLATE_CONFIRM, { ...params, to_email: email }),
  ]).then(() => {
    btn.textContent = '✓ Sent!';
    btn.style.background = '#00E5A0';
    btn.style.color = '#000';
    e.target.reset();
    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.style.background = '';
      btn.style.color = '';
      btn.disabled = false;
    }, 3000);
  }).catch((err) => {
    console.error('EmailJS error:', err);
    const msg = err?.text || err?.message || JSON.stringify(err);
    btn.textContent = 'Error: ' + msg;
    btn.style.background = '#FF5F57';
    btn.style.color = '#fff';
    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.style.background = '';
      btn.style.color = '';
      btn.disabled = false;
    }, 5000);
  });
});

const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.style.opacity = '1';
      en.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.proj-card,.exp-item,.skill-block,.tl-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(18px)';
  el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  io.observe(el);
});

const sNavItems = document.querySelectorAll('.skills-nav-item');
const sObs = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      const id = '#' + en.target.id;
      sNavItems.forEach(a => { a.classList.toggle('active', a.getAttribute('href') === id); });
    }
  });
}, { threshold: 0.6 });

document.querySelectorAll('.skill-block').forEach(b => sObs.observe(b));
