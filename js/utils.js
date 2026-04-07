/**
 * MegaHTML Pro - Utility Functions
 * Helper functions for common tasks
 */

const Utils = {
  // ============================================
  // DOM Helpers
  // ============================================
  
  // Select element(s)
  $(selector, context = document) {
    return context.querySelector(selector);
  },
  
  $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
  },
  
  // Create element with attributes
  createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else if (key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        element.setAttribute(key, value);
      }
    });
    
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
    
    return element;
  },
  
  // Add/remove/toggle classes
  addClass(element, ...classes) {
    element?.classList.add(...classes);
    return element;
  },
  
  removeClass(element, ...classes) {
    element?.classList.remove(...classes);
    return element;
  },
  
  toggleClass(element, className, force) {
    return element?.classList.toggle(className, force);
  },
  
  hasClass(element, className) {
    return element?.classList.contains(className);
  },
  
  // ============================================
  // Event Helpers
  // ============================================
  
  // Debounce function
  debounce(func, wait = 250, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const context = this;
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  },
  
  // Throttle function
  throttle(func, limit = 250) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  // Once function
  once(func) {
    let called = false;
    return function(...args) {
      if (!called) {
        called = true;
        return func.apply(this, args);
      }
    };
  },
  
  // ============================================
  // String Helpers
  // ============================================
  
  // Capitalize first letter
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  
  // Camel case to kebab case
  kebabCase(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  },
  
  // Slugify string
  slugify(str) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },
  
  // Truncate string
  truncate(str, length = 100, suffix = '...') {
    if (str.length <= length) return str;
    return str.substring(0, length).trim() + suffix;
  },
  
  // Format number with commas
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },
  
  // ============================================
  // Validation Helpers
  // ============================================
  
  // Validate email
  isEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  // Validate URL
  isURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  // Validate phone (basic)
  isPhone(phone) {
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return re.test(phone);
  },
  
  // Check if empty
  isEmpty(value) {
    if (value == null) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  },
  
  // ============================================
  // Storage Helpers
  // ============================================
  
  // LocalStorage wrapper
  storage: {
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch {
        return defaultValue;
      }
    },
    
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },
    
    remove(key) {
      localStorage.removeItem(key);
    },
    
    clear() {
      localStorage.clear();
    }
  },
  
  // SessionStorage wrapper
  session: {
    get(key, defaultValue = null) {
      try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch {
        return defaultValue;
      }
    },
    
    set(key, value) {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },
    
    remove(key) {
      sessionStorage.removeItem(key);
    }
  },
  
  // ============================================
  // Date Helpers
  // ============================================
  
  // Format date
  formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day);
  },
  
  // Time ago
  timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
    
    return 'Just now';
  },
  
  // ============================================
  // Scroll Helpers
  // ============================================
  
  // Scroll to element
  scrollTo(element, offset = 0, behavior = 'smooth') {
    const target = typeof element === 'string' 
      ? document.querySelector(element) 
      : element;
      
    if (target) {
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior });
    }
  },
  
  // Get scroll position
  getScrollPosition() {
    return {
      x: window.pageXOffset,
      y: window.pageYOffset
    };
  },
  
  // ============================================
  // Copy to Clipboard
  // ============================================
  
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      
      try {
        document.execCommand('copy');
        return true;
      } catch {
        return false;
      } finally {
        document.body.removeChild(textarea);
      }
    }
  },
  
  // ============================================
  // Device Detection
  // ============================================
  
  isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
  
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}
