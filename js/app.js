/**
 * MegaHTML Pro - Complete JavaScript Application
 * Modern ES6+ with all features
 * Author: Efe Altıparmakoğlu
 */

'use strict';

// ============================================
// APP STATE & CONFIG
// ============================================
const App = {
  state: {
    theme: localStorage.getItem('theme') || 'light',
    navOpen: false,
    currentSection: 'home',
    scrollY: 0
  },
  
  config: {
    animationDelay: 100,
    scrollOffset: 100,
    counterDuration: 2000
  },

  // ============================================
  // INITIALIZATION
  // ============================================
  init() {
    console.log('🚀 MegaHTML Pro initialized');
    
    this.initLoader();
    this.initNavigation();
    this.initThemeToggle();
    this.initScrollAnimations();
    this.initCounterAnimation();
    this.initContactForm();
    this.initSmoothScroll();
    this.initScrollSpy();
  },

  // ============================================
  // LOADER
  // ============================================
  initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;
    
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden');
        // Trigger entrance animations after loader
        document.body.classList.add('loaded');
      }, 500);
    });
  },

  // ============================================
  // NAVIGATION
  // ============================================
  initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navbar = document.getElementById('navbar');
    
    // Mobile menu toggle
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        this.state.navOpen = !this.state.navOpen;
        navMenu.classList.toggle('active');
        navToggle.setAttribute('aria-expanded', this.state.navOpen);
        
        // Animate hamburger
        navToggle.classList.toggle('active');
      });
    }
    
    // Close menu on link click (mobile)
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          navMenu?.classList.remove('active');
          navToggle?.classList.remove('active');
          this.state.navOpen = false;
        }
      });
    });
    
    // Navbar background on scroll
    window.addEventListener('scroll', this.throttle(() => {
      if (window.scrollY > 50) {
        navbar?.classList.add('scrolled');
      } else {
        navbar?.classList.remove('scrolled');
      }
    }, 100));
  },

  // ============================================
  // THEME TOGGLE
  // ============================================
  initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    // Apply saved theme
    if (this.state.theme === 'dark') {
      html.setAttribute('data-theme', 'dark');
    }
    
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.state.theme = newTheme;
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('themechange', { 
          detail: { theme: newTheme } 
        }));
        
        console.log(`Theme changed to: ${newTheme}`);
      });
    }
    
    // System preference detection
    if (window.matchMedia && !localStorage.getItem('theme')) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      if (darkModeQuery.matches) {
        html.setAttribute('data-theme', 'dark');
        this.state.theme = 'dark';
      }
      
      darkModeQuery.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          const theme = e.matches ? 'dark' : 'light';
          html.setAttribute('data-theme', theme);
          this.state.theme = theme;
        }
      });
    }
  },

  // ============================================
  // SCROLL ANIMATIONS (AOS-like)
  // ============================================
  initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-aos]');
    
    if (!animatedElements.length) return;
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.getAttribute('data-aos-delay')) || 0;
          
          setTimeout(() => {
            entry.target.classList.add('aos-animate');
          }, delay);
          
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    animatedElements.forEach(el => observer.observe(el));
  },

  // ============================================
  // COUNTER ANIMATION
  // ============================================
  initCounterAnimation() {
    const counters = document.querySelectorAll('[data-count]');
    
    if (!counters.length) return;
    
    const animateCounter = (el) => {
      const target = parseInt(el.getAttribute('data-count'));
      const duration = this.config.counterDuration;
      const frameDuration = 1000 / 60; // 60fps
      const totalFrames = duration / frameDuration;
      const increment = target / totalFrames;
      
      let current = 0;
      let frame = 0;
      
      const updateCounter = () => {
        frame++;
        current += increment;
        
        // Easing function (easeOutQuart)
        const progress = frame / totalFrames;
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        
        const displayValue = Math.floor(target * easeProgress);
        el.textContent = displayValue.toLocaleString();
        
        if (frame < totalFrames) {
          requestAnimationFrame(updateCounter);
        } else {
          el.textContent = target.toLocaleString();
        }
      };
      
      updateCounter();
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
  },

  // ============================================
  // CONTACT FORM
  // ============================================
  initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn?.textContent || 'Send Message';
      
      // Validation
      if (!data.name?.trim()) {
        this.showNotification('Please enter your name', 'error');
        return;
      }
      
      if (!data.email?.trim() || !this.isValidEmail(data.email)) {
        this.showNotification('Please enter a valid email', 'error');
        return;
      }
      
      if (!data.message?.trim()) {
        this.showNotification('Please enter your message', 'error');
        return;
      }
      
      // Loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        submitBtn.classList.add('loading');
      }
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        this.showNotification('Message sent successfully!', 'success');
        form.reset();
        
      } catch (error) {
        this.showNotification('Failed to send message. Please try again.', 'error');
        console.error('Form submission error:', error);
        
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          submitBtn.classList.remove('loading');
        }
      }
    });
  },

  // ============================================
  // SMOOTH SCROLL
  // ============================================
  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        
        const target = document.querySelector(href);
        if (!target) return;
        
        e.preventDefault();
        
        const offset = this.config.scrollOffset;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      });
    });
  },

  // ============================================
  // SCROLL SPY
  // ============================================
  initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!sections.length || !navLinks.length) return;
    
    const observerOptions = {
      rootMargin: '-20% 0px -80% 0px',
      threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
          
          this.state.currentSection = id;
        }
      });
    }, observerOptions);
    
    sections.forEach(section => observer.observe(section));
  },

  // ============================================
  // NOTIFICATION SYSTEM
  // ============================================
  showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span class="notification-message">${message}</span>
      <button class="notification-close" aria-label="Close notification">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
    
    // Styles
    Object.assign(notification.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '1rem 1.5rem',
      borderRadius: '12px',
      color: 'white',
      fontWeight: '500',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      zIndex: '9999',
      transform: 'translateX(120%)',
      transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      maxWidth: '400px',
      background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'
    });
    
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn?.addEventListener('click', () => {
      notification.style.transform = 'translateX(120%)';
      setTimeout(() => notification.remove(), 300);
    });
    
    // Animate in
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
    });
    
    // Auto remove
    setTimeout(() => {
      notification.style.transform = 'translateX(120%)';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  },

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// ============================================
// INITIALIZE WHEN DOM IS READY
// ============================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

// ============================================
// EXPORT FOR TESTING (if module system exists)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
}
