/**
 * FRATERNITÀ SANTA MARIA DEGLI ANGELI - WWW.CONFRANCESCO.IT
 * PWA Core Application Logic & Service Worker Management
 */

(function () {
  'use strict';

  let deferredInstallPrompt = null;
  let newWorker = null;

  // DOM Elements
  const installButtons = document.querySelectorAll('.btn-install, .btn-banner-install, #install-app-btn');
  const installBanner = document.getElementById('pwa-install-banner');
  const bannerCloseBtn = document.getElementById('btn-banner-close');
  const statusBar = document.getElementById('network-status-bar');
  const updateToast = document.getElementById('update-toast');
  const btnUpdateApp = document.getElementById('btn-update-app');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const iosModal = document.getElementById('ios-install-modal');
  const iosModalClose = document.getElementById('ios-modal-close');

  // Detect iOS
  const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  };

  const isInStandaloneMode = () => {
    return ('standalone' in window.navigator && window.navigator.standalone) ||
      window.matchMedia('(display-mode: standalone)').matches;
  };

  // 1. Mobile Menu Drawer Toggle
  function openDrawer() {
    if (mobileDrawer) {
      mobileDrawer.classList.add('open');
      mobileDrawer.classList.add('active');
    }
    if (drawerBackdrop) drawerBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (mobileDrawer) {
      mobileDrawer.classList.remove('open');
      mobileDrawer.classList.remove('active');
    }
    if (drawerBackdrop) drawerBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  // Close drawer on link click
  const drawerLinks = document.querySelectorAll('.mobile-nav-list a');
  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // 2. Online / Offline Status Detection
  function updateNetworkStatus() {
    if (!statusBar) return;
    if (navigator.onLine) {
      statusBar.className = 'network-status-bar';
      statusBar.innerHTML = '<span>&#9679;</span> Sei Online &mdash; Contenuti sincronizzati';
      setTimeout(() => {
        statusBar.classList.add('hidden');
      }, 3500);
    } else {
      statusBar.className = 'network-status-bar offline';
      statusBar.innerHTML = '<span>&#9888;</span> Modalità Offline attiva &mdash; Tutte le pagine e immagini sono salvate sul dispositivo';
      statusBar.classList.remove('hidden');
    }
  }

  window.addEventListener('online', () => {
    updateNetworkStatus();
    // Re-check service worker updates when coming back online
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => reg.update());
    }
  });

  window.addEventListener('offline', updateNetworkStatus);
  // Initial check
  if (!navigator.onLine) {
    updateNetworkStatus();
  }

  // 3. PWA Installation Management
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;

    // Show install buttons and banner if not already installed
    if (!isInStandaloneMode()) {
      installButtons.forEach(btn => {
        btn.style.display = 'inline-flex';
      });
      if (installBanner && !localStorage.getItem('pwa_banner_dismissed')) {
        installBanner.style.display = 'flex';
      }
    }
  });

  // Handle install button clicks
  installButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          console.log('Utente ha installato la PWA');
          if (installBanner) installBanner.style.display = 'none';
        }
        deferredInstallPrompt = null;
      } else if (isIos() && !isInStandaloneMode()) {
        // Show iOS instructions modal
        if (iosModal) iosModal.classList.add('active');
      } else {
        // Fallback for browsers that already installed or don't support beforeinstallprompt
        alert('Per installare l\'app:\n- Su Chrome / Edge: clicca l\'icona del computer/freccia nella barra degli indirizzi o nel menu in alto a destra -> "Installa app"\n- Su Safari iOS: tocca Condividi e seleziona "Aggiungi a Home"');
      }
    });
  });

  if (bannerCloseBtn && installBanner) {
    bannerCloseBtn.addEventListener('click', () => {
      installBanner.style.display = 'none';
      localStorage.setItem('pwa_banner_dismissed', 'true');
    });
  }

  if (iosModalClose && iosModal) {
    iosModalClose.addEventListener('click', () => {
      iosModal.classList.remove('active');
    });
  }

  window.addEventListener('appinstalled', () => {
    console.log('App installata con successo!');
    if (installBanner) installBanner.style.display = 'none';
    installButtons.forEach(btn => btn.style.display = 'none');
  });

  // Hide install options if already standalone
  if (isInStandaloneMode()) {
    if (installBanner) installBanner.style.display = 'none';
    installButtons.forEach(btn => btn.style.display = 'none');
  }

  // 4. Service Worker Registration & Updates
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((registration) => {
          console.log('Service Worker registrato con successo:', registration.scope);

          // Force check for updates every time app opens
          registration.update();

          // Listen for new worker waiting to activate
          registration.addEventListener('updatefound', () => {
            newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available! Show toast
                if (updateToast) updateToast.classList.add('show');
              }
            });
          });
        })
        .catch((error) => {
          console.error('Registrazione Service Worker fallita:', error);
        });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    });
  }

  // Handle Update Toast Button
  // 5. Home Page Photo Carousel Logic
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');

  if (slides.length > 0) {
    let currentSlide = 0;
    let autoSlideTimer = null;

    function showSlide(index) {
      if (index >= slides.length) index = 0;
      if (index < 0) index = slides.length - 1;
      currentSlide = index;

      slides.forEach((s, i) => {
        s.classList.toggle('active', i === currentSlide);
      });
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === currentSlide);
      });
    }

    function resetTimer() {
      if (autoSlideTimer) clearInterval(autoSlideTimer);
      autoSlideTimer = setInterval(() => {
        showSlide(currentSlide + 1);
      }, 5000);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        showSlide(currentSlide - 1);
        resetTimer();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        showSlide(currentSlide + 1);
        resetTimer();
      });
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        showSlide(i);
        resetTimer();
      });
    });

    resetTimer();
  }

})();
