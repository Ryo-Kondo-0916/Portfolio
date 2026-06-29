// ─── EmailJS 設定 ──────────────────────────────────────
const EJ_PUBLIC_KEY       = 'jp-46tMB3qEvifupo';
const EJ_SERVICE_ID       = 'service_mm08v06';
const EJ_TEMPLATE_NOTIFY  = 'template_noqldqf';
const EJ_TEMPLATE_CONFIRM = 'template_yxay7fq';
// EmailJS ダッシュボードで Allowed Origins を
// ryo-kondo-0916.github.io のみに制限してください。
// ────────────────────────────────────────────────────────

// ─── 年齢・経験年数・フッター年 ───────────────────────
function calcAge() {
  const b = new Date(1994, 8, 16), t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  if (t.getMonth() - b.getMonth() < 0 ||
     (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
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

// ─── ハンバーガーメニュー ─────────────────────────────
const hamburger = document.getElementById('nav-hamburger');

function openNav() {
  document.body.classList.add('nav-open');
  hamburger.setAttribute('aria-expanded', 'true');
  hamburger.setAttribute('aria-label', 'メニューを閉じる');
  document.body.style.overflow = 'hidden';
}
function closeNav() {
  document.body.classList.remove('nav-open');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'メニューを開く');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', function () {
  if (document.body.classList.contains('nav-open')) {
    closeNav();
  } else {
    openNav();
  }
});

document.querySelectorAll('#nav-links a').forEach(function(link) {
  link.addEventListener('click', function(e) {
    var href = link.getAttribute('href');
    closeNav();
    if (href && href.charAt(0) === '#') {
      e.preventDefault();
      var target = document.querySelector(href);
      if (target) {
        setTimeout(function() {
          target.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      }
    }
  });
});

window.addEventListener('resize', function () {
  if (window.innerWidth > 600) closeNav();
});

// ─── コンタクトフォーム（レート制限付き） ────────────
let lastSentAt = 0;
const SEND_COOLDOWN_MS = 60000;

document.getElementById('contact-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const btn = document.getElementById('send-btn');
  const now = Date.now();

  if (now - lastSentAt < SEND_COOLDOWN_MS) {
    const remaining = Math.ceil((SEND_COOLDOWN_MS - (now - lastSentAt)) / 1000);
    btn.textContent = remaining + '秒後に再送信できます';
    return;
  }

  if (typeof emailjs === 'undefined') {
    btn.textContent = 'Error — メールサービス利用不可';
    btn.style.background = '#FF5F57';
    btn.style.color = '#fff';
    setTimeout(function () {
      btn.textContent = 'Send Message';
      btn.style.background = '';
      btn.style.color = '';
    }, 3000);
    return;
  }

  const fd      = new FormData(e.target);
  const name    = fd.get('name');
  const email   = fd.get('email');
  const subject = fd.get('subject') || 'ポートフォリオからのお問い合わせ';
  const message = fd.get('message');

  btn.textContent = 'Sending...';
  btn.disabled = true;

  const params = { from_name: name, from_email: email, email: email, subject: subject, message: message };

  Promise.all([
    emailjs.send(EJ_SERVICE_ID, EJ_TEMPLATE_NOTIFY,  params),
    emailjs.send(EJ_SERVICE_ID, EJ_TEMPLATE_CONFIRM, Object.assign({}, params, { to_email: email })),
  ]).then(function () {
    lastSentAt = Date.now();
    btn.textContent = '✓ Sent!';
    btn.style.background = '#00E5A0';
    btn.style.color = '#000';
    e.target.reset();
    setTimeout(function () {
      btn.textContent = 'Send Message';
      btn.style.background = '';
      btn.style.color = '';
      btn.disabled = false;
    }, 3000);
  }).catch(function () {
    btn.textContent = 'Error — try again';
    btn.style.background = '#FF5F57';
    btn.style.color = '#fff';
    setTimeout(function () {
      btn.textContent = 'Send Message';
      btn.style.background = '';
      btn.style.color = '';
      btn.disabled = false;
    }, 3000);
  });
});

// ─── EmailJS 初期化（他の機能に影響しないよう最後に実行）
try {
  if (typeof emailjs !== 'undefined') emailjs.init(EJ_PUBLIC_KEY);
} catch (err) {
  // EmailJS 初期化失敗時はフォームのみ無効になる
}

// ─── スクロールアニメーション（reduced-motion 対応）───
var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.style.opacity = '1';
        en.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.proj-card,.exp-item,.skill-block,.tl-item').forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    io.observe(el);
  });
}

// ─── スキルナビ ハイライト ────────────────────────────
var sNavItems = document.querySelectorAll('.skills-nav-item');
var sObs = new IntersectionObserver(function (entries) {
  entries.forEach(function (en) {
    if (en.isIntersecting) {
      var id = '#' + en.target.id;
      sNavItems.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === id);
      });
    }
  });
}, { threshold: 0.6 });

document.querySelectorAll('.skill-block').forEach(function (b) { sObs.observe(b); });
