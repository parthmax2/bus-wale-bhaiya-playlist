const stage = document.getElementById('stage');
stage.style.backgroundImage = `url('${stage.dataset.bg}')`;

const title = document.getElementById('title');
const hornBtn = document.getElementById('horn-btn');

const ANIMATION_COUNT = 7;

function splitTitleIntoLetters() {
  const text = title.textContent;
  const segmenter = typeof Intl !== 'undefined' && Intl.Segmenter
    ? new Intl.Segmenter('hi', { granularity: 'grapheme' })
    : null;

  const graphemes = segmenter
    ? Array.from(segmenter.segment(text), (s) => s.segment)
    : Array.from(text);

  title.textContent = '';
  graphemes.forEach((char, i) => {
    const span = document.createElement('span');
    span.className = `letter letter-anim-${(i % ANIMATION_COUNT) + 1}`;
    span.style.setProperty('--i', i);
    span.textContent = char === ' ' ? ' ' : char;
    title.appendChild(span);
  });
}

function playLetters() {
  const letters = title.querySelectorAll('.letter');
  letters.forEach((letter) => {
    letter.classList.remove('play');
    void letter.offsetWidth;
    letter.classList.add('play');
  });
}

splitTitleIntoLetters();
playLetters();

const hornSounds = [new Audio(hornBtn.dataset.sound1), new Audio(hornBtn.dataset.sound2)];
let lastHorn = -1;

let activeHorn = null;

hornBtn.addEventListener('click', () => {
  if (activeHorn && !activeHorn.paused) {
    activeHorn.pause();
    activeHorn.currentTime = 0;
    activeHorn = null;
    return;
  }

  hornBtn.classList.remove('honk');
  void hornBtn.offsetWidth;
  hornBtn.classList.add('honk');
  playLetters();

  let pick = Math.floor(Math.random() * hornSounds.length);
  if (pick === lastHorn) pick = (pick + 1) % hornSounds.length;
  lastHorn = pick;

  const sound = hornSounds[pick];
  sound.currentTime = 0;
  sound.play();
  activeHorn = sound;
  sound.addEventListener('ended', () => {
    if (activeHorn === sound) activeHorn = null;
  }, { once: true });
});

const audio = document.getElementById('audio');
const playBtn = document.getElementById('play-btn');
const playIcon = document.getElementById('play-icon');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const seekBar = document.getElementById('seek-bar');
const barTime = document.getElementById('bar-time');
const trackTitleEl = document.getElementById('track-title');
const barArt = document.getElementById('bar-art');
const trackToggle = document.getElementById('track-toggle');
const trackPanel = document.getElementById('track-panel');
const trackList = document.getElementById('track-list');
const trackCount = document.getElementById('track-count');

barArt.style.setProperty('--bar-art-img', `url('${barArt.dataset.art}')`);

const ICON_PLAY = 'M7 5l12 7-12 7z';
const ICON_PAUSE = 'M6 5h4v14H6zM14 5h4v14h-4z';

const playlist = JSON.parse(document.getElementById('tracks-data').textContent || '[]');
let trackIndex = 0;
let seeking = false;

