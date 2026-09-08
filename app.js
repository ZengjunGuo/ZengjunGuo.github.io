(() => {
  const root = document.documentElement;
  const languageButton = document.getElementById('language-toggle');
  const themeButton = document.getElementById('theme-toggle');
  const status = document.getElementById('ui-status');
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const read = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch { /* The page also works without browser storage. */ } };
  const descriptions = {
    en: 'Zengjun Guo studies the coupled relationships between human activity, urban space and disaster risk, from global infrastructure networks to community accessibility.',
    zh: '郭增骏，北京大学硕士研究生，研究人类活动—城市空间—灾害风险耦合关系，涵盖全球基础设施网络、城市服务与社区可达性。'
  };
  function updateGalleryLabels() {
    const zh = root.dataset.lang === 'zh';
    document.querySelectorAll('[data-gallery]').forEach(gallery => {
      gallery.setAttribute('aria-label', zh ? '研究图件' : 'Research figures');
      gallery.querySelector('.gallery-prev')?.setAttribute('aria-label', zh ? '上一张图' : 'Previous figure');
      gallery.querySelector('.gallery-next')?.setAttribute('aria-label', zh ? '下一张图' : 'Next figure');
      gallery.querySelectorAll('.figure-open').forEach(link => link.setAttribute('aria-label', zh ? '查看原尺寸图件' : 'Open full-size figure'));
    });
  }
  function updateThemeLabel() {
    const dark = root.dataset.theme === 'dark';
    const zh = root.dataset.lang === 'zh';
    themeButton.querySelector('.button-label').textContent = zh ? (dark ? '浅色模式' : '深色模式') : (dark ? 'Light mode' : 'Dark mode');
    themeButton.setAttribute('aria-label', zh ? (dark ? '切换到浅色模式' : '切换到深色模式') : (dark ? 'Switch to light mode' : 'Switch to dark mode'));
    themeButton.querySelector('.moon-icon').toggleAttribute('hidden', dark);
    themeButton.querySelector('.sun-icon').toggleAttribute('hidden', !dark);
    document.querySelector('meta[name="theme-color"]').content = dark ? '#1a1817' : '#f3f2f2';
  }
  function setLanguage(language, announce = false) {
    const zh = language === 'zh';
    root.lang = zh ? 'zh-CN' : 'en';
    root.dataset.lang = zh ? 'zh' : 'en';
    document.title = zh ? '郭增骏 · Zengjun Guo' : 'Zengjun Guo · 郭增骏';
    document.querySelector('meta[name="description"]').content = descriptions[zh ? 'zh' : 'en'];
    languageButton.querySelector('.button-label').textContent = zh ? 'English' : '中文';
    languageButton.setAttribute('aria-label', zh ? 'Switch to English' : '切换到中文');
    languageButton.setAttribute('lang', zh ? 'en' : 'zh-CN');
    updateThemeLabel();
    updateGalleryLabels();
    if (announce) status.textContent = zh ? '已切换到中文' : 'Language changed to English';
  }
  setLanguage(root.dataset.lang || 'en');
  languageButton.addEventListener('click', () => {
    const language = root.dataset.lang === 'en' ? 'zh' : 'en';
    setLanguage(language, true);
    save('zg-language', language);
  });
  themeButton.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    save('zg-theme', root.dataset.theme);
    updateThemeLabel();
  });
  media.addEventListener('change', (event) => {
    if (!['light', 'dark'].includes(read('zg-theme'))) {
      root.dataset.theme = event.matches ? 'dark' : 'light';
      updateThemeLabel();
    }
  });
  document.querySelectorAll('[data-gallery]').forEach(gallery => {
    const slides = [...gallery.querySelectorAll('.gallery-slide')];
    if (slides.length < 2) return;
    let current = 0;
    let gesture = null;
    let suppressClick = false;
    const stage = gallery.querySelector('.gallery-stage');
    const show = next => {
      current = (next + slides.length) % slides.length;
      slides.forEach((slide, index) => slide.hidden = index !== current);
      gallery.querySelector('.gallery-count').textContent = `${current + 1} / ${slides.length}`;
    };
    gallery.querySelector('.gallery-controls').hidden = false;
    gallery.querySelector('.gallery-prev').addEventListener('click', () => show(current - 1));
    gallery.querySelector('.gallery-next').addEventListener('click', () => show(current + 1));
    gallery.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      show(current + (event.key === 'ArrowRight' ? 1 : -1));
    });
    stage.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      gesture = {x: event.clientX, y: event.clientY};
      suppressClick = false;
    });
    stage.addEventListener('pointerup', event => {
      if (!gesture) return;
      const dx = event.clientX - gesture.x;
      const dy = event.clientY - gesture.y;
      gesture = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        suppressClick = true;
        show(current + (dx < 0 ? 1 : -1));
      }
    });
    stage.addEventListener('pointercancel', () => { gesture = null; });
    stage.addEventListener('dragstart', event => event.preventDefault());
    stage.addEventListener('click', event => {
      if (suppressClick) {
        event.preventDefault();
        suppressClick = false;
      }
    }, true);
  });
})();
