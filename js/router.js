/**
 * MegaHTML Pro - SPA Router
 * Single Page Application routing system
 */

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.beforeHooks = [];
    this.afterHooks = [];
    this.container = document.getElementById('app') || document.body;
    
    this.init();
  }
  
  init() {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', (e) => {
      this.handleRoute(window.location.pathname);
    });
    
    // Handle initial route
    document.addEventListener('DOMContentLoaded', () => {
      this.handleRoute(window.location.pathname);
    });
    
    // Intercept link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-router]');
      if (link) {
        e.preventDefault();
        this.navigate(link.getAttribute('href'));
      }
    });
  }
  
  // Register a route
  register(path, handler, options = {}) {
    this.routes[path] = {
      handler,
      options,
      params: this.extractParams(path)
    };
    return this;
  }
  
  // Extract route parameters
  extractParams(path) {
    const params = [];
    const regex = /:([^/]+)/g;
    let match;
    while ((match = regex.exec(path)) !== null) {
      params.push(match[1]);
    }
    return params;
  }
  
  // Navigate to a route
  navigate(path, options = {}) {
    // Run before hooks
    for (const hook of this.beforeHooks) {
      const result = hook(path, this.currentRoute);
      if (result === false) return; // Cancel navigation
    }
    
    // Update URL
    if (!options.replace) {
      window.history.pushState({}, '', path);
    } else {
      window.history.replaceState({}, '', path);
    }
    
    // Handle route
    this.handleRoute(path);
    
    // Run after hooks
    for (const hook of this.afterHooks) {
      hook(path, this.currentRoute);
    }
  }
  
  // Handle route change
  handleRoute(path) {
    // Find matching route
    const route = this.matchRoute(path);
    
    if (route) {
      this.currentRoute = route;
      
      // Call handler with params
      const params = this.parseParams(route.path, path);
      route.handler(params, route);
      
      // Update page title if specified
      if (route.options.title) {
        document.title = route.options.title;
      }
      
      // Scroll to top or specified element
      if (route.options.scrollTo) {
        const element = document.querySelector(route.options.scrollTo);
        element?.scrollIntoView({ behavior: 'smooth' });
      } else if (route.options.scrollToTop !== false) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // 404 handler
      this.handle404(path);
    }
  }
  
  // Match route with support for dynamic segments
  matchRoute(path) {
    // Exact match first
    if (this.routes[path]) {
      return { path, ...this.routes[path] };
    }
    
    // Try pattern matching
    for (const [routePath, routeData] of Object.entries(this.routes)) {
      const regex = new RegExp('^' + routePath.replace(/:([^/]+)/g, '([^/]+)') + '$');
      if (regex.test(path)) {
        return { path: routePath, ...routeData };
      }
    }
    
    return null;
  }
  
  // Parse URL parameters
  parseParams(routePath, actualPath) {
    const params = {};
    const routeParts = routePath.split('/');
    const actualParts = actualPath.split('/');
    
    routeParts.forEach((part, index) => {
      if (part.startsWith(':')) {
        const paramName = part.slice(1);
        params[paramName] = decodeURIComponent(actualParts[index]);
      }
    });
    
    return params;
  }
  
  // Handle 404
  handle404(path) {
    console.error(`Route not found: ${path}`);
    
    if (this.routes['/404']) {
      this.routes['/404'].handler({ path });
    } else {
      this.container.innerHTML = `
        <div style="text-align: center; padding: 100px 20px;">
          <h1>404 - Page Not Found</h1>
          <p>The page "${path}" does not exist.</p>
          <a href="/" data-router>Go Home</a>
        </div>
      `;
    }
  }
  
  // Add navigation guard
  beforeEach(callback) {
    this.beforeHooks.push(callback);
    return this;
  }
  
  // Add after navigation hook
  afterEach(callback) {
    this.afterHooks.push(callback);
    return this;
  }
  
  // Lazy load component
  async lazyLoad(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to load');
      return await response.text();
    } catch (error) {
      console.error('Lazy load error:', error);
      return '<p>Error loading content</p>';
    }
  }
  
  // Get current route info
  getCurrentRoute() {
    return this.currentRoute;
  }
  
  // Check if route is active
  isActive(path) {
    return window.location.pathname === path;
  }
}

// Create global router instance
const router = new Router();

// Example usage (commented out):
/*
router
  .register('/', () => {
    document.getElementById('content').innerHTML = '<h1>Home</h1>';
  }, { title: 'Home' })
  .register('/about', () => {
    document.getElementById('content').innerHTML = '<h1>About</h1>';
  }, { title: 'About Us' })
  .register('/user/:id', (params) => {
    document.getElementById('content').innerHTML = `<h1>User ${params.id}</h1>`;
  })
  .register('/404', () => {
    document.getElementById('content').innerHTML = '<h1>404 Not Found</h1>';
  });
*/

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Router;
}