function formatTime(sec) {
  if (!isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function buildTrackPanel() {
  trackList.innerHTML = playlist
    .map((track, i) => `<button class="track-row" data-index="${i}"><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="track-row-title">${track.title}</span></button>`)
    .join('');
  trackCount.textContent = `${playlist.length} tracks`;
}

function setActiveRow() {
  trackList.querySelectorAll('.track-row').forEach((row) => {
    const isActive = Number(row.dataset.index) === trackIndex;
    row.classList.toggle('active', isActive);
    if (isActive && trackPanel.classList.contains('open')) {
      row.scrollIntoView({ block: 'nearest' });
    }
  });
}

function updateSeekTrack(pct) {
  seekBar.style.background = `linear-gradient(to right, #fff ${pct}%, rgba(255,255,255,0.22) ${pct}%)`;
}

function loadTrack(index, autoplay) {
  if (!playlist.length) return;
  trackIndex = (index + playlist.length) % playlist.length;
  const track = playlist[trackIndex];
  audio.src = track.src;
  trackTitleEl.textContent = track.title;
  seekBar.value = 0;
  updateSeekTrack(0);
  barTime.textContent = `0:00 / 0:00`;
  setActiveRow();
  if (autoplay) {
    audio.play();
  } else {
    setPlayingState(false);
  }
}

function setPlayingState(playing) {
  playIcon.setAttribute('d', playing ? ICON_PAUSE : ICON_PLAY);
  playBtn.classList.toggle('is-playing', playing);
}

function togglePlay() {
  if (!playlist.length) return;
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}

function bounce(el) {
  el.classList.remove('bounce');
  void el.offsetWidth;
  el.classList.add('bounce');
}

playBtn.addEventListener('click', () => {
  bounce(playBtn);
  togglePlay();
});
prevBtn.addEventListener('click', () => {
  bounce(prevBtn);
  loadTrack(trackIndex - 1, true);
});
nextBtn.addEventListener('click', () => {
  bounce(nextBtn);
  loadTrack(trackIndex + 1, true);
});

audio.addEventListener('play', () => setPlayingState(true));
audio.addEventListener('pause', () => setPlayingState(false));

audio.addEventListener('loadedmetadata', () => {
  seekBar.max = audio.duration || 0;
});

audio.addEventListener('timeupdate', () => {
  if (seeking) return;
  const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  seekBar.value = audio.currentTime;
  updateSeekTrack(pct);
  barTime.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
});

audio.addEventListener('ended', () => {
  loadTrack(trackIndex + 1, true);
});

seekBar.addEventListener('input', () => {
  seeking = true;
  const pct = audio.duration ? (seekBar.value / audio.duration) * 100 : 0;
  updateSeekTrack(pct);
  barTime.textContent = `${formatTime(seekBar.value)} / ${formatTime(audio.duration)}`;
});

seekBar.addEventListener('change', () => {
  audio.currentTime = seekBar.value;
  seeking = false;
});

trackToggle.addEventListener('click', () => {
  trackPanel.classList.toggle('open');
});

trackPanel.addEventListener('click', (e) => {
  const row = e.target.closest('.track-row');
  if (!row) return;
  loadTrack(Number(row.dataset.index), true);
  trackPanel.classList.remove('open');
});

document.addEventListener('click', (e) => {
  if (!trackPanel.contains(e.target) && !trackToggle.contains(e.target)) {
    trackPanel.classList.remove('open');
  }
});

buildTrackPanel();
loadTrack(0, false);

const ghBadge = document.getElementById('gh-badge');
const ghReveal = document.getElementById('gh-reveal');
const ghCloneWrap = document.getElementById('gh-reveal-clone');
const ghReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ghNameEl = document.getElementById('gh-reveal-name');
const ghHandleEl = document.getElementById('gh-reveal-handle');
const ghBioEl = document.getElementById('gh-reveal-bio');
const ghReposEl = document.getElementById('gh-stat-repos');
const ghFollowersEl = document.getElementById('gh-stat-followers');
const ghFollowingEl = document.getElementById('gh-stat-following');

let ghAnimating = false;
let ghAudioCtx = null;

function getGhAudioCtx() {
  if (!ghAudioCtx) {
    ghAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (ghAudioCtx.state === 'suspended') {
    ghAudioCtx.resume();
  }
  return ghAudioCtx;
}

function ghPlayPop() {
  const ctx = getGhAudioCtx();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(900, t);
  osc.frequency.exponentialRampToValueAtTime(240, t + 0.14);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.35, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.18);
}

function ghPlayWhoosh() {
  const ctx = getGhAudioCtx();
  const t = ctx.currentTime;
  const duration = 0.65;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 0.8;
  filter.frequency.setValueAtTime(300, t);
  filter.frequency.exponentialRampToValueAtTime(3200, t + duration * 0.8);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.22, t + duration * 0.35);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  noise.connect(filter).connect(gain).connect(ctx.destination);
  noise.start(t);
  noise.stop(t + duration);
}

function ghPlayChime() {
  const ctx = getGhAudioCtx();
  const t = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99];
  notes.forEach((freq, i) => {
    const start = t + i * 0.09;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.55);
  });
}

fetch('https://api.github.com/users/parthmax2')
  .then((r) => (r.ok ? r.json() : null))
  .then((data) => {
    if (!data) return;
    ghNameEl.textContent = data.name || data.login;
    ghHandleEl.textContent = `@${data.login}`;
    ghBioEl.textContent = data.bio || '';
    ghBioEl.style.display = data.bio ? '' : 'none';
    ghReposEl.textContent = data.public_repos ?? '–';
    ghFollowersEl.textContent = data.followers ?? '–';
    ghFollowingEl.textContent = data.following ?? '–';
  })
  .catch(() => {});

ghBadge.addEventListener('click', (e) => {
  if (ghAnimating) {
    e.preventDefault();
    return;
  }
  e.preventDefault();
  ghAnimating = true;

  const profileUrl = ghBadge.href;
  getGhAudioCtx();
  ghPlayPop();

  const finish = () => {
    ghReveal.classList.remove('is-active', 'is-closing');
    ghReveal.setAttribute('aria-hidden', 'true');
    ghCloneWrap.classList.remove('gh-fly', 'gh-fly-hide');
    ghBadge.classList.remove('gh-hide');
    ghAnimating = false;
    const newTab = window.open(profileUrl, '_blank');
    if (!newTab) {
      window.location.href = profileUrl;
    }
  };

  if (ghReduceMotion) {
    ghReveal.classList.add('is-active');
    ghReveal.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      ghReveal.classList.add('is-closing');
      setTimeout(finish, 250);
    }, 500);
    return;
  }

  ghBadge.classList.add('gh-pop');
  setTimeout(() => ghBadge.classList.remove('gh-pop'), 300);

  const rect = ghBadge.getBoundingClientRect();
  const size = rect.width;
  ghCloneWrap.style.width = `${size}px`;
  ghCloneWrap.style.height = `${size}px`;
  ghCloneWrap.style.transform = `translate(${rect.left}px, ${rect.top}px) scale(1)`;

  ghReveal.setAttribute('aria-hidden', 'false');
  ghReveal.classList.add('is-active');
  ghBadge.classList.add('gh-hide');

  requestAnimationFrame(() => {
    ghCloneWrap.classList.add('gh-fly');
    ghPlayWhoosh();
    const targetX = window.innerWidth / 2 - size / 2;
    const targetY = window.innerHeight / 2 - size / 2 - 90;
    const scale = 1.5;
    ghCloneWrap.style.transform = `translate(${targetX}px, ${targetY}px) scale(${scale}) rotate(340deg)`;
  });

  setTimeout(() => {
    ghCloneWrap.classList.add('gh-fly-hide');
  }, 650);

  setTimeout(() => {
    ghPlayChime();
  }, 750);

  setTimeout(() => {
    ghReveal.classList.add('is-closing');
  }, 2700);

  setTimeout(finish, 3000);
});
