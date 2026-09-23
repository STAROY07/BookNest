/**
 * BookNest Global Application Script
 * Initializes shared header components, drawer events, and state synchronization.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Sync Navigation & Auth State
  BookNestApp.initHeader();
  BookNestRouter.highlightActiveLinks();
  BookNestCart.updateBadge();

  // Handle header scroll shadow
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }
});

const BookNestApp = {
  /**
   * Initialize Global Header & Navigation
   */
  initHeader() {
    const user = BookNestAuth.getCurrentUser();
    const navAuthContainer = document.getElementById('nav-auth-actions');
    const drawerAuthContainer = document.getElementById('drawer-auth-actions');

    if (navAuthContainer) {
      if (user) {
        navAuthContainer.innerHTML = `
          <div class="nav-profile-menu">
            <button class="profile-avatar-btn" id="nav-profile-btn" aria-label="User profile menu">
              <img src="${user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name) + '&background=1b4332&color=fff'}" alt="${user.name}" class="avatar-img" />
              <span style="font-weight: 600; font-size: 0.875rem; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${user.name.split(' ')[0]}</span>
              ${BookNestUI.getIcon('chevronDown', 14)}
            </button>
            <div class="profile-dropdown-content" id="nav-profile-dropdown">
              <div class="dropdown-header">
                <div class="dropdown-user-name">${user.name}</div>
                <div class="dropdown-user-email">${user.email}</div>
                <span class="badge ${user.role === 'admin' ? 'badge-primary' : 'badge-secondary'}" style="margin-top: 0.35rem;">${user.role.toUpperCase()}</span>
              </div>
              ${user.role === 'admin' ? `
                <a href="/admin/index.html" class="dropdown-item">
                  ${BookNestUI.getIcon('shield', 16)} Admin Panel
                </a>
              ` : ''}
              <a href="/profile.html" class="dropdown-item">
                ${BookNestUI.getIcon('user', 16)} My Profile
              </a>
              <a href="/orders.html" class="dropdown-item">
                ${BookNestUI.getIcon('package', 16)} My Orders
              </a>
              <a href="/rentals.html" class="dropdown-item">
                ${BookNestUI.getIcon('clock', 16)} My Rentals
              </a>
              <a href="/my-listings.html" class="dropdown-item">
                ${BookNestUI.getIcon('book', 16)} My Listings
              </a>
              <div class="dropdown-divider"></div>
              <a href="#" class="dropdown-item" onclick="BookNestAuth.logout(); return false;" style="color: var(--color-danger);">
                ${BookNestUI.getIcon('logout', 16)} Logout
              </a>
            </div>
          </div>
        `;

        // Toggle profile dropdown
        const btn = document.getElementById('nav-profile-btn');
        const dropdown = document.getElementById('nav-profile-dropdown');
        if (btn && dropdown) {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
          });
          document.addEventListener('click', () => dropdown.classList.remove('show'));
        }
      } else {
        navAuthContainer.innerHTML = `
          <a href="/login.html" class="btn btn-outline btn-sm">Login</a>
          <a href="/register.html" class="btn btn-primary btn-sm">Register</a>
        `;
      }
    }

    // Drawer Auth Actions
    if (drawerAuthContainer) {
      if (user) {
        drawerAuthContainer.innerHTML = `
          <div class="d-flex align-center gap-2 mb-3">
            <img src="${user.photoURL}" alt="${user.name}" class="avatar-img" />
            <div>
              <div style="font-weight: 700;">${user.name}</div>
              <div style="font-size: 0.8rem; color: var(--color-text-muted);">${user.email}</div>
            </div>
          </div>
          ${user.role === 'admin' ? `<a href="/admin/index.html" class="btn btn-primary btn-block btn-sm mb-2">${BookNestUI.getIcon('shield', 14)} Admin Panel</a>` : ''}
          <button class="btn btn-outline btn-block btn-sm" onclick="BookNestAuth.logout()">${BookNestUI.getIcon('logout', 14)} Logout</button>
        `;
      } else {
        drawerAuthContainer.innerHTML = `
          <a href="/login.html" class="btn btn-outline btn-block mb-2">Login</a>
          <a href="/register.html" class="btn btn-primary btn-block">Register</a>
        `;
      }
    }

    // Initialize Mobile Navigation Drawer Events
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const drawer = document.querySelector('.mobile-nav-drawer');
    const overlay = document.querySelector('.drawer-overlay');
    const drawerClose = document.querySelector('.drawer-close-btn');

    if (mobileToggle && drawer && overlay) {
      mobileToggle.onclick = () => {
        drawer.classList.add('open');
        overlay.classList.add('show');
      };
      const closeDrawer = () => {
        drawer.classList.remove('open');
        overlay.classList.remove('show');
      };
      overlay.onclick = closeDrawer;
      if (drawerClose) drawerClose.onclick = closeDrawer;
    }
  },

  /**
   * Handle global book search form submission
   */
  handleGlobalSearch(inputElementId) {
    const input = document.getElementById(inputElementId);
    if (!input) return;
    const query = input.value.trim();
    if (query) {
      window.location.href = `/browse-books.html?q=${encodeURIComponent(query)}`;
    }
  }
};

window.BookNestApp = BookNestApp;
