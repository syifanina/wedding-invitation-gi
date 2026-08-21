/* ==========================================================================
   WEDDING ELEGANT - CINEMATIC INTERACTIVE SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- Elements ---
  const body = document.body;
  const openingOverlay = document.getElementById('opening-overlay');
  const envelopeWrapper = document.getElementById('envelope-wrapper');
  const openBtn = document.getElementById('open-invitation-btn');
  const waxSeal = document.getElementById('wax-seal');
  const mainInvitation = document.getElementById('main-invitation');
  const musicBtn = document.getElementById('music-toggle-btn');
  const toast = document.getElementById('toast');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  let isInvitationOpened = false;
  let isAudioPlaying = false;


  // ==========================================================================
  function openEnvelope() {
    if (isInvitationOpened) return;
    isInvitationOpened = true;

    // Disable button & seal to prevent double-click
    openBtn.style.pointerEvents = 'none';
    openBtn.style.opacity = '0.7';

    // Trigger 3D Opening state
    envelopeWrapper.classList.add('is-opening');

    // Start background music on user click
    playAudio();

    // Phase 1 (0.3s): Flap lifts + seal pops
    // Phase 2 (0.35s): Letter slides up
    // Phase 3 (1.1s): Cinematic zoom + fade to main content
    setTimeout(() => {
      // Begin full cinematic transition
      openingOverlay.style.transition = 'opacity 1.4s cubic-bezier(0.65, 0, 0.35, 1), transform 1.6s cubic-bezier(0.65, 0, 0.35, 1)';
      openingOverlay.classList.add('opened');
      body.classList.remove('locked');
      mainInvitation.classList.add('visible');
      initScrollReveal();
      initParallax();
    }, 1200);
  }

  // Click / touch handlers
  openBtn.addEventListener('click', openEnvelope);
  if (waxSeal) waxSeal.addEventListener('click', openEnvelope);
  envelopeWrapper.addEventListener('click', () => {
    if (!isInvitationOpened) openEnvelope();
  });

  // ==========================================================================
  // 2. BACKGROUND MUSIC — LOCAL AUDIO FILE (assets/backsound.mp3)
  // ==========================================================================
  const bgMusic = document.getElementById('bg-music');

  function playAudio() {
    if (!bgMusic) return;
    bgMusic.play().then(() => {
      isAudioPlaying = true;
      musicBtn.classList.add('playing');
    }).catch(err => {
      console.log('Autoplay play error:', err);
    });
  }

  function pauseAudio() {
    if (!bgMusic) return;
    bgMusic.pause();
    isAudioPlaying = false;
    musicBtn.classList.remove('playing');
  }

  musicBtn.addEventListener('click', () => {
    isAudioPlaying ? pauseAudio() : playAudio();
  });

  // ==========================================================================
  // 3. FLOATING SAKURA PETALS PARTICLE CANVAS
  // ==========================================================================
  const canvas = document.getElementById('petals-canvas');
  const ctx = canvas.getContext('2d');

  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });

  class Petal {
    constructor(scatter = false) {
      this.scatter = scatter;
      this.init(scatter);
    }

    init(scatter) {
      this.x = Math.random() * W;
      this.y = scatter ? Math.random() * H : (Math.random() * -H * 0.5 - 20);
      this.size = Math.random() * 7 + 5;
      this.speedY = Math.random() * 0.55 + 0.25;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = Math.random() * 0.015 + 0.008;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.025;
      this.opacity = Math.random() * 0.45 + 0.2;
      this.opacitySpeed = (Math.random() - 0.5) * 0.003;
      this.isGold = Math.random() > 0.65;
    }

    update() {
      this.wobble += this.wobbleSpeed;
      this.y += this.speedY;
      this.x += Math.sin(this.wobble) * 0.5 + this.speedX;
      this.rotation += this.rotSpeed;
      this.opacity += this.opacitySpeed;
      if (this.opacity > 0.65) this.opacitySpeed *= -1;
      if (this.opacity < 0.1) this.opacitySpeed *= -1;

      if (this.y > H + 20) this.init(false);
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;

      if (this.isGold) {
        // Golden champagne petal
        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        grd.addColorStop(0, 'rgba(232, 211, 167, 0.9)');
        grd.addColorStop(1, 'rgba(197, 160, 89, 0.2)');
        ctx.fillStyle = grd;
      } else {
        // White ivory petal
        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        grd.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        grd.addColorStop(1, 'rgba(248, 241, 228, 0.2)');
        ctx.fillStyle = grd;
      }

      // Draw petal shape (teardrop)
      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.bezierCurveTo(this.size * 0.6, -this.size * 0.5, this.size * 0.6, this.size * 0.5, 0, this.size * 0.7);
      ctx.bezierCurveTo(-this.size * 0.6, this.size * 0.5, -this.size * 0.6, -this.size * 0.5, 0, -this.size);
      ctx.fill();

      ctx.restore();
    }
  }

  const petalsCount = W < 768 ? 18 : 32;
  const petalsArray = Array.from({ length: petalsCount }, (_, i) => new Petal(i < petalsCount / 2));

  function animatePetals() {
    ctx.clearRect(0, 0, W, H);
    petalsArray.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animatePetals);
  }
  animatePetals();

  // ==========================================================================
  // 4. COUNTDOWN WEDDING TIMER
  // ==========================================================================
  const targetDate = new Date('2026-09-06T12:30:00+07:00').getTime();

  function pad(n) { return String(n).padStart(2, '0'); }

  function updateCountdown() {
    const distance = targetDate - Date.now();
    if (distance <= 0) {
      ['cd-days','cd-hours','cd-minutes','cd-seconds'].forEach(id => document.getElementById(id).innerText = '00');
      return;
    }
    document.getElementById('cd-days').innerText    = pad(Math.floor(distance / 86400000));
    document.getElementById('cd-hours').innerText   = pad(Math.floor((distance % 86400000) / 3600000));
    document.getElementById('cd-minutes').innerText = pad(Math.floor((distance % 3600000) / 60000));
    document.getElementById('cd-seconds').innerText = pad(Math.floor((distance % 60000) / 1000));
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  // ==========================================================================
  // 5. RSVP FORM + GUESTBOOK LOCALSTORAGE
  // ==========================================================================
  const rsvpForm = document.getElementById('rsvp-form');
  const rsvpSuccess = document.getElementById('rsvp-success');
  const wishesWall = document.getElementById('wishes-wall');

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[m]);
  }

  function renderWishCard(name, status, message, prepend = true) {
    const card = document.createElement('div');
    card.className = 'wish-card';
    card.style.animation = 'fadeIn 0.6s ease forwards';
    card.innerHTML = `
      <div class="wish-header">
        <span class="wish-author">${escapeHtml(name)}</span>
        <span class="wish-attendance">${escapeHtml(status)}</span>
      </div>
      <p class="wish-body">${escapeHtml(message)}</p>`;
    wishesWall[prepend && wishesWall.firstChild ? 'insertBefore' : 'appendChild'](card, wishesWall.firstChild || null);
  }

  const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/19yd98eqI6yhhbmPOhAjC_eNm5oJUgaVW8nO1Ho3az_Y/export?format=csv';

  function fetchWishesFromSheets() {
    fetch(SHEET_CSV_URL)
      .then(res => res.text())
      .then(csvText => {
        const rows = parseCSV(csvText);
        // Header: [Timestamp, Nama, Status, Jumlah, Pesan/Ucapan]
        if (rows && rows.length > 1) {
          wishesWall.innerHTML = ''; // Clear default static cards
          const validRows = rows.slice(1).filter(r => r.length >= 4 && r[1]);
          validRows.reverse().forEach(row => {
            const name = row[1] || 'Tamu';
            const status = row[2] || 'Hadir';
            const message = row[4] || row[3] || '';
            if (message) {
              renderWishCard(name, status, message, false);
            }
          });
        } else {
          loadWishes();
        }
      })
      .catch(err => {
        console.log('Sheets fetch fallback:', err);
        loadWishes();
      });
  }

  function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    return lines.map(line => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
  }
  
  // Load wishes from localStorage as a fallback when Google Sheet has no data or fetch fails
  function loadWishes() {
    const stored = localStorage.getItem('wedding_wishes_rs');
    if (!stored) return;
    try {
      const wishes = JSON.parse(stored);
      wishesWall.innerHTML = '';
      wishes.forEach(w => {
        renderWishCard(w.name || 'Tamu', w.status || 'Hadir', w.message || '', false);
      });
    } catch (e) {
      console.error('Failed to load wishes from localStorage', e);
    }
  }

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', e => {
      e.preventDefault();
      const name    = document.getElementById('guest-name').value.trim();
      const status  = document.getElementById('guest-status').value;
      const count   = document.getElementById('guest-count').value;
      const message = document.getElementById('guest-message').value.trim();
      if (!name || !message) return;

      // 1. Submit background POST request to user's Google Form & Google Sheets
      const googleFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdxL7_1hsqwYPBJIwCYrzJkOwYTPw3zR2rhfVxt6wuT5DzaYg/formResponse';
      const formData = new URLSearchParams();
      formData.append('entry.793456669', name);
      formData.append('entry.1197130279', status);
      formData.append('entry.1252461566', count);
      formData.append('entry.130855596', message);

      fetch(googleFormUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      }).then(() => {
        // Refetch sheets after 1.5s delay to show live response
        setTimeout(fetchWishesFromSheets, 1500);
      }).catch(err => console.log('Google Form Submit error:', err));

      // 2. Save locally & render card on Guestbook feed immediately
      const data = { name, status, count, message, timestamp: Date.now() };
      try {
        const list = JSON.parse(localStorage.getItem('wedding_wishes_rs') || '[]');
        list.push(data);
        localStorage.setItem('wedding_wishes_rs', JSON.stringify(list));
      } catch(e) {}

      renderWishCard(name, status, message, true);
      rsvpForm.reset();
      rsvpSuccess.classList.add('show');
      setTimeout(() => rsvpSuccess.classList.remove('show'), 5000);
    });
  }

  // Fetch live wishes from Google Sheets on load!
  fetchWishesFromSheets();

  // ==========================================================================
  // 6. COPY ACCOUNT NUMBER TO CLIPBOARD
  // ==========================================================================
  document.querySelectorAll('.btn-copy-acc').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy');
      if (!text) return;
      const tryFallback = () => {
        const tmp = Object.assign(document.createElement('textarea'), { value: text });
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        document.body.removeChild(tmp);
        showToast('Nomor Rekening Berhasil Disalin! ✓');
      };
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => showToast('Nomor Rekening Berhasil Disalin! ✓')).catch(tryFallback);
      } else tryFallback();
    });
  });

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  // ==========================================================================
  // 7. SAVE THE DATE (.ICS CALENDAR)
  // ==========================================================================
  const saveDateBtn = document.getElementById('save-date-btn');
  if (saveDateBtn) {
    saveDateBtn.addEventListener('click', () => {
      const ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Giovan Fiecky & Indriyani Wedding//EN',
        'BEGIN:VEVENT',
        'SUMMARY:💍 Pernikahan Giovan Fiecky & Indriyani',
        'DESCRIPTION:Undangan Pernikahan di StarRay Hotel Kebayoran\\, Jakarta Selatan.',
        'LOCATION:StarRay Hotel Kebayoran\\, Jl. Ciledug Raya No.35\\, Cipulir\\, Kebayoran Lama\\, Jakarta Selatan',
        'DTSTART:20260906T053000Z', 'DTEND:20260906T080000Z',
        'STATUS:CONFIRMED', 'END:VEVENT', 'END:VCALENDAR'
      ].join('\r\n');

      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8;' }));
      a.setAttribute('download', 'wedding-giovan-fiecky-indriyani-2026.ics');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Event tersimpan ke Kalender! 📅');
    });
  }

  // ==========================================================================
  // 8. LIGHTBOX PHOTO VIEWER
  // ==========================================================================
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-img');
      if (!src || !lightboxModal) return;
      lightboxImg.src = src;
      lightboxModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  [lightboxClose, lightboxModal].forEach(el => {
    if (!el) return;
    el.addEventListener('click', e => {
      if (e.target === el) {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // ESC key to close lightbox
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightboxModal?.classList.contains('active')) {
      lightboxModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // ==========================================================================
  // 9. SCROLL REVEAL ANIMATIONS (IntersectionObserver + stagger delays)
  // ==========================================================================
  function initScrollReveal() {
    const els = document.querySelectorAll('.reveal-on-scroll');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.dataset.delay || 0;
          setTimeout(() => el.classList.add('active'), Number(delay));
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    els.forEach((el, idx) => {
      // Auto-stagger siblings in same parent
      const siblings = el.parentElement ? [...el.parentElement.querySelectorAll('.reveal-on-scroll')] : [];
      if (siblings.length > 1 && !el.dataset.delay) {
        el.dataset.delay = siblings.indexOf(el) * 120;
      }
      obs.observe(el);
    });
  }

  // ==========================================================================
  // 10. PARALLAX EFFECT ON SCROLL (subtle background)
  // ==========================================================================
  function initParallax() {
    const items = [
      { el: document.querySelector('.countdown-section'), speed: 0.08 },
      { el: document.querySelector('.hero-letter-section'), speed: 0.06 },
    ].filter(t => t.el);

    if (!items.length) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const sy = window.scrollY;
        items.forEach(({ el, speed }) => {
          const rect = el.getBoundingClientRect();
          const offset = (rect.top + sy) * speed;
          el.style.backgroundPositionY = `calc(50% + ${offset}px)`;
        });
        ticking = false;
      });
    }, { passive: true });
  }

  initScrollReveal();

});
