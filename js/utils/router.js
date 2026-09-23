/**
 * BookNest Router & URL Helper Utilities
 */

const BookNestRouter = {
  /**
   * Get query parameter from URL
   */
  getParam(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  },

  /**
   * Set or update query parameters in current URL without reloading
   */
  setParams(paramObj) {
    const url = new URL(window.location.href);
    Object.keys(paramObj).forEach(key => {
      if (paramObj[key] === null || paramObj[key] === undefined || paramObj[key] === '') {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, paramObj[key]);
      }
    });
    window.history.replaceState({}, '', url.toString());
  },

  /**
   * Highlight current active page link in navigation
   */
  highlightActiveLinks() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link, .drawer-link, .admin-nav-item').forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href === currentPath || href.endsWith(currentPath) || (currentPath === '' && href === 'index.html'))) {
        link.classList.add('active');
      }
    });
  }
};

window.BookNestRouter = BookNestRouter;
