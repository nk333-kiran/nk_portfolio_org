// Gate open transition
const enterBtn = document.getElementById('enterBtn');
const intro = document.getElementById('intro');
const site = document.getElementById('site');
const left = document.querySelector('.left');
const right = document.querySelector('.right');

function showSite(skipAnimation = false) {
  // show the main site and hide the intro; if skipAnimation, do it immediately
  try {
    if (skipAnimation) {
      left.style.transform = 'translateX(-100%)';
      right.style.transform = 'translateX(100%)';
      intro.classList.add('hidden');
      site.classList.remove('hidden');
      return;
    }
    
    // Fade out content first
    const introContent = document.querySelector('.intro-content');
    const introImage = document.querySelector('.intro-portrait');
    if (introContent) introContent.style.opacity = '0';
    if (introImage) introImage.style.opacity = '0';
    
    // Wait a bit, then slide split panels
    setTimeout(() => {
      left.style.transform = 'translateX(-100%)';
      right.style.transform = 'translateX(100%)';
    }, 150);
    
    // After split animation, show main site faster
    setTimeout(() => {
      intro.classList.add('hidden');
      site.classList.remove('hidden');
      site.style.opacity = '0';
      requestAnimationFrame(() => {
        site.style.transition = 'opacity 0.3s ease';
        site.style.opacity = '1';
      });
    }, 1150);
  } catch (e) {
    // if elements missing, fall back to showing site
    if (intro) intro.classList.add('hidden');
    if (site) site.classList.remove('hidden');
  }
}

if (enterBtn) {
  enterBtn.addEventListener('click', () => {
    // mark that user entered the site so returning from project pages skips the intro
    sessionStorage.setItem('entered', 'true');
    showSite(false);
  });
}

// If the user already entered previously (sessionStorage), skip the intro on load
if (sessionStorage.getItem('entered') === 'true') {
  // run after a microtask so DOM is ready
  setTimeout(() => showSite(true), 10);
}

// Scroll reveal using IntersectionObserver for better performance
const observerOptions = {
  root: null,
  rootMargin: '0px 0px -100px 0px',
  threshold: 0
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => {
  observer.observe(el);
});

// Scroll to target section if coming from project page
window.addEventListener('load', () => {
  const targetSection = sessionStorage.getItem('targetSection');
  if (targetSection) {
    sessionStorage.removeItem('targetSection');
    const section = document.getElementById(targetSection);
    if (section) {
      setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }
});

// Theme toggle with localStorage persistence
const themeBtn = document.getElementById('themeToggle');

// Apply saved theme on page load
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    document.body.classList.remove('light');
  } else {
    document.body.classList.add('light');
    document.body.classList.remove('dark');
  }
});

if (themeBtn) {
  // Toggle theme and save preference
  themeBtn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark');
    if (isDark) {
      document.body.classList.remove('dark');
      document.body.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  });
}

// Mobile menu toggle
const menuBtn = document.getElementById('menuToggle');
const nav = document.querySelector('.nav');
if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => {
    nav.classList.toggle('active');
    menuBtn.classList.toggle('active');
    menuBtn.textContent = nav.classList.contains('active') ? '✕' : '☰';
    // Prevent body scroll when menu is open
    document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
  });
  
  // Close menu when clicking a link (handle both in-page hashes and links back to index)
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (event) => {
      // Always close the mobile nav first
      nav.classList.remove('active');
      menuBtn.classList.remove('active');
      menuBtn.textContent = '☰';
      document.body.style.overflow = '';

      const href = link.getAttribute('href');
      if (!href) return;

      // In-page anchor (like '#about') — smooth scroll without leaving page
      if (href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          event.preventDefault();
          // small timeout to allow menu close animation
          setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 50);
        }
        return;
      }

      // Link to main page section (index.html#about) — store target and navigate with fade
      if (href.includes('index.html#')) {
        event.preventDefault();
        const hash = href.split('#')[1];
        sessionStorage.setItem('entered', 'true');
        sessionStorage.setItem('targetSection', hash);
        document.body.classList.add('fade-out');
        setTimeout(() => { window.location.href = href; }, 300);
        return;
      }

      // Otherwise, allow the link to proceed normally
    });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !menuBtn.contains(e.target) && nav.classList.contains('active')) {
      nav.classList.remove('active');
      menuBtn.classList.remove('active');
      menuBtn.textContent = '☰';
      document.body.style.overflow = '';
    }
  });
}

// Footer year
const yearEl = document.getElementById('yearFoot');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Smooth page fade transitions
document.querySelectorAll('.page-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const href = link.getAttribute('href');
    document.body.classList.add('fade-out');
    setTimeout(() => (window.location.href = href), 400);
  });
});

// Back-link behavior on project detail pages: set entered flag so returning goes straight into main page
document.querySelectorAll('.back-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const href = link.getAttribute('href');
    // mark entered, then navigate with fade
    sessionStorage.setItem('entered', 'true');
    document.body.classList.add('fade-out');
    setTimeout(() => (window.location.href = href), 300);
  });
});

// Handle navbar navigation from project pages to main page sections
document.querySelectorAll('nav a').forEach(link => {
  const href = link.getAttribute('href');
  if (href && href.includes('index.html#')) {
    link.addEventListener('click', e => {
      e.preventDefault();
      const hash = href.split('#')[1];
      // mark entered and store target section
      sessionStorage.setItem('entered', 'true');
      sessionStorage.setItem('targetSection', hash);
      document.body.classList.add('fade-out');
      setTimeout(() => {
        window.location.href = 'index.html#' + hash;
      }, 300);
    });
  }
});

window.addEventListener('pageshow', () => {
  document.body.classList.remove('fade-out');
});
