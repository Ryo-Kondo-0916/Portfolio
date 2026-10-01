// ─── EmailJS 設定 ──────────────────────────────────────
// EmailJS の管理画面で、Domains の許可リストを公開URLのドメインだけにしてください。
const EJ_PUBLIC_KEY       = 'jp-46tMB3qEvifupo';
const EJ_SERVICE_ID       = 'service_mm08v06';
const EJ_TEMPLATE_NOTIFY  = 'template_noqldqf';
const EJ_TEMPLATE_CONFIRM = 'template_yxay7fq';

// ─── reCAPTCHA v2 設定 ─────────────────────────────────
// 自動返信は入力された任意のアドレスへ送られるため、reCAPTCHA を通った送信だけに限る。
// サイトキーを空にすると、自動返信を送らず近藤宛ての通知だけを送る。
// 設定手順：Google でサイトキーを発行 → 下に貼る → EmailJS で自動返信テンプレートの
// Settings タブにある「Enable reCAPTCHA V2 verification」をオンにし、シークレットキーを登録する。
const RECAPTCHA_SITE_KEY = '6LchBNktAAAAANQBaT11kJJkPcVYwdsIRBKiF9D_';
// ────────────────────────────────────────────────────────

const SEND_COOLDOWN_MS = 60000;

// ボット対策：HTML に平文で置かない
const EMAIL = atob('a29uZG8uckBpdG9xLmNvLmpw');

// 生年月日をコードに残さないため、生まれた年と月だけで計算する。
// 誕生月の1日に年齢が上がるので、誕生日より最大で半月ほど早く切り替わる。
const BIRTH_YEAR  = 1994;
const BIRTH_MONTH = 9;

function calcAge() {
  const t = new Date();
  let a = t.getFullYear() - BIRTH_YEAR;
  if (t.getMonth() + 1 < BIRTH_MONTH) a--;
  return a;
}

function calcExp() {
  const s = new Date(2017, 7, 1), t = new Date();
  return Math.floor((t - s) / (1000 * 60 * 60 * 24 * 365.25));
}

const exp = calcExp();
document.getElementById('age').textContent = calcAge();
document.getElementById('exp-years').textContent = exp;
document.getElementById('exp-years-2').textContent = exp;
document.getElementById('fy').textContent = new Date().getFullYear();
document.getElementById('copy-email-text').textContent = EMAIL;

// ─── reCAPTCHA ─────────────────────────────────────────
let captchaWidgetId = null;

window.onRecaptchaLoad = function () {
  captchaWidgetId = grecaptcha.render('captcha', { sitekey: RECAPTCHA_SITE_KEY });
};

if (RECAPTCHA_SITE_KEY) {
  const s = document.createElement('script');
  s.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit&hl=ja';
  s.async = true;
  document.head.appendChild(s);
}

function captchaToken() {
  if (captchaWidgetId === null) return '';
  return grecaptcha.getResponse(captchaWidgetId);
}

function resetCaptcha() {
  if (captchaWidgetId !== null) grecaptcha.reset(captchaWidgetId);
}

// ─── お問い合わせフォーム ───────────────────────────────
const form   = document.getElementById('contact-form');
const btn    = document.getElementById('send-btn');
const status = document.getElementById('form-status');
let lastSentAt = 0;

try {
  if (typeof emailjs !== 'undefined') emailjs.init(EJ_PUBLIC_KEY);
} catch (err) {
  console.error('EmailJS の初期化に失敗しました', err);
}

function showStatus(text, kind) {
  status.textContent = text;
  status.className = 'form-status' + (kind ? ' is-' + kind : '');
}

function sendMail(fields, token) {
  const params = {
    from_name: fields.name, from_email: fields.email, email: fields.email,
    subject: fields.subject, message: fields.message,
  };
  const jobs = [emailjs.send(EJ_SERVICE_ID, EJ_TEMPLATE_NOTIFY, params)];
  if (token) {
    jobs.push(emailjs.send(EJ_SERVICE_ID, EJ_TEMPLATE_CONFIRM,
      { ...params, to_email: fields.email, 'g-recaptcha-response': token }));
  }
  return Promise.all(jobs);
}

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const wait = SEND_COOLDOWN_MS - (Date.now() - lastSentAt);
  if (wait > 0) {
    showStatus(Math.ceil(wait / 1000) + '秒後に再送信できます。', 'error');
    return;
  }
  if (typeof emailjs === 'undefined') {
    showStatus('送信機能を読み込めませんでした。' + EMAIL + ' へ直接ご連絡ください。', 'error');
    return;
  }

  const fd = new FormData(form);
  // ハニーポット：ボットが埋めたら送らず、送れたように見せる
  if ((fd.get('website') || '').trim() !== '') {
    form.reset();
    showStatus('送信しました。', 'ok');
    return;
  }

  const fields = {
    name:    (fd.get('name')    || '').trim(),
    email:   (fd.get('email')   || '').trim(),
    subject: (fd.get('subject') || '').trim() || 'ポートフォリオからのお問い合わせ',
    message: (fd.get('message') || '').trim(),
  };
  if (!fields.name || !fields.email || !fields.message) {
    showStatus('お名前・メールアドレス・内容を入力してください。', 'error');
    return;
  }

  const token = captchaToken();
  if (RECAPTCHA_SITE_KEY && !token) {
    showStatus('「私はロボットではありません」にチェックを入れてください。', 'error');
    return;
  }

  btn.textContent = '送信しています…';
  btn.disabled = true;
  showStatus('', '');

  sendMail(fields, token).then(() => {
    lastSentAt = Date.now();
    form.reset();
    showStatus(token ? '送信しました。確認メールをお送りしています。' : '送信しました。', 'ok');
  }).catch(() => {
    showStatus('送信できませんでした。時間をおいて再度お試しいただくか、' + EMAIL + ' へ直接ご連絡ください。', 'error');
  }).finally(() => {
    resetCaptcha();
    btn.textContent = '送信する';
    btn.disabled = false;
  });
});

document.getElementById('copy-email').addEventListener('click', function () {
  const hint = document.getElementById('copy-email-hint');
  navigator.clipboard.writeText(EMAIL).then(() => {
    hint.textContent = 'コピーしました';
    setTimeout(() => { hint.textContent = 'コピー'; }, 2000);
  }).catch(() => {
    window.location.href = 'mailto:' + EMAIL;
  });
});
