// ============================================================
// PHYSICAL GRAFFITI — SCRIPT & INTERACTION ENGINE
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initAudioSynthesizer();
  initGrimoireTabs();
  initBookingModal();
  initScrollAnimations();
});

// 1. CUSTOM BRASS NEEDLE CURSOR
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  if (!cursor) return;

  let mouseX = -100, mouseY = -100;
  let cursorX = -100, cursorY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  window.addEventListener('mousedown', () => cursor.classList.add('clicking'));
  window.addEventListener('mouseup', () => cursor.classList.remove('clicking'));

  function updateCursor() {
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    requestAnimationFrame(updateCursor);
  }
  updateCursor();
}

// 2. WEB AUDIO API SYNTHESIZER (Gothic Drone & Ambient Parlour Soundscape)
let audioCtx = null;
let isAudioPlaying = false;
let masterGain = null;
let droneOsc1 = null;
let droneOsc2 = null;

function initAudioSynthesizer() {
  const toggleBtn = document.getElementById('audio-toggle');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();

      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);

      // Low gothic cathedral pipe drone (C2 + G2)
      droneOsc1 = audioCtx.createOscillator();
      droneOsc1.type = 'sine';
      droneOsc1.frequency.setValueAtTime(65.41, audioCtx.currentTime); // C2

      droneOsc2 = audioCtx.createOscillator();
      droneOsc2.type = 'triangle';
      droneOsc2.frequency.setValueAtTime(98.00, audioCtx.currentTime); // G2

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, audioCtx.currentTime);

      droneOsc1.connect(filter);
      droneOsc2.connect(filter);
      filter.connect(masterGain);

      // Antique Brass Tattoo Machine Rotary Coil Oscillator (115Hz harmonic buzz)
      const coilOsc = audioCtx.createOscillator();
      coilOsc.type = 'sawtooth';
      coilOsc.frequency.setValueAtTime(115, audioCtx.currentTime);

      const coilFilter = audioCtx.createBiquadFilter();
      coilFilter.type = 'bandpass';
      coilFilter.frequency.setValueAtTime(750, audioCtx.currentTime);
      coilFilter.Q.setValueAtTime(3.5, audioCtx.currentTime);

      const coilGain = audioCtx.createGain();
      coilGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);

      coilOsc.connect(coilFilter);
      coilFilter.connect(coilGain);
      coilGain.connect(masterGain);

      coilOsc.start();
      droneOsc1.start();
      droneOsc2.start();

      // Spatial Tattoo Coil Modulation based on 3D Camera Position
      window.tattooAudio = {
        updatePosition(progress) {
          if (!isAudioPlaying || !audioCtx) return;
          // Peak near Archibald (0.28) and Central Tattooing Session (0.68)
          const distArch = Math.abs(progress - 0.28);
          const distSess = Math.abs(progress - 0.68);
          const proximity = Math.max(0, 1 - Math.min(distArch, distSess) * 5.0);
          const targetVol = proximity * 0.085;
          coilGain.gain.setTargetAtTime(targetVol, audioCtx.currentTime, 0.1);
        }
      };
    }

    if (isAudioPlaying) {
      // Fade out
      masterGain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 1);
      toggleBtn.innerHTML = '🔇';
      toggleBtn.title = 'Enter the Silence';
      isAudioPlaying = false;
    } else {
      // Fade in
      audioCtx.resume();
      masterGain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 1.5);
      toggleBtn.innerHTML = '🔊';
      toggleBtn.title = 'Mute Cathedral Ambience';
      isAudioPlaying = true;
    }
  });
}

