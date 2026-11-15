/**
 * Main Game Host, Pointer/Keyboard Dispatcher, Memory Shard Archive,
 * VantaLumen 7-Question Illustrated Quiz Deck & NASA Space Apps Dossier.
 */

class EchoesApp {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: false, desynchronized: true }) || this.canvas.getContext('2d');

    this.gameClasses = [
      window.UnderTheDustGame,
      window.StillThereGame,
      window.OneWheelLeftGame,
      window.UnsentGame,
      window.MoonStillRingsGame,
      window.EternalFootprintGame,
      window.RiseZeroGGame,
      window.SpiritRescueGame
    ];

    this.currentIndex = 0;
    this.currentGame = null;
    this.paused = false;
    this.currentDeckQuizIndex = 0;

    // Load unlocked shards & solved quizzes from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('echoes_unlocked_shards') || '[]');
      this.unlockedShards = new Set(saved);
    } catch {
      this.unlockedShards = new Set();
    }

    try {
      const solved = JSON.parse(localStorage.getItem('vantalumen_solved_quizzes') || '[]');
      this.solvedQuizzes = new Set(solved);
    } catch {
      this.solvedQuizzes = new Set();
    }

    this.lastPointer = { x: 0, y: 0, t: performance.now() };
    this.lastFrameTime = performance.now();

    this._setupCanvas();
    this._setupInput();
    this._setupUI();
    this.mountGame(0);
    this._runPreloader();

    requestAnimationFrame(t => this._loop(t));
  }

  _runPreloader() {
    const loader = document.getElementById('vantalumen-loader');
    const ring = document.querySelector('.loader-ring-orbit');
    if (!loader || !ring) return;

    const circumference = 2 * Math.PI * 102; // r=102 -> ~640.88
    ring.style.strokeDasharray = String(circumference);
    ring.style.strokeDashoffset = String(circumference);

    // Preload VantaLumen quiz artwork & logo in background
    const urls = ['assets/vantalumen_logo.png', ...(window.VANTALUMEN_QUIZZES || []).map(q => q.image)];
    let loaded = 0;
    const total = urls.length;

    const updateProgress = pct => {
      ring.style.strokeDashoffset = String(circumference * (1 - pct));
    };

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearInterval(ramp);
      updateProgress(1);
      setTimeout(() => {
        loader.classList.add('loaded');
        setTimeout(() => loader.remove(), 800);
      }, 320);
    };

    let minDelayDone = false;
    let assetsDone = false;

    setTimeout(() => {
      minDelayDone = true;
      if (assetsDone) finish();
    }, 1350);

    // Smooth visual ramp while assets resolve
    let visualPct = 0.15;
    updateProgress(visualPct);
    const ramp = setInterval(() => {
      visualPct = Math.min(0.92, visualPct + 0.08);
      updateProgress(Math.max(visualPct, loaded / total));
      if (assetsDone && minDelayDone) clearInterval(ramp);
    }, 110);

    Promise.all(
      urls.map(
        src =>
          new Promise(res => {
            const img = new Image();
            img.onload = img.onerror = () => {
              loaded++;
              updateProgress(Math.max(visualPct, loaded / total));
              res();
            };
            img.src = src;
          })
      )
    ).then(() => {
      assetsDone = true;
      if (minDelayDone) finish();
    });

    // Safety fallback so preloader never hangs
    setTimeout(() => {
      finish();
    }, 3500);
  }

  _setupCanvas() {
    const resize = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      this.viewW = window.innerWidth;
      this.viewH = window.innerHeight;
      this.canvas.width = Math.floor(this.viewW * dpr);
      this.canvas.height = Math.floor(this.viewH * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (this.currentGame && this.currentGame.onResize) {
        this.currentGame.onResize();
      }
    };
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', () => setTimeout(resize, 120));
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', resize);
    }
    resize();
  }

  _setupInput() {
    // Attempt immediate Web Audio init (works when browser permits autoplay)
    // and attach global capture unlockers across every user-activation event.
    window.soundEngine.onStateChange = () => this._syncAudioButton();
    try { window.soundEngine.init(); } catch {}

    const unlockAudio = () => {
      if (window.soundEngine.needsGesture()) {
        try { window.soundEngine.unlock(); } catch {}
      }
    };
    ['pointerdown', 'mousedown', 'mouseup', 'pointerup', 'touchstart', 'touchend', 'keydown', 'keyup', 'click', 'auxclick'].forEach(evt => {
      window.addEventListener(evt, unlockAudio, { capture: true, passive: true });
    });
    window.addEventListener('focus', unlockAudio, { passive: true });

    // Global subtle jelly bounce + soft glow on any button, nav dot, or quiz option tap
    document.addEventListener('pointerdown', e => {
      const target = e.target && e.target.closest
        ? e.target.closest('button, .btn, .quiz-opt-btn, .quiz-option, .hud-icon-btn, .nav-arrow-btn, .nav-star, .mascot-circle-btn, .gallery-card, .visual-tab-btn, #brand-emblem')
        : null;
      if (!target) return;
      target.classList.remove('vanta-jelly-hit');
      void target.offsetWidth;
      target.classList.add('vanta-jelly-hit');
      clearTimeout(target._jellyTimer);
      target._jellyTimer = setTimeout(() => target.classList.remove('vanta-jelly-hit'), 440);
    }, { capture: true, passive: true });

    const getXY = e => ({
      x: Number.isFinite(e.clientX) ? e.clientX : (this.lastPointer ? this.lastPointer.x : window.innerWidth * 0.5),
      y: Number.isFinite(e.clientY) ? e.clientY : (this.lastPointer ? this.lastPointer.y : window.innerHeight * 0.5)
    });
    this.activePointerId = null;

    this.canvas.addEventListener('pointerdown', e => {
      window.soundEngine.unlock();
      this.idleTime = 0;
      this._dismissIntroWhisper();
      if (this.paused || !this.currentGame) return;
      this.activePointerId = e.pointerId;
      try {
        this.canvas.setPointerCapture(e.pointerId);
      } catch {}
      const { x, y } = getXY(e);
      this.lastPointer = { x, y, t: performance.now() };
      this.currentGame.onPointerDown(x, y);
    });

    this.canvas.addEventListener('pointermove', e => {
      if (window.soundEngine.needsGesture()) {
        try { window.soundEngine.unlock(); } catch {}
      }
      if (this.paused || !this.currentGame) return;
      if (this.activePointerId !== null && e.pointerType === 'touch' && e.pointerId !== this.activePointerId) {
        return;
      }
      const { x, y } = getXY(e);
      const now = performance.now();
      const dt = Math.max(4, now - this.lastPointer.t);
      const vx = (x - this.lastPointer.x) / dt;
      const vy = (y - this.lastPointer.y) / dt;
      if (Math.hypot(vx, vy) > 0.05) this.idleTime = 0;
      this.lastPointer = { x, y, t: now };
      this.currentGame.onPointerMove(x, y, vx, vy);
    });

    const endPointer = e => {
      if (this.activePointerId !== null && e.pointerType === 'touch' && e.pointerId !== this.activePointerId) {
        return;
      }
      this.activePointerId = null;
      if (this.paused || !this.currentGame) return;
      const { x, y } = getXY(e);
      this.currentGame.onPointerUp(x, y);
    };

    this.canvas.addEventListener('pointerup', endPointer);
    this.canvas.addEventListener('pointercancel', endPointer);

    // Keyboard Support: Active game keys (Arrow/WASD for Rover), Spacebar for Hold, ArrowLeft/Right & 1-6 for stages, H/Q/I/J/M/Esc
    window.addEventListener('keydown', e => {
      this.idleTime = 0;
      window.soundEngine.unlock();

      if (!this.paused && this.currentGame && typeof this.currentGame.onKeyDown === 'function') {
        if (this.currentGame.onKeyDown(e)) {
          e.preventDefault();
          this._dismissIntroWhisper();
          return;
        }
      }

      if (e.code === 'Space' && !e.repeat && !this.paused && this.currentGame) {
        e.preventDefault();
        this._dismissIntroWhisper();
        this.currentGame.onPointerDown(window.innerWidth * 0.5, window.innerHeight * 0.5);
      } else if (e.key === 'ArrowRight' && !this.paused) {
        this._dismissIntroWhisper();
        this.mountGame(this.currentIndex >= this.coreGameCount ? 0 : (this.currentIndex + 1) % this.coreGameCount);
      } else if (e.key === 'ArrowLeft' && !this.paused) {
        this._dismissIntroWhisper();
        this.mountGame(this.currentIndex >= this.coreGameCount ? this.coreGameCount - 1 : (this.currentIndex - 1 + this.coreGameCount) % this.coreGameCount);
      } else if (e.key >= '1' && e.key <= '8') {
        this._dismissIntroWhisper();
        this.hideModals();
        this.mountGame(Number(e.key) - 1);
      } else if (e.key === '9' || e.key === 'r' || e.key === 'R') {
        this._dismissIntroWhisper();
        this.hideModals();
        const riseIdx = this.gameClasses.indexOf(window.RiseZeroGGame);
        this.mountGame(riseIdx >= 0 ? riseIdx : 8);
      } else if (e.key === '0' || e.key === 's' || e.key === 'S') {
        this._dismissIntroWhisper();
        this.hideModals();
        const spiritIdx = this.gameClasses.indexOf(window.SpiritRescueGame);
        this.mountGame(spiritIdx >= 0 ? spiritIdx : 9);
      } else if (e.key === 'i' || e.key === 'I') {
        if (this.memoryModal.classList.contains('visible')) {
          this.hideModals();
        } else {
          this.showMemoryShard(this.currentIndex);
        }
      } else if (e.key === 'q' || e.key === 'Q') {
        if (this.quizDeckModal.classList.contains('visible')) {
          this.hideModals();
        } else {
          this.openQuizDeck(this.currentIndex);
        }
      } else if (e.key === 'h' || e.key === 'H') {
        if (this.guideModal.classList.contains('visible')) {
          this.hideModals();
        } else {
          this.openGuide(this.currentIndex);
        }
      } else if (e.key === 'l' || e.key === 'L') {
        this.toggleLanguage();
      } else if (e.key === 'j' || e.key === 'J') {
        if (this.dossierModal.classList.contains('visible')) {
          this.hideModals();
        } else {
          this.openDossier();
        }
      } else if (e.key === 'm' || e.key === 'M') {
        window.soundEngine.toggleMute();
        this._syncAudioButton();
      } else if (e.key === 'Escape') {
        this.hideModals();
      }
    });

    window.addEventListener('keyup', e => {
      if (!this.paused && this.currentGame && typeof this.currentGame.onKeyUp === 'function') {
        if (this.currentGame.onKeyUp(e)) {
          e.preventDefault();
        }
      }
      if (e.code === 'Space' && !this.paused && this.currentGame) {
        e.preventDefault();
        this.currentGame.onPointerUp(window.innerWidth * 0.5, window.innerHeight * 0.5);
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        window.soundEngine.setBrushWind(0);
      } else {
        this.lastFrameTime = performance.now();
      }
    });
  }

  _setupUI() {
    this.navContainer = document.getElementById('constellation-nav');
    this.memoryModal = document.getElementById('memory-modal');
    this.galleryModal = document.getElementById('gallery-modal');
    this.dossierModal = document.getElementById('dossier-modal');
    this.quizDeckModal = document.getElementById('quiz-deck-modal');
    this.guideModal = document.getElementById('guide-modal');
    this.lightboxModal = document.getElementById('img-lightbox');

    // Build 8 core constellation dots + Prev/Next touch buttons (Rise & Spirit live in bottom-left circular buttons)
    this.coreGameCount = 8;
    this.navStars = [];
    const navCodes = [
      '01 · InSight',
      '02 · Apollo LRRR',
      '03 · Spirit Rover',
      '04 · Opportunity',
      '05 · Apollo 12',
      '06 · Tranquility',
      '07 · Rise ★',
      '08 · Spirit Rescue ★'
    ];

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'nav-arrow-btn';
    prevBtn.setAttribute('aria-label', 'Trạm trước');
    prevBtn.title = 'Trạm trước (←)';
    prevBtn.textContent = '‹';
    prevBtn.addEventListener('click', () => {
      prevBtn.blur();
      window.soundEngine.unlock();
      this._dismissIntroWhisper();
      this.hideModals();
      const target = this.currentIndex >= this.coreGameCount
        ? this.coreGameCount - 1
        : (this.currentIndex - 1 + this.coreGameCount) % this.coreGameCount;
      this.mountGame(target);
    });
    this.navContainer.appendChild(prevBtn);

    window.MEMORY_SHARDS.slice(0, this.coreGameCount).forEach((shard, idx) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'nav-star' + (idx === this.coreGameCount - 1 ? ' last-star' : '');
      dot.setAttribute('aria-label', shard.title);
      const tip = document.createElement('span');
      tip.className = 'nav-star-tip';
      tip.textContent = navCodes[idx] || shard.title;
      dot.appendChild(tip);
      dot.addEventListener('click', () => {
        dot.blur();
        window.soundEngine.unlock();
        this._dismissIntroWhisper();
        this.hideModals();
        this.mountGame(idx);
      });
      this.navContainer.appendChild(dot);
      this.navStars.push(dot);
    });

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'nav-arrow-btn';
    nextBtn.setAttribute('aria-label', 'Trạm tiếp theo');
    nextBtn.title = 'Trạm tiếp theo (→)';
    nextBtn.textContent = '›';
    nextBtn.addEventListener('click', () => {
      nextBtn.blur();
      window.soundEngine.unlock();
      this._dismissIntroWhisper();
      this.hideModals();
      const target = this.currentIndex >= this.coreGameCount
        ? 0
        : (this.currentIndex + 1) % this.coreGameCount;
      this.mountGame(target);
    });
    this.navContainer.appendChild(nextBtn);

    // VANTALUMEN Emblem -> Open Mission Dossier
    document.getElementById('brand-emblem').addEventListener('click', () => {
      window.soundEngine.unlock();
      this.openDossier();
    });

    // Two Circular Mascot Launchers (Bottom-Left: Rise & Spirit)
    const btnRise = document.getElementById('btn-rise-mascot');
    if (btnRise) {
      btnRise.addEventListener('click', e => {
        e.currentTarget.blur();
        window.soundEngine.unlock();
        this._dismissIntroWhisper();
        this.hideModals();
        const riseIdx = this.gameClasses.indexOf(window.RiseZeroGGame);
        this.mountGame(riseIdx >= 0 ? riseIdx : 8);
      });
    }

    const btnSpirit = document.getElementById('btn-spirit-mascot');
    if (btnSpirit) {
      btnSpirit.addEventListener('click', e => {
        e.currentTarget.blur();
        window.soundEngine.unlock();
        this._dismissIntroWhisper();
        this.hideModals();
        const spiritIdx = this.gameClasses.indexOf(window.SpiritRescueGame);
        this.mountGame(spiritIdx >= 0 ? spiritIdx : 9);
      });
    }

    // Top-Right Guide Button (6 Separate Guides)
    document.getElementById('btn-guide').addEventListener('click', e => {
      e.currentTarget.blur();
      window.soundEngine.unlock();
      this.openGuide(this.currentIndex);
    });

    // Top-Right Quiz Deck Button
    document.getElementById('btn-quiz-deck').addEventListener('click', e => {
      e.currentTarget.blur();
      window.soundEngine.unlock();
      this.openQuizDeck(this.currentIndex);
    });

    // Instant Shard Inspection Button
    document.getElementById('btn-instant-shard').addEventListener('click', e => {
      e.currentTarget.blur();
      window.soundEngine.unlock();
      this.showMemoryShard(this.currentIndex);
    });

    // Language Switcher (Globe Button: VI <-> EN)
    const btnLang = document.getElementById('btn-lang');
    if (btnLang) {
      btnLang.addEventListener('click', () => {
        btnLang.blur();
        window.soundEngine.unlock();
        window.soundEngine.playUITick();
        this.toggleLanguage();
      });
    }
    if (window.VantaI18n) window.VantaI18n.applyDOM();

    // Sound Mute Toggle (if audio was awaiting browser gesture, first click wakes audio cleanly)
    const btnAudio = document.getElementById('btn-audio');
    let audioWasLockedOnPress = false;
    btnAudio.addEventListener('pointerdown', () => {
      audioWasLockedOnPress = window.soundEngine.needsGesture();
    }, { capture: true });
    btnAudio.addEventListener('click', () => {
      btnAudio.blur();
      if (audioWasLockedOnPress || window.soundEngine.needsGesture()) {
        audioWasLockedOnPress = false;
        window.soundEngine.muted = false;
        window.soundEngine.unlock();
        if (window.soundEngine.masterGain && window.soundEngine.ctx) {
          window.soundEngine.masterGain.gain.setTargetAtTime(0.94, window.soundEngine.ctx.currentTime, 0.04);
        }
        window.soundEngine.playUIChime(5);
        this._syncAudioButton();
        return;
      }
      const muted = window.soundEngine.toggleMute();
      this._syncAudioButton();
      if (!muted) window.soundEngine.playUITick();
    });

    // Open Memory Shards Archive Gallery
    document.getElementById('btn-gallery').addEventListener('click', e => {
      e.currentTarget.blur();
      window.soundEngine.unlock();
      this.openGallery();
    });

    // Open Quiz Deck & Guide from Gallery or Dossier
    document.getElementById('btn-open-quiz-from-gallery').addEventListener('click', () => {
      this.galleryModal.classList.remove('visible');
      this.openQuizDeck(0);
    });
    document.getElementById('btn-open-quiz-from-dossier').addEventListener('click', () => {
      this.dossierModal.classList.remove('visible');
      this.openQuizDeck(0);
    });
    document.getElementById('btn-open-guide-from-dossier').addEventListener('click', () => {
      this.dossierModal.classList.remove('visible');
      this.openGuide(this.currentIndex);
    });

    // Open Dossier from inside Gallery
    document.getElementById('btn-open-dossier-from-gallery').addEventListener('click', () => {
      this.galleryModal.classList.remove('visible');
      this.openDossier();
    });

    // Close Modals
    const closeShardBtn = document.getElementById('btn-close-shard');
    if (closeShardBtn) closeShardBtn.addEventListener('click', () => this.hideModals());
    document.getElementById('btn-close-gallery').addEventListener('click', () => this.hideModals());
    document.getElementById('btn-close-dossier').addEventListener('click', () => this.hideModals());
    document.getElementById('btn-close-quiz-deck').addEventListener('click', () => this.hideModals());
    document.getElementById('btn-close-guide').addEventListener('click', () => this.hideModals());
    const closeCertBtn = document.getElementById('btn-close-cert-modal');
    if (closeCertBtn) closeCertBtn.addEventListener('click', () => this.hideModals());
    const dlCertBtn = document.getElementById('btn-download-cert-modal');
    if (dlCertBtn) dlCertBtn.addEventListener('click', () => this.exportCertificatePNG());
    const certGalBtn = document.getElementById('btn-cert-open-gallery');
    if (certGalBtn) certGalBtn.addEventListener('click', () => { this.hideModals(); this.openGallery(); });
    const certShardBtn = document.getElementById('btn-cert-view-shard');
    if (certShardBtn) certShardBtn.addEventListener('click', () => { this.hideModals(); this.showMemoryShard(this.currentIndex); });

    // Tap on dark backdrop outside modal card to close cleanly on tablets & phones
    [this.memoryModal, this.galleryModal, this.dossierModal, this.quizDeckModal, this.guideModal, document.getElementById('certificate-modal')].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', e => {
          if (e.target === modal) this.hideModals();
        });
      }
    });

    // Fullscreen Image Lightbox for NASA Archive Photos & Rise Infographic
    const nasaImgEl = document.getElementById('shard-nasa-img');
    if (nasaImgEl) {
      nasaImgEl.addEventListener('click', () => {
        const cap = document.getElementById('shard-nasa-title')?.textContent || '';
        if (nasaImgEl.src) this.openLightbox(nasaImgEl.src, cap);
      });
    }
    const deckImgEl = document.getElementById('deck-img');
    if (deckImgEl) {
      deckImgEl.addEventListener('click', () => {
        const cap = document.getElementById('deck-question-vi')?.textContent || '';
        if (deckImgEl.src) this.openLightbox(deckImgEl.src, cap);
      });
    }
    if (this.lightboxModal) {
      this.lightboxModal.addEventListener('click', () => this.closeLightbox());
    }
    const closeLbBtn = document.getElementById('btn-close-lightbox');
    if (closeLbBtn) {
      closeLbBtn.addEventListener('click', e => {
        e.stopPropagation();
        this.closeLightbox();
      });
    }

    // Quiz Deck Prev / Next Navigation
    document.getElementById('btn-prev-quiz').addEventListener('click', () => {
      window.soundEngine.playUITick();
      const len = window.VANTALUMEN_QUIZZES.length;
      this.renderQuizDeckSlide((this.currentDeckQuizIndex - 1 + len) % len);
    });
    document.getElementById('btn-next-quiz').addEventListener('click', () => {
      window.soundEngine.playUITick();
      const len = window.VANTALUMEN_QUIZZES.length;
      this.renderQuizDeckSlide((this.currentDeckQuizIndex + 1) % len);
    });

    // Judge Mode: Unlock all 6 Memory Shards immediately
    document.getElementById('btn-unlock-all').addEventListener('click', () => {
      window.MEMORY_SHARDS.forEach(s => this.unlockedShards.add(s.id));
      try {
        localStorage.setItem('echoes_unlocked_shards', JSON.stringify([...this.unlockedShards]));
      } catch {}
      this._refreshNavDots();
      window.soundEngine.playSignatureMotif(2);
      this.dossierModal.classList.remove('visible');
      this.openGallery();
    });

    // Export Vantalumen Memory Shard as a PNG Souvenir Card
    document.getElementById('btn-export-card').addEventListener('click', () => {
      this.exportShardCardPNG(this.currentIndex);
    });

    // Export Vantalumen NASA Space Apps Mission Certificate PNG
    const certGalleryBtn = document.getElementById('btn-export-certificate');
    if (certGalleryBtn) {
      certGalleryBtn.addEventListener('click', () => this.exportCertificatePNG());
    }
    const certDossierBtn = document.getElementById('btn-export-cert-dossier');
    if (certDossierBtn) {
      certDossierBtn.addEventListener('click', () => this.exportCertificatePNG());
    }

    // Replay current game from Shard Modal
    document.getElementById('btn-replay').addEventListener('click', () => {
      this.hideModals();
      this.mountGame(this.currentIndex);
    });

    // Continue to next game in the anthology
    document.getElementById('btn-next').addEventListener('click', () => {
      this.hideModals();
      const nextIdx = (this.currentIndex + 1) % this.gameClasses.length;
      this.mountGame(nextIdx);
    });

    const introWhisper = document.getElementById('intro-whisper');
    if (introWhisper) {
      introWhisper.addEventListener('click', () => {
        window.soundEngine.unlock();
        window.soundEngine.playUIChime(4);
        this._dismissIntroWhisper();
      });
    }

    this._refreshNavDots();
    this._syncAudioButton();
  }

  toggleLanguage() {
    if (!window.VantaI18n) return;
    window.VantaI18n.toggle();
    this._syncAudioButton();
    if (this.memoryModal.classList.contains('visible')) {
      this.showMemoryShard(this.currentIndex);
    } else if (this.galleryModal.classList.contains('visible')) {
      this.openGallery();
    } else if (this.guideModal.classList.contains('visible')) {
      this.renderGuide(this.currentIndex);
    } else if (this.quizDeckModal.classList.contains('visible')) {
      this.renderQuizDeckSlide(this.currentDeckQuizIndex);
    }
  }

  _syncAudioButton() {
    const btnAudio = document.getElementById('btn-audio');
    if (!btnAudio) return;
    const en = window.VantaI18n && window.VantaI18n.isEn();
    const muted = window.soundEngine.muted;
    const awaiting = !muted && window.soundEngine.needsGesture();
    btnAudio.classList.toggle('audio-awaiting', awaiting);
    btnAudio.style.opacity = muted ? '0.45' : '1';
    if (muted) {
      btnAudio.setAttribute('data-tooltip', en ? 'Sound Muted (M)' : 'Âm Thanh Đang Tắt (M)');
    } else if (awaiting) {
      btnAudio.setAttribute('data-tooltip', en ? 'Tap to Enable Sound' : 'Chạm để Bật Âm Thanh (Trình duyệt chặn tự phát)');
    } else {
      btnAudio.setAttribute('data-tooltip', en ? 'Sound (M)' : 'Âm Thanh (M)');
    }
  }

  _dismissIntroWhisper() {
    if (this._whisperDismissed) return;
    this._whisperDismissed = true;
    const el = document.getElementById('intro-whisper');
    if (el) el.classList.add('dismissed');
  }

  _refreshNavDots() {
    this.navStars.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === this.currentIndex);
      const shardId = window.MEMORY_SHARDS[idx].id;
      dot.classList.toggle('unlocked', this.unlockedShards.has(shardId));
    });
    const btnRise = document.getElementById('btn-rise-mascot');
    if (btnRise) {
      const riseIdx = this.gameClasses.indexOf(window.RiseZeroGGame);
      btnRise.classList.toggle('active', this.currentIndex === riseIdx);
    }
    const btnSpirit = document.getElementById('btn-spirit-mascot');
    if (btnSpirit) {
      const spiritIdx = this.gameClasses.indexOf(window.SpiritRescueGame);
      btnSpirit.classList.toggle('active', this.currentIndex === spiritIdx);
    }
  }

  mountGame(index, animate = true) {
    if (this._completeTimer) {
      clearTimeout(this._completeTimer);
      this._completeTimer = null;
    }
    window.soundEngine.setBrushWind(0);
    const curtain = document.getElementById('cinema-transition');

    const applyMount = () => {
      if (this.currentGame && typeof this.currentGame.destroy === 'function') {
        this.currentGame.destroy();
      }
      this.currentIndex = index;
      const GameClass = this.gameClasses[index];
      this.currentGame = new GameClass(this);
      this.paused = false;
      this.idleTime = 0;
      this._refreshNavDots();
    };

    if (!animate || !curtain || !this.currentGame) {
      applyMount();
      return;
    }

    window.soundEngine.playStageSwitch(index);
    curtain.classList.add('active');
    setTimeout(() => {
      applyMount();
      setTimeout(() => curtain.classList.remove('active'), 80);
    }, 280);
  }

  completeCurrentGame() {
    const shard = window.MEMORY_SHARDS[this.currentIndex];
    const wasAll = this.unlockedShards.size >= window.MEMORY_SHARDS.length;
    this.unlockedShards.add(shard.id);
    try {
      localStorage.setItem('echoes_unlocked_shards', JSON.stringify([...this.unlockedShards]));
    } catch {}
    this._refreshNavDots();
    window.soundEngine.playSuccessBloom();

    if (this._completeTimer) clearTimeout(this._completeTimer);
    const targetIdx = this.currentIndex;
    const nowAll = this.unlockedShards.size >= window.MEMORY_SHARDS.length;
    this._completeTimer = setTimeout(() => {
      this._completeTimer = null;
      if (nowAll && (!wasAll || targetIdx === this.gameClasses.length - 1)) {
        this.showCertificateModal();
      } else {
        this.showMemoryShard(targetIdx);
      }
    }, 650);
  }

  showMemoryShard(index) {
    if (this._completeTimer) {
      clearTimeout(this._completeTimer);
      this._completeTimer = null;
    }
    window.soundEngine.setBrushWind(0);
    window.soundEngine.playModalOpen();
    if (this.currentGame && typeof this.currentGame.getSessionMetric === 'function') {
      this.lastSessionMetric = {
        index,
        value: this.currentGame.getSessionMetric()
      };
    }
    if (this.currentGame && typeof this.currentGame.destroy === 'function') {
      this.currentGame.destroy();
    }
    this.paused = true;
    const rawShard = window.MEMORY_SHARDS[index];
    const shard = window.VantaI18n ? window.VantaI18n.getShard(rawShard) : rawShard;
    const en = window.VantaI18n && window.VantaI18n.isEn();
    document.getElementById('shard-number').textContent = `${en ? 'MEMORY SHARD' : 'MẢNH VỠ KÝ ỨC'} • ${shard.number}`;
    document.getElementById('shard-mission').textContent = shard.mission;
    document.getElementById('shard-visual').innerHTML = shard.svgDiagram;
    document.getElementById('shard-title').textContent = shard.title;
    document.getElementById('shard-subtitle').textContent = shard.subtitle;
    document.getElementById('shard-story').textContent = shard.story;

    // Live Astronomical Ephemeris & Telemetry
    if (window.NASA_TELEMETRY) {
      const eph = window.NASA_TELEMETRY.getLiveMissionTelemetry(shard.id);
      const ephBadge = document.getElementById('shard-eph-badge');
      const ephLine = document.getElementById('shard-eph-line');
      if (ephBadge) ephBadge.textContent = eph.badge;
      if (ephLine) ephLine.textContent = eph.line;
    }

    // Visual mode switcher: Vector Hardware Diagram <-> Real NASA Archive Photo (Live API)
    const tabDiagram = document.getElementById('tab-shard-diagram');
    const tabPhoto = document.getElementById('tab-shard-nasa-photo');
    const visualEl = document.getElementById('shard-visual');
    const photoWrap = document.getElementById('shard-photo-wrap');
    const nasaImg = document.getElementById('shard-nasa-img');
    const nasaBadge = document.getElementById('shard-nasa-badge');
    const nasaTitle = document.getElementById('shard-nasa-title');

    const showDiagram = () => {
      if (tabDiagram) tabDiagram.classList.add('active');
      if (tabPhoto) tabPhoto.classList.remove('active');
      if (visualEl) visualEl.style.display = 'flex';
      if (photoWrap) photoWrap.style.display = 'none';
    };

    const loadAndShowPhoto = async () => {
      if (tabPhoto) tabPhoto.classList.add('active');
      if (tabDiagram) tabDiagram.classList.remove('active');
      if (visualEl) visualEl.style.display = 'none';
      if (photoWrap) photoWrap.style.display = 'block';
      if (window.NASA_TELEMETRY) {
        if (nasaBadge) nasaBadge.textContent = 'NASA API';
        if (nasaTitle) nasaTitle.textContent = 'Đang tải tư liệu NASA...';
        const data = await window.NASA_TELEMETRY.fetchMissionPhoto(shard.id);
        if (nasaImg) nasaImg.src = data.imageUrl;
        if (nasaBadge) nasaBadge.textContent = data.nasaId;
        if (nasaTitle) nasaTitle.textContent = `${data.title} (${data.date}) • ${data.source}`;
      }
    };

    showDiagram();
    if (tabDiagram) {
      tabDiagram.onclick = () => {
        window.soundEngine.playUITick();
        showDiagram();
      };
    }
    if (tabPhoto) {
      tabPhoto.onclick = () => {
        window.soundEngine.playUITick();
        loadAndShowPhoto();
      };
    }
    // Prefetch NASA archive photo silently for instant tab switching
    if (window.NASA_TELEMETRY) {
      window.NASA_TELEMETRY.fetchMissionPhoto(shard.id);
    }

    // Populate Hardware Telemetry & Live Player Metric
    const specsContainer = document.getElementById('shard-specs');
    specsContainer.innerHTML = '';

    const specsToShow = (shard.specs || []).slice(0, 2);
    specsToShow.forEach(sp => {
      const div = document.createElement('div');
      div.className = 'spec-box';
      div.innerHTML = `
        <div class="spec-label">${sp.label}</div>
        <div class="spec-value">${sp.value}</div>
      `;
      specsContainer.appendChild(div);
    });

    const liveMetric =
      this.lastSessionMetric && this.lastSessionMetric.index === index
        ? this.lastSessionMetric.value
        : (shard.specs && shard.specs[2] ? shard.specs[2].value : 'Đã đồng bộ');

    const liveDiv = document.createElement('div');
    liveDiv.className = 'spec-box live-stat';
    liveDiv.innerHTML = `
      <div class="spec-label">${shard.defaultStatLabel || 'Dữ liệu lượt chơi'}</div>
      <div class="spec-value">${liveMetric}</div>
    `;
    specsContainer.appendChild(liveDiv);

    // Populate Embedded VantaLumen Illustrated Question for this Shard
    this._renderEmbeddedShardQuiz(shard.id, index);

    const link = document.getElementById('shard-source-link');
    link.textContent = shard.sourceLabel + ' ↗';
    link.href = shard.sourceUrl;

    const card = this.memoryModal.querySelector('.shard-card');
    if (card) card.scrollTop = 0;
    window.soundEngine.playUIChime(6);
    this.memoryModal.classList.add('visible');
  }

  _renderEmbeddedShardQuiz(shardId, shardIndex) {
    const container = document.getElementById('shard-quiz-box');
    const quiz =
      window.VANTALUMEN_QUIZZES.find(q => q.linkedShardId === shardId) ||
      window.VANTALUMEN_QUIZZES[shardIndex % window.VANTALUMEN_QUIZZES.length];

    if (!quiz) {
      container.style.display = 'none';
      return;
    }
    container.style.display = 'block';

    const en = window.VantaI18n && window.VantaI18n.isEn();
    const isSolved = this.solvedQuizzes.has(quiz.id);
    const totalQ = window.VANTALUMEN_QUIZZES.length;
    const expl = window.VantaI18n ? window.VantaI18n.getQuizExplanation(quiz) : quiz.explanation;
    container.innerHTML = `
      <div class="quiz-header-bar">
        <span class="quiz-tag">${en ? 'KNOWLEDGE CHECK' : 'KIỂM CHỨNG TRI THỨC'} ${isSolved ? (en ? '• ✓ DECODED' : '• ✓ ĐÃ GIẢI MÃ') : ''}</span>
        <button type="button" class="quiz-deck-link" id="btn-expand-quiz-deck">${en ? `All ${totalQ} Questions ↗` : `Bộ ${totalQ} câu hỏi ↗`}</button>
      </div>
      <div class="quiz-card-layout">
        <div>
          <div class="quiz-q-title">${en ? quiz.questionEn : quiz.questionVi}</div>
          <div class="quiz-options-grid" id="shard-quiz-opts"></div>
        </div>
      </div>
      <div class="quiz-feedback ${isSolved ? 'visible' : ''}" id="shard-quiz-feedback">
        ${isSolved ? `<strong>${en ? 'Correct' : 'Chính xác'} (${quiz.correctKey})!</strong> ${expl}` : ''}
      </div>
    `;

    const optsEl = container.querySelector('#shard-quiz-opts');
    const fbEl = container.querySelector('#shard-quiz-feedback');

    quiz.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt-btn';
      if (isSolved && opt.key === quiz.correctKey) {
        btn.classList.add('correct');
      }
      btn.innerHTML = `<span>${en ? opt.label : `${opt.key}) ${opt.vi}`}</span>`;
      btn.addEventListener('click', () => {
        if (opt.key === quiz.correctKey) {
          btn.classList.add('correct');
          this._markQuizSolved(quiz.id);
          window.soundEngine.playSuccessBloom();
          fbEl.innerHTML = `<strong>${en ? 'Correct' : 'Chính xác'} (${quiz.correctKey})!</strong> ${expl}`;
          fbEl.classList.add('visible');
        } else {
          btn.classList.add('wrong');
          window.soundEngine.playPentatonicNote(0, 0.14, 0.4, 0, 'sine');
          fbEl.innerHTML = en
            ? 'Not quite — please try another answer!'
            : 'Chưa chính xác — hãy thử chọn lại đáp án đúng nhé!';
          fbEl.classList.add('visible');
        }
      });
      optsEl.appendChild(btn);
    });

    const openFullDeck = () => {
      const qIdx = window.VANTALUMEN_QUIZZES.findIndex(q => q.id === quiz.id);
      this.memoryModal.classList.remove('visible');
      this.openQuizDeck(qIdx >= 0 ? qIdx : 0);
    };

    const expandBtn = container.querySelector('#btn-expand-quiz-deck');
    if (expandBtn) expandBtn.addEventListener('click', openFullDeck);
    const thumbEl = container.querySelector('#shard-quiz-thumb');
    if (thumbEl) thumbEl.addEventListener('click', openFullDeck);
  }

  _markQuizSolved(quizId) {
    this.solvedQuizzes.add(quizId);
    try {
      localStorage.setItem('vantalumen_solved_quizzes', JSON.stringify([...this.solvedQuizzes]));
    } catch {}
  }

  _getMissionRank() {
    const en = window.VantaI18n && window.VantaI18n.isEn();
    const shards = this.unlockedShards.size;
    const quizzes = this.solvedQuizzes.size;
    const total = shards + quizzes;
    if (shards >= 8 && quizzes >= 8) return en ? 'VantaLumen Memory Keeper ★' : 'Người Giữ Ký Ức VantaLumen ★';
    if (total >= 10) return en ? 'NASA Deep-Space Engineer' : 'Kỹ Sư Viễn Thám NASA';
    if (total >= 5) return en ? 'Stardust Explorer' : 'Nhà Khám Phá Bụi Sao';
    return en ? 'First-Contact Listener' : 'Người Lắng Nghe Khởi Đầu';
  }

  openQuizDeck(startIndex = 0) {
    window.soundEngine.playModalOpen();
    this.paused = true;
    this.memoryModal.classList.remove('visible');
    this.galleryModal.classList.remove('visible');
    this.dossierModal.classList.remove('visible');
    this.guideModal.classList.remove('visible');
    this.renderQuizDeckSlide(startIndex);
    this.quizDeckModal.classList.add('visible');
  }

  renderQuizDeckSlide(index) {
    const en = window.VantaI18n && window.VantaI18n.isEn();
    const quizzes = window.VANTALUMEN_QUIZZES;
    this.currentDeckQuizIndex = ((index % quizzes.length) + quizzes.length) % quizzes.length;
    const quiz = quizzes[this.currentDeckQuizIndex];
    const isSolved = this.solvedQuizzes.has(quiz.id);

    const numStr = String(this.currentDeckQuizIndex + 1).padStart(2, '0');
    const totStr = String(quizzes.length).padStart(2, '0');
    document.getElementById('deck-counter-badge').textContent = en
      ? `VANTALUMEN QUIZ • ${numStr} / ${totStr} • SOLVED: ${this.solvedQuizzes.size}/${quizzes.length}`
      : `CÂU HỎI VANTALUMEN • ${numStr} / ${totStr} • ĐÃ GIẢI: ${this.solvedQuizzes.size}/${quizzes.length}`;
    document.getElementById('deck-img').src = quiz.image;
    document.getElementById('deck-question-en').textContent = en ? quiz.questionEn : quiz.questionVi;
    const subEl = document.getElementById('deck-question-vi');
    subEl.textContent = '';
    subEl.style.display = 'none';

    // Progress dots
    const dotsEl = document.getElementById('deck-dots');
    dotsEl.innerHTML = '';
    quizzes.forEach((q, idx) => {
      const d = document.createElement('button');
      d.className = `deck-dot ${idx === this.currentDeckQuizIndex ? 'active' : ''} ${this.solvedQuizzes.has(q.id) ? 'solved' : ''}`;
      d.addEventListener('click', () => this.renderQuizDeckSlide(idx));
      dotsEl.appendChild(d);
    });

    // Options
    const optsEl = document.getElementById('deck-options');
    const fbEl = document.getElementById('deck-feedback');
    optsEl.innerHTML = '';

    const expl = window.VantaI18n ? window.VantaI18n.getQuizExplanation(quiz) : quiz.explanation;
    if (isSolved) {
      fbEl.innerHTML = `<strong>${en ? 'Correct' : 'Chính xác'} (${quiz.correctKey})!</strong> ${expl}`;
      fbEl.classList.add('visible');
    } else {
      fbEl.innerHTML = '';
      fbEl.classList.remove('visible');
    }

    quiz.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt-btn';
      if (isSolved && opt.key === quiz.correctKey) {
        btn.classList.add('correct');
      }
      btn.innerHTML = `<span>${en ? opt.label : `${opt.key}) ${opt.vi}`}</span>`;
      btn.addEventListener('click', () => {
        if (opt.key === quiz.correctKey) {
          btn.classList.add('correct');
          this._markQuizSolved(quiz.id);
          window.soundEngine.playSuccessBloom();
          fbEl.innerHTML = `<strong>${en ? 'Correct' : 'Chính xác'} (${quiz.correctKey})!</strong> ${expl}`;
          fbEl.classList.add('visible');
          this.renderQuizDeckSlide(this.currentDeckQuizIndex);
        } else {
          btn.classList.add('wrong');
          window.soundEngine.playPentatonicNote(0, 0.14, 0.4, 0, 'sine');
          fbEl.innerHTML = en
            ? 'Not quite — look closely at the card and try again!'
            : 'Chưa chính xác — hãy quan sát bức ảnh VantaLumen và chọn lại nhé!';
          fbEl.classList.add('visible');
        }
      });
      optsEl.appendChild(btn);
    });
  }

  openGallery() {
    this.paused = true;

    const totalShards = window.MEMORY_SHARDS.length;
    const totalQuizzes = (window.VANTALUMEN_QUIZZES || []).length;
    const unlockedCount = this.unlockedShards.size;
    const solvedCount = this.solvedQuizzes.size;

    const scEl = document.getElementById('gal-shards-count');
    const sfEl = document.getElementById('gal-shards-fill');
    const qcEl = document.getElementById('gal-quiz-count');
    const qfEl = document.getElementById('gal-quiz-fill');
    const rkEl = document.getElementById('gal-rank');
    if (scEl) scEl.textContent = `${unlockedCount} / ${totalShards}`;
    if (sfEl) sfEl.style.width = `${Math.round((unlockedCount / Math.max(1, totalShards)) * 100)}%`;
    if (qcEl) qcEl.textContent = `${solvedCount} / ${totalQuizzes}`;
    if (qfEl) qfEl.style.width = `${Math.round((solvedCount / Math.max(1, totalQuizzes)) * 100)}%`;
    if (rkEl) rkEl.textContent = this._getMissionRank();

    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';

    window.MEMORY_SHARDS.forEach((rawShard, idx) => {
      const shard = window.VantaI18n ? window.VantaI18n.getShard(rawShard) : rawShard;
      const en = window.VantaI18n && window.VantaI18n.isEn();
      const isUnlocked = this.unlockedShards.has(shard.id);
      const linkedQuiz = (window.VANTALUMEN_QUIZZES || []).find(q => q.linkedShardId === shard.id);
      const quizSolved = linkedQuiz ? this.solvedQuizzes.has(linkedQuiz.id) : false;

      const item = document.createElement('div');
      item.className = `gallery-item ${isUnlocked ? 'unlocked' : ''}`;
      item.innerHTML = `
        <div class="gallery-item-top">
          <div class="gallery-item-num">${shard.number} ${isUnlocked ? (en ? '• AWAKENED' : '• ĐÃ ĐÁNH THỨC') : (en ? '• LOCKED' : '• CHƯA KHÁM PHÁ')}</div>
          <span class="gallery-quiz-chip ${quizSolved ? 'solved' : ''}">${quizSolved ? (en ? '✓ Decoded' : '✓ Đã giải mã') : (en ? 'Undecoded' : 'Chưa giải mã')}</span>
        </div>
        <div class="gallery-item-preview">${shard.svgDiagram || ''}</div>
        <div class="gallery-item-title">${shard.title}</div>
        <div class="gallery-item-desc">${shard.subtitle}</div>
        <div class="gallery-item-actions">
          <button type="button" class="btn-mini play">${en ? 'Play ▶' : 'Chơi màn ▶'}</button>
          <button type="button" class="btn-mini view">${en ? 'Memory Shard' : 'Thẻ Ký Ức'}</button>
        </div>
      `;

      const openShard = () => {
        this.galleryModal.classList.remove('visible');
        this.currentIndex = idx;
        this._refreshNavDots();
        this.showMemoryShard(idx);
      };

      item.querySelector('.btn-mini.play').addEventListener('click', e => {
        e.stopPropagation();
        this.hideModals();
        this.mountGame(idx);
      });
      item.querySelector('.btn-mini.view').addEventListener('click', e => {
        e.stopPropagation();
        openShard();
      });
      item.addEventListener('click', openShard);
      grid.appendChild(item);
    });

    window.soundEngine.playModalOpen();
    this.galleryModal.classList.add('visible');
  }

  openGuide(index = 0) {
    window.soundEngine.playModalOpen();
    this.paused = true;
    this.memoryModal.classList.remove('visible');
    this.galleryModal.classList.remove('visible');
    this.dossierModal.classList.remove('visible');
    this.quizDeckModal.classList.remove('visible');
    this.renderGuide(index);
    this.guideModal.classList.add('visible');
  }

  renderGuide(index) {
    const guides = window.GAME_GUIDES || [];
    const safeIdx = ((index % guides.length) + guides.length) % guides.length;
    const guide = window.VantaI18n ? window.VantaI18n.getGuide(guides[safeIdx]) : guides[safeIdx];
    if (!guide) return;

    const tabsEl = document.getElementById('guide-tabs');
    tabsEl.innerHTML = '';
    guides.forEach((g, idx) => {
      const btn = document.createElement('button');
      btn.className = `guide-tab-btn ${idx === safeIdx ? 'active' : ''}`;
      const shortName = g.title.split('—')[0].trim();
      btn.textContent = `0${idx + 1}. ${shortName}`;
      btn.addEventListener('click', () => {
        window.soundEngine.playUITick();
        this.renderGuide(idx);
      });
      tabsEl.appendChild(btn);
    });

    const contentEl = document.getElementById('guide-content');
    const controlsHtml = guide.controls
      .map(
        c => `
        <div class="guide-control-card">
          <div class="guide-control-icon">${c.svg}</div>
          <div>
            <div class="guide-control-gesture">${c.gesture}</div>
            <div class="guide-control-action">${c.action}</div>
          </div>
        </div>
      `
      )
      .join('');

    const stepsHtml = guide.steps
      .map(
        (st, i) => `
        <li>
          <span class="guide-step-num">${i + 1}</span>
          <span>${st}</span>
        </li>
      `
      )
      .join('');

    contentEl.innerHTML = `
      <div class="shard-header" style="margin-bottom: 8px;">
        <span class="shard-badge">TRÒ CHƠI ${guide.number}</span>
        <span class="shard-mission">${guide.hardware}</span>
      </div>
      <h3 class="shard-title" style="font-size: 24px;">${guide.title}</h3>
      <div class="guide-goal-box"><strong>Mục tiêu:</strong> ${guide.goal}</div>
      <div class="guide-controls-grid">${controlsHtml}</div>
      <ul class="guide-steps-list">${stepsHtml}</ul>
      <div class="guide-tip-box">💡 <strong>Mẹo VantaLumen:</strong> ${guide.tip}</div>
      <div class="shard-actions">
        <div class="shard-team-tag"><strong>TEAM VANTALUMEN</strong> • KHÔNG CÓ GAME OVER</div>
        <div class="btn-group">
          <button id="btn-guide-prev" class="btn btn-ghost">← Game trước</button>
          <button id="btn-guide-next" class="btn btn-ghost">Game sau →</button>
          <button id="btn-guide-play" class="btn btn-primary">Chơi màn 0${safeIdx + 1} ngay ▶</button>
        </div>
      </div>
    `;

    contentEl.querySelector('#btn-guide-prev').addEventListener('click', () => {
      this.renderGuide((safeIdx - 1 + guides.length) % guides.length);
    });
    contentEl.querySelector('#btn-guide-next').addEventListener('click', () => {
      this.renderGuide((safeIdx + 1) % guides.length);
    });
    contentEl.querySelector('#btn-guide-play').addEventListener('click', () => {
      this.hideModals();
      this.mountGame(safeIdx);
    });
  }

  openDossier() {
    window.soundEngine.playModalOpen();
    this.paused = true;
    this.memoryModal.classList.remove('visible');
    this.galleryModal.classList.remove('visible');
    this.quizDeckModal.classList.remove('visible');
    this.guideModal.classList.remove('visible');
    this.dossierModal.classList.add('visible');
  }

  openLightbox(src, caption = '') {
    if (!this.lightboxModal || !src) return;
    const imgEl = document.getElementById('lightbox-img');
    const capEl = document.getElementById('lightbox-caption');
    if (imgEl) imgEl.src = src;
    if (capEl) capEl.textContent = caption;
    window.soundEngine.playUITick();
    this.lightboxModal.classList.add('visible');
  }

  closeLightbox() {
    if (!this.lightboxModal) return;
    this.lightboxModal.classList.remove('visible');
  }

  hideModals() {
    if (this.lightboxModal && this.lightboxModal.classList.contains('visible')) {
      this.closeLightbox();
      return;
    }
    const certModal = document.getElementById('certificate-modal');
    const anyVisible =
      this.memoryModal.classList.contains('visible') ||
      this.galleryModal.classList.contains('visible') ||
      this.dossierModal.classList.contains('visible') ||
      this.quizDeckModal.classList.contains('visible') ||
      this.guideModal.classList.contains('visible') ||
      (certModal && certModal.classList.contains('visible'));
    if (anyVisible) {
      window.soundEngine.playModalClose();
    }
    this.memoryModal.classList.remove('visible');
    this.galleryModal.classList.remove('visible');
    this.dossierModal.classList.remove('visible');
    this.quizDeckModal.classList.remove('visible');
    this.guideModal.classList.remove('visible');
    if (certModal) certModal.classList.remove('visible');
    this.paused = false;
    if (this.currentGame && !this.currentGame.completed && typeof this.currentGame._startVideoPlayback === 'function') {
      this.currentGame._startVideoPlayback(false);
    }
  }

  _wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) {
    const words = String(text || '').split(/\s+/);
    let line = '';
    let lineCount = 0;
    let curY = y;
    for (let i = 0; i < words.length; i++) {
      const test = line ? `${line} ${words[i]}` : words[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        lineCount++;
        if (lineCount >= maxLines) {
          ctx.fillText(line.trim() + '…', x, curY);
          return curY + lineHeight;
        }
        ctx.fillText(line.trim(), x, curY);
        line = words[i];
        curY += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) {
      ctx.fillText(line.trim(), x, curY);
      curY += lineHeight;
    }
    return curY;
  }

  _drawArchiveGridBackdrop(ctx, w, h) {
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#05070d');
    bg.addColorStop(0.55, '#080c16');
    bg.addColorStop(1, '#0b101e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    if (window.vantaNebulaGL) {
      window.vantaNebulaGL.drawBackdrop(ctx, w, h, {
        alpha: 0.38,
        lumen: 0.72,
        cyan: 0.38,
        stars: 0.58
      });
    }

    if (window.VantaGfx) {
      const grain = window.VantaGfx.getGrainPattern(ctx, 0.035, false);
      if (grain) {
        ctx.fillStyle = grain;
        ctx.fillRect(0, 0, w, h);
      }
    }

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.024)';
    ctx.lineWidth = 1;
    for (let gx = 80; gx < w; gx += 80) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
    for (let gy = 80; gy < h; gy += 80) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    [130, 210, 300].forEach(r => {
      ctx.beginPath();
      ctx.arc(w - 140, 140, r, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.restore();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(40.5, 40.5, w - 81, h - 81);
  }

  _drawMissionSealIcon(ctx, id, cx, cy, unlocked) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = unlocked ? 'rgba(251, 191, 36, 0.75)' : 'rgba(148, 163, 184, 0.28)';
    ctx.fillStyle = unlocked ? 'rgba(251, 191, 36, 0.75)' : 'rgba(148, 163, 184, 0.28)';
    ctx.lineWidth = 1.3;

    if (id === 'under-the-dust') {
      ctx.beginPath();
      for (let i = 0; i <= 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const px = Math.cos(a) * 11;
        const py = Math.sin(a) * 11;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.stroke();
    } else if (id === 'still-there') {
      ctx.beginPath();
      ctx.moveTo(0, -11);
      ctx.lineTo(10, 7);
      ctx.lineTo(-10, 7);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 1, 2.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === 'one-wheel-left') {
      [-8, 0, 8].forEach(wx => {
        ctx.beginPath();
        ctx.arc(wx, 4, 3.2, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(0, -5);
      ctx.lineTo(8, 0);
      ctx.stroke();
    } else if (id === 'unsent') {
      ctx.beginPath();
      ctx.arc(0, 5, 5, Math.PI, 0);
      ctx.stroke();
      [8, 12].forEach(r => {
        ctx.beginPath();
        ctx.arc(0, 4, r, -Math.PI * 0.75, -Math.PI * 0.25);
        ctx.stroke();
      });
    } else if (id === 'moon-still-rings') {
      [4, 8, 12].forEach(r => {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      });
    } else if (id === 'eternal-footprint') {
      ctx.beginPath();
      ctx.roundRect(-5.5, -10, 11, 20, 5);
      ctx.stroke();
      [-5, 0, 5].forEach(ry => {
        ctx.beginPath();
        ctx.moveTo(-3.5, ry);
        ctx.lineTo(3.5, ry);
        ctx.stroke();
      });
    } else if (id === 'rise-zero-g') {
      ctx.beginPath();
      ctx.arc(0, 2, 8.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, -4.5, 8, 3.2, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -4.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === 'spirit-rescue') {
      ctx.beginPath();
      ctx.moveTo(0, -11);
      ctx.lineTo(6, -2);
      ctx.lineTo(6, 8);
      ctx.lineTo(-6, 8);
      ctx.lineTo(-6, -2);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 11, 2.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.rotate(-0.3);
      ctx.beginPath();
      ctx.ellipse(0, 0, 13, 4.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 4.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  async exportShardCardPNG(index) {
    window.soundEngine.playUIChime(7);
    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch {}
    }
    const shard = window.MEMORY_SHARDS[index];
    const w = 1400;
    const h = 820;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');

    this._drawArchiveGridBackdrop(ctx, w, h);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 13px "JetBrains Mono", monospace';
    ctx.fillText(`NASA SPACE APPS ARCHIVE  //  SHARD ${shard.number}  //  ${shard.mission.toUpperCase()}`, 84, 96);

    const parts = shard.title.split('—');
    const enTitle = (parts[0] || shard.title).trim();
    const viTitle = (parts[1] || '').trim();

    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 44px "Space Grotesk", "Be Vietnam Pro", sans-serif';
    ctx.fillText(enTitle, 84, 154);

    if (viTitle) {
      ctx.fillStyle = '#fcd34d';
      ctx.font = '600 22px "Be Vietnam Pro", sans-serif';
      ctx.fillText(viTitle, 84, 190);
    }

    ctx.fillStyle = '#94a3b8';
    ctx.font = '400 17px "Be Vietnam Pro", sans-serif';
    ctx.fillText(shard.subtitle, 84, 222);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(84, 248);
    ctx.lineTo(w - 84, 248);
    ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '400 20px "Be Vietnam Pro", sans-serif';
    this._wrapCanvasText(ctx, shard.story, 84, 294, w - 168, 34, 6);

    const tableY = 520;
    const tableW = w - 168;
    const tableH = 112;
    ctx.fillStyle = 'rgba(10, 15, 28, 0.78)';
    ctx.fillRect(84, tableY, tableW, tableH);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.strokeRect(84.5, tableY + 0.5, tableW - 1, tableH - 1);

    const metric =
      this.lastSessionMetric && this.lastSessionMetric.index === index
        ? this.lastSessionMetric.value
        : (shard.specs && shard.specs[2] ? shard.specs[2].value : 'Đã đồng bộ');

    const cols = [
      { label: shard.specs?.[0]?.label || 'PHẦN CỨNG', val: shard.specs?.[0]?.value || '—', accent: '#f8fafc' },
      { label: shard.specs?.[1]?.label || 'THÔNG SỐ', val: shard.specs?.[1]?.value || '—', accent: '#7dd3fc' },
      { label: shard.defaultStatLabel || 'DỮ LIỆU PHIÊN', val: metric, accent: '#fcd34d' }
    ];

    const colW = tableW / 3;
    cols.forEach((col, i) => {
      const cx = 84 + i * colW;
      if (i > 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.moveTo(cx, tableY + 18);
        ctx.lineTo(cx, tableY + tableH - 18);
        ctx.stroke();
      }
      ctx.fillStyle = '#64748b';
      ctx.font = '500 12px "JetBrains Mono", monospace';
      ctx.fillText(col.label.toUpperCase(), cx + 24, tableY + 40);

      ctx.fillStyle = col.accent;
      ctx.font = '600 20px "Be Vietnam Pro", sans-serif';
      ctx.fillText(col.val, cx + 24, tableY + 76, colW - 48);
    });

    const eph = window.NASA_TELEMETRY ? window.NASA_TELEMETRY.getLiveMissionTelemetry(shard.id) : null;
    if (eph) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '400 14px "JetBrains Mono", monospace';
      ctx.fillText(`${eph.badge}: ${eph.line}`, 84, 676);
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(84, 712);
    ctx.lineTo(w - 84, 712);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '500 13px "JetBrains Mono", monospace';
    ctx.fillText(`VANTALUMEN ARCHIVE  //  SOURCE: ${shard.sourceUrl}`, 84, 748);

    const link = document.createElement('a');
    link.download = `Vantalumen-${shard.id}.png`;
    link.href = c.toDataURL('image/png');
    link.click();
  }

  async _renderCertificateCanvas() {
    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch {}
    }

    const w = 1600;
    const h = 1000;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');

    this._drawArchiveGridBackdrop(ctx, w, h);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 13px "JetBrains Mono", monospace';
    ctx.fillText('NASA SPACE APPS CHALLENGE  //  VANTALUMEN MISSION TELEMETRY DOSSIER', 88, 98);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 48px "Space Grotesk", "Be Vietnam Pro", sans-serif';
    ctx.fillText('ECHOES IN THE DUST', 88, 156);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '400 19px "Be Vietnam Pro", sans-serif';
    ctx.fillText('Hồ sơ Chứng nhận Hoàn thành Tương tác Phần cứng & Lưu trữ Tri thức Vũ trụ NASA', 88, 192);

    ctx.save();
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fcd34d';
    ctx.font = '600 13px "JetBrains Mono", monospace';
    ctx.fillText('DOC-ID // VL-8M-2026', w - 88, 98);
    ctx.fillStyle = '#64748b';
    ctx.font = '400 12px "JetBrains Mono", monospace';
    ctx.fillText('TELEMETRY VERIFIED • JPL / APOLLO / ARTEMIS II', w - 88, 120);
    ctx.restore();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(88, 222);
    ctx.lineTo(w - 88, 222);
    ctx.stroke();

    const unlockedCount = this.unlockedShards.size;
    const totalShards = window.MEMORY_SHARDS.length;
    const solvedCount = this.solvedQuizzes.size;
    const totalQuizzes = (window.VANTALUMEN_QUIZZES || []).length;
    const rank = this._getMissionRank();

    const stripX = 88;
    const stripY = 248;
    const stripW = w - 176;
    const stripH = 122;

    ctx.fillStyle = 'rgba(10, 15, 28, 0.76)';
    ctx.fillRect(stripX, stripY, stripW, stripH);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(stripX + 0.5, stripY + 0.5, stripW - 1, stripH - 1);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(stripX, stripY, 3, stripH);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(760, stripY + 20);
    ctx.lineTo(760, stripY + stripH - 20);
    ctx.moveTo(1140, stripY + 20);
    ctx.lineTo(1140, stripY + stripH - 20);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '500 12px "JetBrains Mono", monospace';
    ctx.fillText('DANH HIỆU SỨ MỆNH', 118, stripY + 38);
    ctx.fillText('MẢNH VỠ KÝ ỨC ĐÃ ĐÁNH THỨC', 792, stripY + 38);
    ctx.fillText('TRI THỨC VŨ TRỤ VANTALUMEN', 1172, stripY + 38);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 28px "Be Vietnam Pro", sans-serif';
    ctx.fillText(rank, 118, stripY + 84);

    ctx.fillStyle = '#fcd34d';
    ctx.font = '600 30px "JetBrains Mono", monospace';
    ctx.fillText(`${String(unlockedCount).padStart(2, '0')} / ${String(totalShards).padStart(2, '0')}`, 792, stripY + 82);

    ctx.fillStyle = '#7dd3fc';
    ctx.fillText(`${String(solvedCount).padStart(2, '0')} / ${String(totalQuizzes).padStart(2, '0')}`, 1172, stripY + 82);

    for (let s = 0; s < totalShards; s++) {
      ctx.fillStyle = s < unlockedCount ? '#f59e0b' : 'rgba(148, 163, 184, 0.16)';
      ctx.fillRect(792 + s * 34, stripY + 98, 28, 4);
    }
    for (let q = 0; q < totalQuizzes; q++) {
      ctx.fillStyle = q < solvedCount ? '#38bdf8' : 'rgba(148, 163, 184, 0.16)';
      ctx.fillRect(1172 + q * 34, stripY + 98, 28, 4);
    }

    ctx.fillStyle = '#64748b';
    ctx.font = '500 12.5px "JetBrains Mono", monospace';
    ctx.fillText('HỒ SƠ 8 SỨ MỆNH NASA, ARTEMIS II & SPACEX RESCUE', 88, 408);

    const gridX = 88;
    const gridY = 426;
    const gapX = 18;
    const gapY = 14;
    const cardW = (stripW - gapX) / 2;
    const cardH = 104;

    const coreShards = window.MEMORY_SHARDS.slice(0, 8);
    coreShards.forEach((shard, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const bx = gridX + col * (cardW + gapX);
      const by = gridY + row * (cardH + gapY);
      const unlocked = this.unlockedShards.has(shard.id);

      ctx.fillStyle = unlocked ? 'rgba(16, 23, 42, 0.86)' : 'rgba(9, 13, 24, 0.72)';
      ctx.fillRect(bx, by, cardW, cardH);

      ctx.strokeStyle = unlocked ? 'rgba(245, 158, 11, 0.48)' : 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx + 0.5, by + 0.5, cardW - 1, cardH - 1);

      if (unlocked) {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(bx, by, cardW, 2);
      }

      ctx.fillStyle = unlocked ? '#fcd34d' : '#475569';
      ctx.beginPath();
      ctx.arc(bx + 18, by + 22, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = unlocked ? '#fcd34d' : '#64748b';
      ctx.font = '500 10.5px "JetBrains Mono", monospace';
      ctx.fillText(`${shard.number}  •  ${unlocked ? 'ĐÃ ĐÁNH THỨC' : 'CHƯA KHÁM PHÁ'}`, bx + 28, by + 26);

      this._drawMissionSealIcon(ctx, shard.id, bx + cardW - 24, by + 24, unlocked);

      const parts = shard.title.split('—');
      const enTitle = (parts[0] || shard.title).trim();
      const viTitle = (parts[1] || '').trim();

      ctx.fillStyle = unlocked ? '#f8fafc' : '#94a3b8';
      ctx.font = '700 17px "Space Grotesk", "Be Vietnam Pro", sans-serif';
      ctx.fillText(enTitle, bx + 18, by + 54);

      ctx.fillStyle = unlocked ? '#eab308' : '#64748b';
      ctx.font = '500 13px "Be Vietnam Pro", sans-serif';
      ctx.fillText(viTitle, bx + 18, by + 74);

      ctx.fillStyle = unlocked ? '#cbd5e1' : '#475569';
      ctx.font = '400 12px "Be Vietnam Pro", sans-serif';
      this._wrapCanvasText(ctx, shard.subtitle, bx + 18, by + 98, cardW - 36, 16, 1);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.beginPath();
      ctx.moveTo(bx + 18, by + 112);
      ctx.lineTo(bx + cardW - 18, by + 112);
      ctx.stroke();

      const keySpec = shard.specs && shard.specs[1] ? shard.specs[1].value : shard.mission;
      ctx.fillStyle = unlocked ? '#7dd3fc' : '#475569';
      ctx.font = '500 11px "JetBrains Mono", monospace';
      ctx.fillText(keySpec, bx + 18, by + 130, cardW - 36);
    });

    const dateStr = new Date().toLocaleDateString('vi-VN');
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(88, 888);
    ctx.lineTo(w - 88, 888);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 13px "JetBrains Mono", monospace';
    ctx.fillText('TEAM VANTALUMEN  •  KEEPING SPACE EXPLORATION STORIES ALIVE', 88, 924);

    ctx.save();
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fcd34d';
    ctx.font = '500 13px "JetBrains Mono", monospace';
    ctx.fillText(`NASA OPEN DATA ARCHIVE  •  ${dateStr}`, w - 88, 924);
    ctx.restore();

    return c;
  }

  async showCertificateModal() {
    if (this._completeTimer) {
      clearTimeout(this._completeTimer);
      this._completeTimer = null;
    }
    window.soundEngine.setBrushWind(0);
    window.soundEngine.playSignatureMotif(4);
    if (this.currentGame && typeof this.currentGame.destroy === 'function') {
      this.currentGame.destroy();
    }
    this.hideModals();
    this.paused = true;

    const modal = document.getElementById('certificate-modal');
    const img = document.getElementById('cert-preview-img');
    if (img) {
      const c = await this._renderCertificateCanvas();
      img.src = c.toDataURL('image/png');
    }
    if (modal) modal.classList.add('visible');
  }

  async exportCertificatePNG() {
    window.soundEngine.playSuccessBloom();
    const c = await this._renderCertificateCanvas();
    const link = document.createElement('a');
    link.download = 'Vantalumen-SpaceApps-Certificate.png';
    link.href = c.toDataURL('image/png');
    link.click();
  }

  _loop(now) {
    if (document.hidden) {
      this.lastFrameTime = now;
      requestAnimationFrame(t => this._loop(t));
      return;
    }
    const dt = Math.min(0.05, (now - this.lastFrameTime) / 1000);
    this.lastFrameTime = now;

    if (!this.paused && this.currentGame) {
      this.idleTime = (this.idleTime || 0) + dt;
      if (this.idleTime > 5.0 && typeof this.currentGame.ghostAlpha === 'number') {
        this.currentGame.ghostAlpha = Math.min(0.75, this.currentGame.ghostAlpha + dt * 0.85);
      }
      this.currentGame.update(dt);
      const w = this.viewW || window.innerWidth;
      const h = this.viewH || window.innerHeight;
      this.currentGame.render(this.ctx, w, h);

      // Subtle cinematic floating cosmic dust motes across all 6 scenes
      if (!this._ambientMotes) {
        this._ambientMotes = Array.from({ length: 24 }, (_, i) => ({
          x: Math.random(),
          y: Math.random(),
          r: 0.9 + (i % 3) * 0.7,
          vx: (Math.random() - 0.5) * 0.012,
          vy: -0.005 - Math.random() * 0.01,
          phase: Math.random() * Math.PI * 2
        }));
      }
      const ctx = this.ctx;
      const tSec = now * 0.001;
      ctx.save();
      for (const m of this._ambientMotes) {
        m.x = (m.x + m.vx * dt + 1) % 1;
        m.y = (m.y + m.vy * dt + 1) % 1;
        const alpha = 0.12 + 0.16 * Math.sin(tSec * 1.4 + m.phase);
        ctx.fillStyle = `rgba(252, 211, 77, ${alpha})`;
        ctx.beginPath();
        ctx.arc(m.x * w, m.y * h, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    requestAnimationFrame(t => this._loop(t));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.echoesApp = new EchoesApp();
});
