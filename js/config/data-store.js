/**
 * BookNest Unified Data Layer
 * Bridges Firebase Firestore & Local Persistent Storage seamlessly.
 */

const BookNestDataStore = {
  storageKeys: {
    books: 'booknest_books',
    categories: 'booknest_categories',
    users: 'booknest_users',
    listings: 'booknest_listings',
    orders: 'booknest_orders',
    rentals: 'booknest_rentals',
    cart: 'booknest_cart',
    notifications: 'booknest_notifications',
    seeded: 'booknest_seeded_flag'
  },

  /**
   * Initialize Local Data Store with Seed Data if empty
   */
  init() {
    const isSeeded = localStorage.getItem(this.storageKeys.seeded);
    if (!isSeeded && window.BookNestSeedData) {
      this.resetToSeedData();
    }
  },

  /**
   * Force Reset to Seed Data
   */
  resetToSeedData() {
    if (!window.BookNestSeedData) return;
    localStorage.setItem(this.storageKeys.categories, JSON.stringify(BookNestSeedData.categories));
    localStorage.setItem(this.storageKeys.books, JSON.stringify(BookNestSeedData.books));
    localStorage.setItem(this.storageKeys.users, JSON.stringify(BookNestSeedData.users));
    localStorage.setItem(this.storageKeys.listings, JSON.stringify(BookNestSeedData.listings));
    localStorage.setItem(this.storageKeys.orders, JSON.stringify(BookNestSeedData.orders));
    localStorage.setItem(this.storageKeys.rentals, JSON.stringify(BookNestSeedData.rentals));
    localStorage.setItem(this.storageKeys.cart, JSON.stringify({}));
    localStorage.setItem(this.storageKeys.seeded, 'true');
    console.log('BookNest: Data store reset to initial seed data.');
  },

  // Helper local storage wrappers
  _get(key, defaultValue = []) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key}:`, e);
      return defaultValue;
    }
  },

  _set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error(`Error saving ${key}:`, e);
    }
  },

  /* ==========================================================================
     BOOKS OPERATIONS
     ========================================================================== */
  async getBooks(filters = {}) {
    let books = this._get(this.storageKeys.books, []);
    
    // Status filter
    if (filters.status) {
      books = books.filter(b => b.status === filters.status);
    } else {
      // By default show approved books to regular users
      if (!filters.includeAllStatus) {
        books = books.filter(b => b.status === 'approved');
      }
    }

    // Category filter
    if (filters.categoryId) {
      books = books.filter(b => b.categoryId === filters.categoryId);
    }

    // Subject filter
    if (filters.subject) {
      books = books.filter(b => b.subject && b.subject.toLowerCase() === filters.subject.toLowerCase());
    }

    // Semester filter
    if (filters.semester) {
      books = books.filter(b => b.semester === filters.semester);
    }

    // Condition filter
    if (filters.condition) {
      books = books.filter(b => b.condition === filters.condition);
    }

    // Availability filter (buy or rent)
    if (filters.rentOnly) {
      books = books.filter(b => b.rentEnabled === true && b.availableStock > 0);
    }
    if (filters.inStockOnly) {
      books = books.filter(b => b.availableStock > 0);
    }

    // Search query
    if (filters.query) {
      const q = filters.query.toLowerCase().trim();
      books = books.filter(b => 
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.author && b.author.toLowerCase().includes(q)) ||
        (b.isbn && b.isbn.toLowerCase().includes(q)) ||
        (b.subject && b.subject.toLowerCase().includes(q))
      );
    }

    // Price range
    if (filters.minPrice !== undefined) {
      books = books.filter(b => b.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice !== undefined && Number(filters.maxPrice) > 0) {
      books = books.filter(b => b.price <= Number(filters.maxPrice));
    }

    // Sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-low':
          books.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          books.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          books.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'popular':
          books.sort((a, b) => (b.stock - b.availableStock) - (a.stock - a.availableStock));
          break;
        default:
          break;
      }
    }

    return books;
  },

  async getBookById(id) {
    if (!id) return null;
    let books = this._get(this.storageKeys.books, []);
    if (books.length === 0 && window.BookNestSeedData) {
      books = BookNestSeedData.books;
      this._set(this.storageKeys.books, books);
    }
    const cleanId = String(id).trim();
    return books.find(b => String(b.id).trim() === cleanId) || null;
  },

  async addBook(bookData) {
    const books = this._get(this.storageKeys.books, []);
    const newBook = {
      id: 'book-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      availableStock: bookData.stock || 1,
      status: bookData.status || 'approved',
      images: bookData.images && bookData.images.length > 0 ? bookData.images : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'],
      ...bookData
    };
    books.unshift(newBook);
    this._set(this.storageKeys.books, books);
    return newBook;
  },

  async updateBook(id, updateData) {
    const books = this._get(this.storageKeys.books, []);
    const idx = books.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Book not found');
    
    books[idx] = {
      ...books[idx],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    this._set(this.storageKeys.books, books);
    return books[idx];
  },

  async deleteBook(id) {
    let books = this._get(this.storageKeys.books, []);
    books = books.filter(b => b.id !== id);
    this._set(this.storageKeys.books, books);
    return true;
  },

  /* ==========================================================================
     CATEGORIES OPERATIONS
     ========================================================================== */
  async getCategories() {
    return this._get(this.storageKeys.categories, []);
  },

  async addCategory(data) {
    const categories = this._get(this.storageKeys.categories, []);
    const newCategory = {
      id: 'cat-' + Date.now(),
      slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      ...data
    };
    categories.push(newCategory);
    this._set(this.storageKeys.categories, categories);
    return newCategory;
  },

  async updateCategory(id, data) {
    const categories = this._get(this.storageKeys.categories, []);
    const idx = categories.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Category not found');
    categories[idx] = { ...categories[idx], ...data };
    this._set(this.storageKeys.categories, categories);
    return categories[idx];
  },

  async deleteCategory(id) {
    let categories = this._get(this.storageKeys.categories, []);
    categories = categories.filter(c => c.id !== id);
    this._set(this.storageKeys.categories, categories);
    return true;
  },

  /* ==========================================================================
     LISTINGS (Student Peer-to-Peer Selling)
     ========================================================================== */
  async getListings(filters = {}) {
    let listings = this._get(this.storageKeys.listings, []);
    if (filters.sellerId) {
      listings = listings.filter(l => l.sellerId === filters.sellerId);
    }
    if (filters.status && filters.status !== 'all') {
      listings = listings.filter(l => l.status === filters.status);
    }
    return listings;
  },

  async submitListing(listingData) {
    const listings = this._get(this.storageKeys.listings, []);
    const newListing = {
      id: 'list-' + Date.now(),
      status: 'pending',
      rejectionReason: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...listingData
    };
    listings.unshift(newListing);
    this._set(this.storageKeys.listings, listings);
    return newListing;
  },

  async updateListingStatus(listingId, status, rejectionReason = '') {
    const listings = this._get(this.storageKeys.listings, []);
    const idx = listings.findIndex(l => l.id === listingId);
    if (idx === -1) throw new Error('Listing not found');

    listings[idx].status = status;
    listings[idx].rejectionReason = rejectionReason;
    listings[idx].updatedAt = new Date().toISOString();
    this._set(this.storageKeys.listings, listings);

    // If approved, automatically add as a book in the public catalog
    if (status === 'approved') {
      const listing = listings[idx];
      await this.addBook({
        title: listing.title,
        author: listing.author,
        isbn: listing.isbn || '',
        categoryId: listing.categoryId,
        categoryName: listing.categoryName || 'General',
        subject: listing.subject || '',
        semester: listing.semester || '',
        description: listing.description,
        price: listing.price,
        rentalPrice: listing.rentalPrice || 0,
        stock: listing.quantity || 1,
        availableStock: listing.quantity || 1,
        condition: listing.condition,
        rentEnabled: listing.rentEnabled || false,
        sellerId: listing.sellerId,
        sellerName: listing.sellerName,
        images: listing.images,
        status: 'approved'
      });
    }

    return listings[idx];
  },

  /* ==========================================================================
     ORDERS & CHECKOUT
     ========================================================================== */
  async getOrders(userId = null) {
    let orders = this._get(this.storageKeys.orders, []);
    if (userId) {
      orders = orders.filter(o => o.userId === userId);
    }
    return orders;
  },

  async getOrderById(id) {
    const orders = this._get(this.storageKeys.orders, []);
    return orders.find(o => o.id === id) || null;
  },

  async createOrder(orderData) {
    const orders = this._get(this.storageKeys.orders, []);
    const newOrder = {
      id: 'ORD-' + Math.floor(10000 + Math.random() * 90000),
      status: 'Pending',
      paymentStatus: 'Paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...orderData
    };

    // Deduct available stock for purchased books
    for (const item of newOrder.items) {
      const book = await this.getBookById(item.bookId);
      if (book) {
        const newAvailable = Math.max(0, (book.availableStock || 0) - item.quantity);
        await this.updateBook(book.id, { availableStock: newAvailable });
      }
    }

    orders.unshift(newOrder);
    this._set(this.storageKeys.orders, orders);
    return newOrder;
  },

  async updateOrderStatus(orderId, newStatus) {
    const orders = this._get(this.storageKeys.orders, []);
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) throw new Error('Order not found');

    orders[idx].status = newStatus;
    orders[idx].updatedAt = new Date().toISOString();
    this._set(this.storageKeys.orders, orders);
    return orders[idx];
  },

  /* ==========================================================================
     RENTAL SYSTEM
     ========================================================================== */
  async getRentals(userId = null) {
    let rentals = this._get(this.storageKeys.rentals, []);
    if (userId) {
      rentals = rentals.filter(r => r.userId === userId);
    }
    return rentals;
  },

  async getRentalById(id) {
    const rentals = this._get(this.storageKeys.rentals, []);
    return rentals.find(r => r.id === id) || null;
  },

  async createRental(rentalData) {
    const rentals = this._get(this.storageKeys.rentals, []);
    const durationDays = rentalData.durationDays || 30;
    const now = new Date();
    const dueDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const newRental = {
      id: 'RNT-' + Math.floor(10000 + Math.random() * 90000),
      issueDate: now.toISOString(),
      dueDate: dueDate.toISOString(),
      returnDate: null,
      status: 'Active',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      ...rentalData
    };

    // Deduct available stock
    const book = await this.getBookById(newRental.bookId);
    if (book) {
      const newAvailable = Math.max(0, (book.availableStock || 0) - 1);
      await this.updateBook(book.id, { availableStock: newAvailable });
    }

    rentals.unshift(newRental);
    this._set(this.storageKeys.rentals, rentals);
    return newRental;
  },

  async returnRental(rentalId) {
    const rentals = this._get(this.storageKeys.rentals, []);
    const idx = rentals.findIndex(r => r.id === rentalId);
    if (idx === -1) throw new Error('Rental not found');

    const rental = rentals[idx];
    rental.status = 'Returned';
    rental.returnDate = new Date().toISOString();
    rental.updatedAt = new Date().toISOString();

    // Restock the book
    const book = await this.getBookById(rental.bookId);
    if (book) {
      const newAvailable = Math.min(book.stock, (book.availableStock || 0) + 1);
      await this.updateBook(book.id, { availableStock: newAvailable });
    }

    this._set(this.storageKeys.rentals, rentals);
    return rental;
  },

  /* ==========================================================================
     USERS & AUTH PROFILE
     ========================================================================== */
  async getUsers() {
    return this._get(this.storageKeys.users, []);
  },

  async getUserById(uid) {
    const users = this._get(this.storageKeys.users, []);
    return users.find(u => u.uid === uid) || null;
  },

  async saveUser(userData) {
    const users = this._get(this.storageKeys.users, []);
    const idx = users.findIndex(u => u.uid === userData.uid);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...userData, updatedAt: new Date().toISOString() };
    } else {
      users.push({
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: 'student',
        status: 'active',
        ...userData
      });
    }
    this._set(this.storageKeys.users, users);
    return userData;
  },

  /* ==========================================================================
     CART MANAGEMENT
     ========================================================================== */
  getCart(userId) {
    const allCarts = this._get(this.storageKeys.cart, {});
    return allCarts[userId] || [];
  },

  saveCart(userId, items) {
    const allCarts = this._get(this.storageKeys.cart, {});
    allCarts[userId] = items;
    this._set(this.storageKeys.cart, allCarts);
    return items;
  },

  /* ==========================================================================
     ADMIN & ANALYTICS REPORTS
     ========================================================================== */
  async getDashboardMetrics() {
    const books = await this.getBooks({ includeAllStatus: true });
    const orders = await this.getOrders();
    const rentals = await this.getRentals();
    const listings = await this.getListings();
    const users = await this.getUsers();

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0) +
                         rentals.reduce((sum, r) => sum + (r.rentalPrice || 0), 0);

    const activeRentals = rentals.filter(r => r.status === 'Active' || r.status === 'Due Soon');
    const returnedRentals = rentals.filter(r => r.status === 'Returned');
    const pendingListings = listings.filter(l => l.status === 'pending');
    const lowStockBooks = books.filter(b => (b.availableStock || 0) <= 3);

    return {
      totalBooks: books.length,
      availableStock: books.reduce((sum, b) => sum + (b.availableStock || 0), 0),
      totalIssued: rentals.length,
      activeRentals: activeRentals.length,
      returnedRentals: returnedRentals.length,
      totalOrders: orders.length,
      totalRevenue,
      pendingListings: pendingListings.length,
      totalUsers: users.length,
      lowStockBooks,
      recentOrders: orders.slice(0, 5),
      recentRentals: rentals.slice(0, 5),
      recentListings: pendingListings.slice(0, 5)
    };
  }
};

// Initialize store
BookNestDataStore.init();
window.BookNestDataStore = BookNestDataStore;