// 3. INK GRIMOIRE TABS & FLASH VIEWER
function initGrimoireTabs() {
  const flashData = {
    'memento-mori': {
      title: 'Memento Mori — The Obsidian Raven',
      desc: 'Etched in 1888 style copperplate lineation. Features the sentinel raven perched upon a weathered cranial relic draped in acanthus filigree.',
      placement: 'Forearm, Clavicle, or Shoulder Blade',
      time: '4–6 Hours in Bone Parlour',
      needle: '03 Bugpin Fine-Line Lining & Charcoal Shading'
    },
    'sacred-heart': {
      title: 'Sacred Heart — Thorns & Brambles',
      desc: 'An anatomical myocardial heart entwined in gothic black briars and weeping thorny petals. A testament to mortality and divine endurance.',
      placement: 'Center Sternum or Upper Ribcage',
      time: '5–7 Hours in Bone Parlour',
      needle: 'Single Needle Copperplate Etching'
    },
    'tempus-fugit': {
      title: 'Tempus Fugit — The Osseous Hourglass',
      desc: 'Carved with femur pillars and skull finials. The sands of mortality slip through blown cathedral glass for eternity.',
      placement: 'Outer Calf or Lateral Triceps',
      time: '4–5 Hours in Bone Parlour',
      needle: 'Geometric Stippling & Crosshatch Whip'
    },
    'dark-heraldry': {
      title: 'Imperial Anchor — Sea of Ash',
      desc: 'Victorian nautical heraldry entwined with mourning garden roses and hand-lettered banner inscriptions in copperplate script.',
      placement: 'Bicep, Upper Chest or Thigh',
      time: '3–5 Hours in Bone Parlour',
      needle: 'Traditional Bold Blackwork & Fine Engraving'
    }
  };

  const tabs = document.querySelectorAll('.tab-btn');
  const titleEl = document.getElementById('flash-title');
  const descEl = document.getElementById('flash-desc');
  const placeEl = document.getElementById('flash-placement');
  const timeEl = document.getElementById('flash-time');
  const needleEl = document.getElementById('flash-needle');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const key = tab.getAttribute('data-tab');
      const data = flashData[key];
      if (!data) return;

      titleEl.innerText = data.title;
      descEl.innerText = data.desc;
      placeEl.innerText = data.placement;
      timeEl.innerText = data.time;
      needleEl.innerText = data.needle;
    });
  });
}

// 4. BOOKING SCRIPTORIUM (MODAL)
function initBookingModal() {
  const modal = document.getElementById('booking-modal');
  const openButtons = document.querySelectorAll('.open-scriptorium-btn');
  const closeButton = document.getElementById('modal-close');
  const artistSelect = document.getElementById('artist-select');
  const form = document.getElementById('scriptorium-form');
  const confirmationArea = document.getElementById('scriptorium-confirmation');

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const preselectedArtist = btn.getAttribute('data-artist');
      if (preselectedArtist && artistSelect) {
        artistSelect.value = preselectedArtist;
      }
      modal.classList.add('active');
    });
  });

  if (closeButton) {
    closeButton.addEventListener('click', () => modal.classList.remove('active'));
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const patronName = document.getElementById('patron-name').value;
      const artist = artistSelect.options[artistSelect.selectedIndex].text;
      const date = document.getElementById('session-date').value;

      form.style.display = 'none';
      confirmationArea.innerHTML = `
        <div style="text-align: center; padding: 20px 0;">
          <div style="font-size: 48px; color: #fbbf24; margin-bottom: 15px;">📜</div>
          <h3 style="font-family: 'Cinzel Decorative', serif; font-size: 24px; color: #f3d790; margin-bottom: 12px;">The Inscription Pact is Sealed</h3>
          <p style="font-size: 16px; color: #d4d4d8; line-height: 1.6; margin-bottom: 20px;">
            Honored Patron <b>${patronName}</b>,<br>
            Your session with <b>${artist}</b> has been recorded in the studio parchment for <b>${date || 'the upcoming solstice'}</b>.
          </p>
          <div style="background: rgba(80, 15, 25, 0.4); border: 1px solid #c5a059; padding: 15px; border-radius: 6px; font-size: 13px; color: #e4d8c8;">
            A wax-sealed parchment confirmation will arrive by raven dispatch shortly. Ensure your bone canvas is rested and hydrated.
          </div>
          <button id="modal-done-btn" class="nav-cta" style="margin-top: 25px;">Return to Parlour</button>
        </div>
      `;
      confirmationArea.style.display = 'block';

      document.getElementById('modal-done-btn').addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => {
          form.reset();
          form.style.display = 'flex';
          confirmationArea.style.display = 'none';
        }, 400);
      });
    });
  }
}

// 5. SCROLL PARALLAX & REVEAL
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.victorian-section, .artist-card, .experience-frame');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    observer.observe(el);
  });

  // Parallax on hero background
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroBg = document.querySelector('.hero-parlour-backdrop');
    if (heroBg && scrollY < window.innerHeight) {
      heroBg.style.transform = `scale(1.05) translateY(${scrollY * 0.35}px)`;
    }
  });
}
