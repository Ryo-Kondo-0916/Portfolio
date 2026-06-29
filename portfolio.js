// ─── EmailJS 設定 ──────────────────────────────────────
const EJ_PUBLIC_KEY       = 'jp-46tMB3qEvifupo';
const EJ_SERVICE_ID       = 'service_mm08v06';
const EJ_TEMPLATE_NOTIFY  = 'template_noqldqf';
const EJ_TEMPLATE_CONFIRM = 'template_yxay7fq';
// ────────────────────────────────────────────────────────
// IMPORTANT: EmailJS ダッシュボードで Allowed Origins を
// ryo-kondo-0916.github.io のみに制限してください。
// ────────────────────────────────────────────────────────

emailjs.init(EJ_PUBLIC_KEY);

// メールアドレス（スパムボット対策としてソース上に平文で持たない）
const _email = atob('a29uZG8uckBpdG9xLmNvLmpw');
document.getElementById('copy-email-text').textContent = _email;

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

// ─── コンタクトフォーム（レート制限付き） ────────────
let lastSentAt = 0;
const SEND_COOLDOWN_MS = 60_000;

document.getElementById('contact-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const now = Date.now();
  const remaining = Math.ceil((SEND_COOLDOWN_MS - (now - lastSentAt)) / 1000);
  if (now - lastSentAt < SEND_COOLDOWN_MS) {
    const btn = document.getElementById('send-btn');
    btn.textContent = remaining + '秒後に再送信できます';
    return;
  }

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
    lastSentAt = Date.now();
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
  }).catch(() => {
    btn.textContent = 'Error — try again';
    btn.style.background = '#FF5F57';
    btn.style.color = '#fff';
    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.style.background = '';
      btn.style.color = '';
      btn.disabled = false;
    }, 3000);
  });
});

// ─── メールコピー ─────────────────────────────────────
document.getElementById('copy-email').addEventListener('click', function () {
  navigator.clipboard.writeText(_email).then(() => {
    const text  = document.getElementById('copy-email-text');
    const arrow = document.getElementById('copy-email-arrow');
    text.textContent  = 'コピーしました！';
    arrow.textContent = '✓';
    setTimeout(() => {
      text.textContent  = _email;
      arrow.textContent = '→';
    }, 2000);
  }).catch(() => {
    // クリップボードAPIが使えない場合は何もしない
  });
});

// ─── スクロールアニメーション（reduced-motion 対応）───
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
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
}

// ─── スキルナビ ハイライト ────────────────────────────
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

// ─── ハンバーガーメニュー ─────────────────────────────
const hamburger = document.getElementById('nav-hamburger');

hamburger.addEventListener('click', () => {
  const isOpen = document.body.classList.toggle('nav-open');
  hamburger.setAttribute('aria-expanded', isOpen);
  hamburger.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

function closeNav() {
  document.body.classList.remove('nav-open');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'メニューを開く');
  document.body.style.overflow = '';
}

// onclick属性を使わずにリスナーで登録（CSP対応）
document.querySelectorAll('#nav-links a').forEach(link => {
  link.addEventListener('click', closeNav);
});

// 画面幅が広がったときにモバイルメニューを閉じる
window.addEventListener('resize', () => {
  if (window.innerWidth > 600) closeNav();
});
