/**
 * Main Game Host, Pointer/Keyboard Dispatcher, Memory Shard Archive,
 * VantaLumen 7-Question Illustrated Quiz Deck & NASA Space Apps Dossier.
 */

class EchoesApp {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.gameClasses = [
      window.UnderTheDustGame,
      window.StillThereGame,
      window.OneWheelLeftGame,
      window.UnsentGame,
      window.MoonStillRingsGame,
      window.EternalFootprintGame
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
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      this.canvas.width = window.innerWidth * dpr;
      this.canvas.height = window.innerHeight * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (this.currentGame && this.currentGame.onResize) {
        this.currentGame.onResize();
      }
    };
    window.addEventListener('resize', resize);
    resize();
  }

  _setupInput() {
    const getXY = e => ({ x: e.clientX, y: e.clientY });

    this.canvas.addEventListener('pointerdown', e => {
      window.soundEngine.init();
      this.idleTime = 0;
      this._dismissIntroWhisper();
      if (this.paused || !this.currentGame) return;
      this.canvas.setPointerCapture(e.pointerId);
      const { x, y } = getXY(e);
      this.lastPointer = { x, y, t: performance.now() };
      this.currentGame.onPointerDown(x, y);
    });

    this.canvas.addEventListener('pointermove', e => {
      if (this.paused || !this.currentGame) return;
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
      if (this.paused || !this.currentGame) return;
      const { x, y } = getXY(e);
      this.currentGame.onPointerUp(x, y);
    };

    this.canvas.addEventListener('pointerup', endPointer);
    this.canvas.addEventListener('pointercancel', endPointer);

    // Keyboard Support: Spacebar for Hold, ArrowLeft/Right & 1-6 for stages, H/Q/I/J/M/Esc
    window.addEventListener('keydown', e => {
      this.idleTime = 0;
      if (e.code === 'Space' && !e.repeat && !this.paused && this.currentGame) {
        e.preventDefault();
        window.soundEngine.init();
        this._dismissIntroWhisper();
        this.currentGame.onPointerDown(window.innerWidth * 0.5, window.innerHeight * 0.5);
      } else if (e.key === 'ArrowRight' && !this.paused) {
        window.soundEngine.init();
        this._dismissIntroWhisper();
        this.mountGame((this.currentIndex + 1) % this.gameClasses.length);
      } else if (e.key === 'ArrowLeft' && !this.paused) {
        window.soundEngine.init();
        this._dismissIntroWhisper();
        this.mountGame((this.currentIndex - 1 + this.gameClasses.length) % this.gameClasses.length);
      } else if (e.key >= '1' && e.key <= '6') {
        window.soundEngine.init();
        this._dismissIntroWhisper();
        this.hideModals();
        this.mountGame(Number(e.key) - 1);
      } else if (e.key === 'i' || e.key === 'I') {
        window.soundEngine.init();
        if (this.memoryModal.classList.contains('visible')) {
          this.hideModals();
        } else {
          this.showMemoryShard(this.currentIndex);
        }
      } else if (e.key === 'q' || e.key === 'Q') {
        window.soundEngine.init();
        if (this.quizDeckModal.classList.contains('visible')) {
          this.hideModals();
        } else {
          this.openQuizDeck(this.currentIndex);
        }
      } else if (e.key === 'h' || e.key === 'H') {
        window.soundEngine.init();
        if (this.guideModal.classList.contains('visible')) {
          this.hideModals();
        } else {
          this.openGuide(this.currentIndex);
        }
      } else if (e.key === 'j' || e.key === 'J') {
        window.soundEngine.init();
        if (this.dossierModal.classList.contains('visible')) {
          this.hideModals();
        } else {
          this.openDossier();
        }
      } else if (e.key === 'm' || e.key === 'M') {
        const btnAudio = document.getElementById('btn-audio');
        const muted = window.soundEngine.toggleMute();
        if (btnAudio) btnAudio.style.opacity = muted ? '0.45' : '1';
      } else if (e.key === 'Escape') {
        this.hideModals();
      }
    });

    window.addEventListener('keyup', e => {
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

    // Build 6 wordless constellation dots
    this.navStars = [];
    window.MEMORY_SHARDS.forEach((shard, idx) => {
      const dot = document.createElement('button');
      dot.className = 'nav-star';
      dot.setAttribute('aria-label', shard.title);
      dot.addEventListener('click', () => {
        window.soundEngine.init();
        this.hideModals();
        this.mountGame(idx);
      });
      this.navContainer.appendChild(dot);
      this.navStars.push(dot);
    });

    // VANTALUMEN Emblem -> Open Mission Dossier
    document.getElementById('brand-emblem').addEventListener('click', () => {
      window.soundEngine.init();
      this.openDossier();
    });

    // Top-Right Guide Button (6 Separate Guides)
    document.getElementById('btn-guide').addEventListener('click', () => {
      window.soundEngine.init();
      this.openGuide(this.currentIndex);
    });

    // Top-Right Quiz Deck Button
    document.getElementById('btn-quiz-deck').addEventListener('click', () => {
      window.soundEngine.init();
      this.openQuizDeck(this.currentIndex);
    });

    // Instant Shard Inspection Button
    document.getElementById('btn-instant-shard').addEventListener('click', () => {
      window.soundEngine.init();
      this.showMemoryShard(this.currentIndex);
    });

    // Sound Mute Toggle
    const btnAudio = document.getElementById('btn-audio');
    btnAudio.addEventListener('click', () => {
      const muted = window.soundEngine.toggleMute();
      btnAudio.style.opacity = muted ? '0.45' : '1';
    });

    // Open Memory Shards Archive Gallery
    document.getElementById('btn-gallery').addEventListener('click', () => {
      window.soundEngine.init();
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
    document.getElementById('btn-close-gallery').addEventListener('click', () => this.hideModals());
    document.getElementById('btn-close-dossier').addEventListener('click', () => this.hideModals());
    document.getElementById('btn-close-quiz-deck').addEventListener('click', () => this.hideModals());
    document.getElementById('btn-close-guide').addEventListener('click', () => this.hideModals());

    // Quiz Deck Prev / Next Navigation
    document.getElementById('btn-prev-quiz').addEventListener('click', () => {
      const len = window.VANTALUMEN_QUIZZES.length;
      this.renderQuizDeckSlide((this.currentDeckQuizIndex - 1 + len) % len);
    });
    document.getElementById('btn-next-quiz').addEventListener('click', () => {
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

    this._refreshNavDots();
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
  }

  mountGame(index, animate = true) {
    window.soundEngine.setBrushWind(0);
    const curtain = document.getElementById('cinema-transition');

    const applyMount = () => {
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

    window.soundEngine.playUIChime(3 + (index % 5));
    curtain.classList.add('active');
    setTimeout(() => {
      applyMount();
      setTimeout(() => curtain.classList.remove('active'), 80);
    }, 280);
  }

  completeCurrentGame() {
    const shard = window.MEMORY_SHARDS[this.currentIndex];
    this.unlockedShards.add(shard.id);
    try {
      localStorage.setItem('echoes_unlocked_shards', JSON.stringify([...this.unlockedShards]));
    } catch {}
    this._refreshNavDots();
    window.soundEngine.playSuccessBloom();

    setTimeout(() => {
      this.showMemoryShard(this.currentIndex);
    }, 650);
  }

  showMemoryShard(index) {
    this.paused = true;
    const shard = window.MEMORY_SHARDS[index];
    document.getElementById('shard-number').textContent = `MẢNH VỠ KÝ ỨC • ${shard.number}`;
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
    if (tabDiagram) tabDiagram.onclick = showDiagram;
    if (tabPhoto) tabPhoto.onclick = loadAndShowPhoto;
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
      this.currentIndex === index && this.currentGame && this.currentGame.getSessionMetric
        ? this.currentGame.getSessionMetric()
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

    const isSolved = this.solvedQuizzes.has(quiz.id);
    container.innerHTML = `
      <div class="quiz-header-bar">
        <span class="quiz-tag">THỬ THÁCH TRÍ NHỚ VANTALUMEN ${isSolved ? '• ✓ ĐÃ GIẢI MÃ' : ''}</span>
        <button type="button" class="quiz-deck-link" id="btn-expand-quiz-deck">Mở trọn bộ 7 câu hỏi minh họa ↗</button>
      </div>
      <div class="quiz-card-layout">
        <img src="${quiz.image}" alt="${quiz.questionEn}" class="quiz-art-thumb" id="shard-quiz-thumb" title="Bấm để phóng to thẻ câu hỏi VantaLumen" />
        <div>
          <div class="quiz-q-title">${quiz.questionEn}</div>
          <div class="quiz-q-sub">${quiz.questionVi}</div>
          <div class="quiz-options-grid" id="shard-quiz-opts"></div>
        </div>
      </div>
      <div class="quiz-feedback ${isSolved ? 'visible' : ''}" id="shard-quiz-feedback">
        ${isSolved ? `<strong>Chính xác (${quiz.correctKey})!</strong> ${quiz.explanation}` : ''}
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
      btn.innerHTML = `<span>${opt.label}</span><span class="opt-vi">${opt.vi}</span>`;
      btn.addEventListener('click', () => {
        if (opt.key === quiz.correctKey) {
          btn.classList.add('correct');
          this._markQuizSolved(quiz.id);
          window.soundEngine.playSuccessBloom();
          fbEl.innerHTML = `<strong>Chính xác (${quiz.correctKey})!</strong> ${quiz.explanation}`;
          fbEl.classList.add('visible');
        } else {
          btn.classList.add('wrong');
          window.soundEngine.playPentatonicNote(0, 0.14, 0.4, 0, 'sine');
          fbEl.innerHTML = `Chưa chính xác — hãy thử chọn lại đáp án đúng nhé!`;
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

    container.querySelector('#btn-expand-quiz-deck').addEventListener('click', openFullDeck);
    container.querySelector('#shard-quiz-thumb').addEventListener('click', openFullDeck);
  }

  _markQuizSolved(quizId) {
    this.solvedQuizzes.add(quizId);
    try {
      localStorage.setItem('vantalumen_solved_quizzes', JSON.stringify([...this.solvedQuizzes]));
    } catch {}
  }

  _getMissionRank() {
    const shards = this.unlockedShards.size;
    const quizzes = this.solvedQuizzes.size;
    const total = shards + quizzes;
    if (shards >= 6 && quizzes >= 7) return 'Người Giữ Ký Ức VantaLumen ★';
    if (total >= 8) return 'Kỹ Sư Viễn Thám NASA';
    if (total >= 4) return 'Nhà Khám Phá Bụi Sao';
    return 'Người Lắng Nghe Khởi Đầu';
  }

  openQuizDeck(startIndex = 0) {
    this.paused = true;
    this.memoryModal.classList.remove('visible');
    this.galleryModal.classList.remove('visible');
    this.dossierModal.classList.remove('visible');
    this.guideModal.classList.remove('visible');
    this.renderQuizDeckSlide(startIndex);
    this.quizDeckModal.classList.add('visible');
  }

  renderQuizDeckSlide(index) {
    const quizzes = window.VANTALUMEN_QUIZZES;
    this.currentDeckQuizIndex = ((index % quizzes.length) + quizzes.length) % quizzes.length;
    const quiz = quizzes[this.currentDeckQuizIndex];
    const isSolved = this.solvedQuizzes.has(quiz.id);

    document.getElementById('deck-counter-badge').textContent =
      `VANTALUMEN QUIZ • 0${this.currentDeckQuizIndex + 1} / 0${quizzes.length} • ĐÃ GIẢI: ${this.solvedQuizzes.size}/${quizzes.length}`;
    document.getElementById('deck-img').src = quiz.image;
    document.getElementById('deck-question-en').textContent = quiz.questionEn;
    document.getElementById('deck-question-vi').textContent = quiz.questionVi;

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

    if (isSolved) {
      fbEl.innerHTML = `<strong>Chính xác (${quiz.correctKey})!</strong> ${quiz.explanation}`;
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
      btn.innerHTML = `<span>${opt.label}</span><span class="opt-vi">${opt.vi}</span>`;
      btn.addEventListener('click', () => {
        if (opt.key === quiz.correctKey) {
          btn.classList.add('correct');
          this._markQuizSolved(quiz.id);
          window.soundEngine.playSuccessBloom();
          fbEl.innerHTML = `<strong>Chính xác (${quiz.correctKey})!</strong> ${quiz.explanation}`;
          fbEl.classList.add('visible');
          // Refresh progress dot & score badge
          this.renderQuizDeckSlide(this.currentDeckQuizIndex);
        } else {
          btn.classList.add('wrong');
          window.soundEngine.playPentatonicNote(0, 0.14, 0.4, 0, 'sine');
          fbEl.innerHTML = `Chưa chính xác — hãy quan sát bức ảnh VantaLumen và chọn lại nhé!`;
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

    window.MEMORY_SHARDS.forEach((shard, idx) => {
      const isUnlocked = this.unlockedShards.has(shard.id);
      const linkedQuiz = (window.VANTALUMEN_QUIZZES || []).find(q => q.linkedShardId === shard.id);
      const quizSolved = linkedQuiz ? this.solvedQuizzes.has(linkedQuiz.id) : false;

      const item = document.createElement('div');
      item.className = `gallery-item ${isUnlocked ? 'unlocked' : ''}`;
      item.innerHTML = `
        <div class="gallery-item-top">
          <div class="gallery-item-num">${shard.number} ${isUnlocked ? '• ĐÃ ĐÁNH THỨC' : '• CHƯA KHÁM PHÁ'}</div>
          <span class="gallery-quiz-chip ${quizSolved ? 'solved' : ''}">${quizSolved ? '✓ Đã giải mã' : 'Chưa giải mã'}</span>
        </div>
        <div class="gallery-item-preview">${shard.svgDiagram || ''}</div>
        <div class="gallery-item-title">${shard.title}</div>
        <div class="gallery-item-desc">${shard.subtitle}</div>
        <div class="gallery-item-actions">
          <button type="button" class="btn-mini play">Chơi màn ▶</button>
          <button type="button" class="btn-mini view">Thẻ Ký Ức</button>
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

    window.soundEngine.playUIChime(4);
    this.galleryModal.classList.add('visible');
  }

  openGuide(index = 0) {
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
    const guide = guides[safeIdx];
    if (!guide) return;

    const tabsEl = document.getElementById('guide-tabs');
    tabsEl.innerHTML = '';
    guides.forEach((g, idx) => {
      const btn = document.createElement('button');
      btn.className = `guide-tab-btn ${idx === safeIdx ? 'active' : ''}`;
      const shortName = g.title.split('—')[0].trim();
      btn.textContent = `0${idx + 1}. ${shortName}`;
      btn.addEventListener('click', () => this.renderGuide(idx));
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
    this.paused = true;
    this.memoryModal.classList.remove('visible');
    this.galleryModal.classList.remove('visible');
    this.quizDeckModal.classList.remove('visible');
    this.guideModal.classList.remove('visible');
    this.dossierModal.classList.add('visible');
  }

  hideModals() {
    this.memoryModal.classList.remove('visible');
    this.galleryModal.classList.remove('visible');
    this.dossierModal.classList.remove('visible');
    this.quizDeckModal.classList.remove('visible');
    this.guideModal.classList.remove('visible');
    this.paused = false;
  }

  exportShardCardPNG(index) {
    const shard = window.MEMORY_SHARDS[index];
    const c = document.createElement('canvas');
    c.width = 1080;
    c.height = 620;
    const ctx = c.getContext('2d');

    const bg = ctx.createLinearGradient(0, 0, 1080, 620);
    bg.addColorStop(0, '#070b16');
    bg.addColorStop(1, '#121b36');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1080, 620);

    const glow = ctx.createRadialGradient(880, 140, 20, 880, 140, 360);
    glow.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
    glow.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1080, 620);

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
    ctx.lineWidth = 3;
    ctx.strokeRect(28, 28, 1024, 564);

    ctx.fillStyle = '#fcd34d';
    ctx.font = '600 18px "JetBrains Mono", monospace';
    ctx.fillText(`TEAM VANTALUMEN // NASA SPACE APPS CHALLENGE • MẢNH VỠ KÝ ỨC ${shard.number}`, 64, 82);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px "JetBrains Mono", monospace';
    ctx.fillText(shard.mission, 64, 112);

    ctx.fillStyle = '#fef3c7';
    ctx.font = '600 42px Georgia, serif';
    ctx.fillText(shard.title, 64, 175);

    ctx.fillStyle = '#f59e0b';
    ctx.font = '500 22px Inter, sans-serif';
    ctx.fillText(shard.subtitle, 64, 212);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '21px Inter, sans-serif';
    const words = shard.story.split(' ');
    let line = '';
    let y = 275;
    for (const w of words) {
      const test = line + w + ' ';
      if (ctx.measureText(test).width > 940) {
        ctx.fillText(line, 64, y);
        line = w + ' ';
        y += 34;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, 64, y);

    const metric =
      this.currentGame && this.currentGame.getSessionMetric
        ? this.currentGame.getSessionMetric()
        : 'Đã ghi nhận';
    ctx.fillStyle = 'rgba(245, 158, 11, 0.14)';
    ctx.fillRect(64, 470, 952, 74);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(64, 470, 952, 74);

    ctx.fillStyle = '#fcd34d';
    ctx.font = '600 18px "JetBrains Mono", monospace';
    ctx.fillText(`DỮ LIỆU CỦA BẠN: ${metric}`, 88, 504);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '15px "JetBrains Mono", monospace';
    ctx.fillText(`Nguồn tư liệu: ${shard.sourceUrl}`, 88, 529);

    const link = document.createElement('a');
    link.download = `Vantalumen-${shard.id}.png`;
    link.href = c.toDataURL('image/png');
    link.click();
  }

  exportCertificatePNG() {
    window.soundEngine.playSuccessBloom();
    const c = document.createElement('canvas');
    c.width = 1400;
    c.height = 860;
    const ctx = c.getContext('2d');

    // Deep cosmic background
    const bg = ctx.createLinearGradient(0, 0, 1400, 860);
    bg.addColorStop(0, '#040710');
    bg.addColorStop(0.5, '#0a1328');
    bg.addColorStop(1, '#101c38');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1400, 860);

    // Subtle cosmic starfield
    for (let i = 0; i < 95; i++) {
      const sx = ((i * 197 + 43) % 1340) + 30;
      const sy = ((i * 313 + 71) % 800) + 30;
      const sr = (i % 3 === 0) ? 1.5 : 0.85;
      ctx.fillStyle = `rgba(254, 243, 199, ${0.12 + (i % 5) * 0.06})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dual cosmic glow halos (Amber & Cyan)
    const gAmber = ctx.createRadialGradient(1236, 132, 20, 1236, 132, 460);
    gAmber.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
    gAmber.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = gAmber;
    ctx.fillRect(0, 0, 1400, 860);

    const gCyan = ctx.createRadialGradient(240, 680, 20, 240, 680, 440);
    gCyan.addColorStop(0, 'rgba(56, 189, 248, 0.14)');
    gCyan.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = gCyan;
    ctx.fillRect(0, 0, 1400, 860);

    // Faint orbital arcs behind header
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(1236, 132, 135, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(1236, 132, 210, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Outer & Inner gold borders + corner aerospace brackets
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.65)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(32, 32, 1336, 796);
    ctx.strokeStyle = 'rgba(254, 243, 199, 0.14)';
    ctx.lineWidth = 1;
    ctx.strokeRect(46, 46, 1308, 768);

    const drawBracket = (bx, by, dx, dy) => {
      ctx.strokeStyle = '#fcd34d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bx + dx * 26, by);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx, by + dy * 26);
      ctx.stroke();
    };
    drawBracket(32, 32, 1, 1);
    drawBracket(1368, 32, -1, 1);
    drawBracket(32, 828, 1, -1);
    drawBracket(1368, 828, -1, -1);

    // Header (Left column, plenty of clearance from top-right emblem)
    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 16px "JetBrains Mono", monospace';
    ctx.fillText('NASA SPACE APPS CHALLENGE // OFFICIAL ANTHOLOGY CERTIFICATE', 84, 102);

    ctx.fillStyle = '#fef3c7';
    ctx.font = '600 46px Georgia, serif';
    ctx.fillText('ECHOES IN THE DUST', 84, 160);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 20px Inter, sans-serif';
    ctx.fillText('Chứng nhận Hoàn thành Trải nghiệm Phần cứng & Tri thức Thám hiểm NASA', 84, 198);

    // Gold gradient accent line under header
    const lineGrad = ctx.createLinearGradient(84, 0, 1090, 0);
    lineGrad.addColorStop(0, '#f59e0b');
    lineGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.35)');
    lineGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(84, 224);
    ctx.lineTo(1090, 224);
    ctx.stroke();

    // Rank & Telemetry Banner (x: 84 -> 1316, w: 1232)
    const unlockedCount = this.unlockedShards.size;
    const totalShards = window.MEMORY_SHARDS.length;
    const solvedCount = this.solvedQuizzes.size;
    const totalQuizzes = (window.VANTALUMEN_QUIZZES || []).length;
    const rank = this._getMissionRank();

    ctx.fillStyle = 'rgba(13, 21, 42, 0.88)';
    ctx.fillRect(84, 256, 1232, 138);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.38)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(84, 256, 1232, 138);

    // Vertical dividers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(640, 278);
    ctx.lineTo(640, 372);
    ctx.moveTo(975, 278);
    ctx.lineTo(975, 372);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 13px "JetBrains Mono", monospace';
    ctx.fillText('DANH HIỆU SỨ MỆNH', 118, 294);
    ctx.fillText('MẢNH VỠ KÝ ỨC', 674, 294);
    ctx.fillText('TRI THỨC VANTALUMEN', 1009, 294);

    ctx.fillStyle = '#fef3c7';
    ctx.font = '600 28px Georgia, serif';
    ctx.fillText(rank, 118, 344);

    ctx.fillStyle = '#fcd34d';
    ctx.font = '600 32px "JetBrains Mono", monospace';
    ctx.fillText(`${unlockedCount} / ${totalShards}`, 674, 342);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${solvedCount} / ${totalQuizzes}`, 1009, 342);

    // Mini progress bars inside telemetry banner
    ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.fillRect(674, 360, 260, 6);
    ctx.fillRect(1009, 360, 260, 6);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(674, 360, Math.round(260 * (unlockedCount / Math.max(1, totalShards))), 6);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(1009, 360, Math.round(260 * (solvedCount / Math.max(1, totalQuizzes))), 6);

    // 6 NASA Hardware Mission Seals (3x2 grid, total w = 1232)
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 14px "JetBrains Mono", monospace';
    ctx.fillText('SÁU THIẾT BỊ NASA TRONG BỘ SƯU TẬP', 84, 438);

    window.MEMORY_SHARDS.forEach((shard, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const bx = 84 + col * 419;
      const by = 460 + row * 128;
      const bw = 394;
      const bh = 108;
      const unlocked = this.unlockedShards.has(shard.id);

      ctx.fillStyle = unlocked ? 'rgba(245, 158, 11, 0.1)' : 'rgba(15, 23, 42, 0.72)';
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = unlocked ? 'rgba(245, 158, 11, 0.72)' : 'rgba(148, 163, 184, 0.22)';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(bx, by, bw, bh);

      // Status dot
      ctx.fillStyle = unlocked ? '#fcd34d' : '#475569';
      ctx.beginPath();
      ctx.arc(bx + 22, by + 27, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = unlocked ? '#fcd34d' : '#64748b';
      ctx.font = '600 12.5px "JetBrains Mono", monospace';
      ctx.fillText(`${shard.number} • ${unlocked ? 'ĐÃ ĐÁNH THỨC' : 'CHƯA KHÁM PHÁ'}`, bx + 36, by + 31);

      ctx.fillStyle = unlocked ? '#fef3c7' : '#94a3b8';
      ctx.font = '600 20px Georgia, serif';
      const shortTitle = shard.title.split('—')[0].trim();
      ctx.fillText(shortTitle, bx + 18, by + 63);

      ctx.fillStyle = unlocked ? '#cbd5e1' : '#64748b';
      ctx.font = '13px Inter, sans-serif';
      const shortSub = shard.subtitle.length > 46 ? shard.subtitle.slice(0, 44) + '…' : shard.subtitle;
      ctx.fillText(shortSub, bx + 18, by + 88);
    });

    // Footer
    const dateStr = new Date().toLocaleDateString('vi-VN');
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(84, 738);
    ctx.lineTo(1316, 738);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 14px "JetBrains Mono", monospace';
    ctx.fillText('TEAM VANTALUMEN • KEEPING SPACE EXPLORATION STORIES ALIVE', 84, 774);

    ctx.save();
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fcd34d';
    ctx.fillText(`NASA OPEN DATA VERIFIED • ${dateStr}`, 1316, 774);
    ctx.restore();

    const download = () => {
      const link = document.createElement('a');
      link.download = 'Vantalumen-SpaceApps-Certificate.png';
      link.href = c.toDataURL('image/png');
      link.click();
    };

    const drawMedallion = img => {
      ctx.save();
      // Outer golden orbital ring
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(1236, 132, 66, 0, Math.PI * 2);
      ctx.stroke();

      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(1236, 132, 58, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      ctx.beginPath();
      ctx.arc(1236, 132, 48, 0, Math.PI * 2);
      ctx.fill();

      if (img) {
        ctx.drawImage(img, 1236 - 36, 132 - 36, 72, 72);
      }
      ctx.restore();
    };

    const logo = new Image();
    logo.onload = () => {
      try {
        drawMedallion(logo);
      } catch {}
      download();
    };
    logo.onerror = () => {
      drawMedallion(null);
      download();
    };
    logo.src = 'assets/vantalumen_logo.png';
  }

  _loop(now) {
    const dt = Math.min(0.05, (now - this.lastFrameTime) / 1000);
    this.lastFrameTime = now;

    if (!this.paused && this.currentGame) {
      this.idleTime = (this.idleTime || 0) + dt;
      if (this.idleTime > 5.0 && typeof this.currentGame.ghostAlpha === 'number') {
        this.currentGame.ghostAlpha = Math.min(0.75, this.currentGame.ghostAlpha + dt * 0.85);
      }
      this.currentGame.update(dt);
      const w = window.innerWidth;
      const h = window.innerHeight;
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
