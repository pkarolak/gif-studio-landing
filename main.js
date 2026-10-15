const FRAMES = 326;
const FPS = 30;
const BEATS = [
  {t: 0, label: 'Projects'},
  {t: 2.85, label: 'New project'},
  {t: 6.58, label: 'Name it'},
  {t: 9.09, label: 'Created'},
];

const scrub = document.getElementById('scrub');
const input = document.getElementById('scrub-input');
const video = document.getElementById('loupe-video');
const word = document.getElementById('beat-word');
const read = document.getElementById('loupe-read');
const playhead = document.getElementById('playhead');
const loupe = document.getElementById('loupe');

let pending = null;
const seekVideo = (time) => {
  if (video.readyState < 1) {
    pending = time;
    return;
  }
  if (video.seeking) {
    pending = time;
    return;
  }
  video.currentTime = time;
};
video.addEventListener('seeked', () => {
  if (pending !== null) {
    const next = pending;
    pending = null;
    video.currentTime = next;
  }
});
video.addEventListener('loadedmetadata', () => {
  if (pending !== null) seekVideo(pending);
});

const render = () => {
  const frame = Number(input.value);
  const p = frame / (FRAMES - 1);
  const time = frame / FPS;
  const index = BEATS.findLastIndex((b) => time >= b.t);
  const beat = BEATS[Math.max(0, index)];
  playhead.style.setProperty('--p', p);
  loupe.style.setProperty('--p', p);
  read.textContent = `Frame ${frame + 1} of ${FRAMES} · ${time.toFixed(2)}s`;
  input.setAttribute('aria-valuetext', `${time.toFixed(2)} seconds, ${beat.label}`);
  if (word.textContent !== beat.label) word.textContent = beat.label;
  scrub.dataset.beat = String(Math.max(0, index));
  seekVideo(Math.min(time, 10.8));
};

input.addEventListener('input', render);
render();

for (const button of document.querySelectorAll('[data-copy]')) {
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      button.setAttribute('data-copied', '');
      button.textContent = 'Copied';
      setTimeout(() => {
        button.removeAttribute('data-copied');
        button.textContent = 'Copy';
      }, 1400);
    } catch {
      button.textContent = 'Select it';
    }
  });
}

const groups = new Map();
for (const el of document.querySelectorAll('main > section:not(.hero) .reveal')) {
  const parent = el.closest('section') ?? document.body;
  const index = groups.get(parent) ?? 0;
  groups.set(parent, index + 1);
  el.style.setProperty('--d', `${index * 80}ms`);
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      }
    },
    {rootMargin: '0px 0px -10% 0px'},
  );
  document.querySelectorAll('main > section:not(.hero) .reveal').forEach((el) => observer.observe(el));
} else {
  document.querySelectorAll('main > section:not(.hero) .reveal').forEach((el) => el.classList.add('is-in'));
}
