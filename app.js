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
  const sectionLinks = [...document.querySelectorAll('.section-nav a, .mobile-section-nav nav a')];
  const sections = [...document.querySelectorAll('main > section')];
  const mobileMenu = document.querySelector('.mobile-section-nav details');
  let navPending = false;
  const updateSection = () => {
    let current = sections[0].id;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= 120) current = section.id;
    }
    if (Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight - 2) current = sections.at(-1).id;
    sectionLinks.forEach(link => {
      if (link.hash === `#${current}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    navPending = false;
  };
  window.addEventListener('scroll', () => {
    if (!navPending) { navPending = true; requestAnimationFrame(updateSection); }
  }, {passive: true});
  window.addEventListener('resize', updateSection);
  sectionLinks.forEach(link => link.addEventListener('click', () => { mobileMenu.open = false; }));
  document.addEventListener('click', event => {
    if (!mobileMenu.contains(event.target)) mobileMenu.open = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileMenu.open) {
      mobileMenu.open = false;
      mobileMenu.querySelector('summary').focus();
    }
  });
  updateSection();

  const viewer = document.getElementById('figure-viewer');
  const viewerImage = document.getElementById('viewer-image');
  const viewerStage = viewer.querySelector('.viewer-stage');
  const zoomButton = document.getElementById('viewer-zoom');
  const setZoom = zoomed => {
    viewerStage.classList.toggle('is-zoomed', zoomed);
    zoomButton.textContent = zoomed ? 'Fit to screen' : 'Zoom in';
    zoomButton.setAttribute('aria-pressed', String(zoomed));
    viewerStage.scrollTo(0, 0);
  };
  if (typeof viewer.showModal === 'function') {
    document.querySelectorAll('.figure-open, .figure-enlarge').forEach(link => {
      link.addEventListener('click', event => {
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        const slide = link.closest('.gallery-slide');
        const source = slide.querySelector('img');
        viewerImage.src = source.currentSrc || source.src;
        viewerImage.alt = source.alt;
        viewerStage.style.setProperty('--figure-width', `${source.naturalWidth || source.getAttribute('width')}px`);
        document.getElementById('viewer-caption').textContent = slide.querySelector('figcaption').textContent;
        document.getElementById('viewer-original').href = source.currentSrc || link.href;
        setZoom(false);
        viewer.showModal();
      });
    });
    zoomButton.addEventListener('click', () => setZoom(!viewerStage.classList.contains('is-zoomed')));
    document.getElementById('viewer-close').addEventListener('click', () => viewer.close());
    viewer.addEventListener('click', event => {
      if (event.target !== viewer) return;
      const box = viewer.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) viewer.close();
    });
  }
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
