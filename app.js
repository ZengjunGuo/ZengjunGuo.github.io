(() => {
  const root = document.documentElement;
  const themeButton = document.getElementById('theme-toggle');
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const read = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch { /* The page also works without browser storage. */ } };
  function updateThemeLabel() {
    const dark = root.dataset.theme === 'dark';
    themeButton.querySelector('.button-label').textContent = dark ? 'Light mode' : 'Dark mode';
    themeButton.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    themeButton.querySelector('.moon-icon').toggleAttribute('hidden', dark);
    themeButton.querySelector('.sun-icon').toggleAttribute('hidden', !dark);
    document.querySelector('meta[name="theme-color"]').content = dark ? '#1a1817' : '#f3f2f2';
  }
  updateThemeLabel();
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
