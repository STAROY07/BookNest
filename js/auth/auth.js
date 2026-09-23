/**
 * BookNest Authentication Service
 * Manages user credentials, role-based authorization, profile updates, and route guards.
 */

const BookNestAuth = {
  sessionKey: 'booknest_current_user',

  /**
   * Retrieve currently active authenticated user
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem(this.sessionKey);
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  isLoggedIn() {
    return !!this.getCurrentUser();
  },

  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  },

  /**
   * Register a new Student Account
   */
  async register(formData) {
    const { name, email, password, phone, college, course, year } = formData;

    if (!email || !password || !name) {
      throw new Error('Please fill in all required fields.');
    }

    // Check if email already exists
    const users = await BookNestDataStore.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }

    const newUser = {
      uid: 'user-' + Date.now(),
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      college: college || 'General Engineering College',
      course: course || 'Computer Science',
      year: year || '1st Year',
      role: 'student',
      status: 'active',
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1b4332&color=fff&size=200`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // If live Firebase auth is active, register there
    if (window.BookNestFirebase && window.BookNestFirebase.isLive && window.BookNestFirebase.auth) {
      try {
        const userCred = await window.BookNestFirebase.auth.createUserWithEmailAndPassword(email, password);
        newUser.uid = userCred.user.uid;
      } catch (fbErr) {
        console.warn('Firebase Live Auth notice:', fbErr.message);
      }
    }

    await BookNestDataStore.saveUser(newUser);
    localStorage.setItem(this.sessionKey, JSON.stringify(newUser));
    return newUser;
  },

  /**
   * Sign In User
   */
  async login(email, password) {
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    const users = await BookNestDataStore.getUsers();
    const cleanEmail = email.toLowerCase().trim();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      throw new Error('Invalid email or password. Check your credentials.');
    }

    if (user.status === 'suspended') {
      throw new Error('This account has been suspended. Contact campus admin.');
    }

    // Live Firebase Auth attempt
    if (window.BookNestFirebase && window.BookNestFirebase.isLive && window.BookNestFirebase.auth) {
      try {
        await window.BookNestFirebase.auth.signInWithEmailAndPassword(cleanEmail, password);
      } catch (fbErr) {
        console.warn('Firebase Live Signin notice:', fbErr.message);
      }
    }

    localStorage.setItem(this.sessionKey, JSON.stringify(user));
    return user;
  },

  /**
   * Sign Out
   */
  async logout() {
    if (window.BookNestFirebase && window.BookNestFirebase.isLive && window.BookNestFirebase.auth) {
      try {
        await window.BookNestFirebase.auth.signOut();
      } catch (e) {}
    }
    localStorage.removeItem(this.sessionKey);
    window.location.href = '/login.html';
  },

  /**
   * Password Reset Flow
   */
  async sendPasswordReset(email) {
    if (!email) throw new Error('Please provide your registered email address.');
    const users = await BookNestDataStore.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      throw new Error('No account found associated with this email.');
    }

    if (window.BookNestFirebase && window.BookNestFirebase.isLive && window.BookNestFirebase.auth) {
      try {
        await window.BookNestFirebase.auth.sendPasswordResetEmail(email);
      } catch (e) {
        console.warn('Firebase reset email notice:', e.message);
      }
    }

    return true;
  },

  /**
   * Update Profile Details & Photo
   */
  async updateProfile(updates) {
    const user = this.getCurrentUser();
    if (!user) throw new Error('You must be logged in to update your profile.');

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await BookNestDataStore.saveUser(updatedUser);
    localStorage.setItem(this.sessionKey, JSON.stringify(updatedUser));
    return updatedUser;
  },

  /**
   * Route Guard: Requires Authenticated User
   */
  requireAuth(redirectUrl = '/login.html') {
    if (!this.isLoggedIn()) {
      const current = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `${redirectUrl}?redirect=${current}`;
      return false;
    }
    return true;
  },

  /**
   * Route Guard: Requires Admin Role
   */
  requireAdmin(redirectUrl = '/login.html') {
    if (!this.isLoggedIn()) {
      window.location.href = redirectUrl;
      return false;
    }
    if (!this.isAdmin()) {
      alert('Unauthorized access: Administrator privilege is required.');
      window.location.href = '/index.html';
      return false;
    }
    return true;
  }
};

window.BookNestAuth = BookNestAuth;
