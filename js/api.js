/**
 * MegaHTML Pro - API Integration
 * HTTP Client for REST API calls
 */

class API {
  constructor(config = {}) {
    this.baseURL = config.baseURL || '';
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers
    };
    this.timeout = config.timeout || 10000;
    this.interceptors = {
      request: [],
      response: [],
      error: []
    };
  }
  
  // Add request interceptor
  addRequestInterceptor(callback) {
    this.interceptors.request.push(callback);
  }
  
  // Add response interceptor
  addResponseInterceptor(callback) {
    this.interceptors.response.push(callback);
  }
  
  // Add error interceptor
  addErrorInterceptor(callback) {
    this.interceptors.error.push(callback);
  }
  
  // Merge options with defaults
  mergeOptions(options = {}) {
    return {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers
      }
    };
  }
  
  // Execute request
  async request(url, options = {}) {
    const fullURL = this.baseURL + url;
    const mergedOptions = this.mergeOptions(options);
    
    // Apply request interceptors
    for (const interceptor of this.interceptors.request) {
      await interceptor(fullURL, mergedOptions);
    }
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    mergedOptions.signal = controller.signal;
    
    try {
      const response = await fetch(fullURL, mergedOptions);
      clearTimeout(timeoutId);
      
      // Handle non-OK responses
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.response = response;
        throw error;
      }
      
      // Parse response
      const data = await response.json();
      
      // Apply response interceptors
      for (const interceptor of this.interceptors.response) {
        await interceptor(data, response);
      }
      
      return {
        data,
        status: response.status,
        headers: response.headers
      };
      
    } catch (error) {
      // Apply error interceptors
      for (const interceptor of this.interceptors.error) {
        await interceptor(error);
      }
      throw error;
    }
  }
  
  // HTTP GET
  async get(url, options = {}) {
    return this.request(url, {
      method: 'GET',
      ...options
    });
  }
  
  // HTTP POST
  async post(url, data, options = {}) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    });
  }
  
  // HTTP PUT
  async put(url, data, options = {}) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    });
  }
  
  // HTTP PATCH
  async patch(url, data, options = {}) {
    return this.request(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options
    });
  }
  
  // HTTP DELETE
  async delete(url, options = {}) {
    return this.request(url, {
      method: 'DELETE',
      ...options
    });
  }
  
  // Upload file
  async upload(url, file, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            onProgress(progress);
          }
        });
      }
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            data: JSON.parse(xhr.response),
            status: xhr.status
          });
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      });
      
      xhr.addEventListener('error', () => reject(new Error('Network error')));
      xhr.addEventListener('abort', () => reject(new Error('Request aborted')));
      
      xhr.open('POST', this.baseURL + url);
      xhr.send(formData);
    });
  }
}

// Create default API instance
const api = new API();

// Contact Form API helper
const ContactAPI = {
  async submit(formData) {
    // Simulated API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Message sent successfully',
          data: formData
        });
      }, 1500);
    });
  }
};

// Newsletter API helper
const NewsletterAPI = {
  async subscribe(email) {
    return api.post('/api/newsletter/subscribe', { email });
  }
};

// Analytics API helper
const AnalyticsAPI = {
  track(event, data = {}) {
    // Send analytics data
    console.log('[Analytics]', event, data);
    
    // Example: Google Analytics 4
    if (window.gtag) {
      window.gtag('event', event, data);
    }
  },
  
  pageView(page) {
    this.track('page_view', { page });
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API, api, ContactAPI, NewsletterAPI, AnalyticsAPI };
}
