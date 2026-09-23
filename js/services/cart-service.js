/**
 * BookNest Cart Service
 * Persistent student shopping cart supporting both book purchase and book rental.
 */

const BookNestCart = {
  getUserId() {
    const user = BookNestAuth.getCurrentUser();
    return user ? user.uid : 'guest';
  },

  getItems() {
    return BookNestDataStore.getCart(this.getUserId());
  },

  addItem(book, type = 'buy', quantity = 1) {
    let items = this.getItems();
    const existingIndex = items.findIndex(item => item.bookId === book.id && item.type === type);

    const price = type === 'rent' ? (book.rentalPrice || 0) : book.price;

    if (existingIndex > -1) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({
        id: 'cart-item-' + Date.now(),
        bookId: book.id,
        title: book.title,
        author: book.author,
        price: price,
        type: type, // 'buy' or 'rent'
        rentalDurationDays: type === 'rent' ? (book.returnDurationDays || 30) : null,
        image: book.images && book.images[0] ? book.images[0] : BookNestUI.getBookPlaceholderSvg(book.title),
        quantity: quantity,
        maxStock: book.availableStock || 10
      });
    }

    BookNestDataStore.saveCart(this.getUserId(), items);
    this.updateBadge();
    BookNestUI.showToast(`"${book.title}" added to your ${type === 'rent' ? 'rental' : 'shopping'} cart!`, 'success');
    return items;
  },

  updateQuantity(bookId, type, quantity) {
    let items = this.getItems();
    const item = items.find(i => i.bookId === bookId && i.type === type);
    if (!item) return items;

    if (quantity <= 0) {
      return this.removeItem(bookId, type);
    }

    item.quantity = Math.min(quantity, item.maxStock || 99);
    BookNestDataStore.saveCart(this.getUserId(), items);
    this.updateBadge();
    return items;
  },

  removeItem(bookId, type) {
    let items = this.getItems();
    items = items.filter(i => !(i.bookId === bookId && i.type === type));
    BookNestDataStore.saveCart(this.getUserId(), items);
    this.updateBadge();
    BookNestUI.showToast('Item removed from cart.', 'info');
    return items;
  },

  clearCart() {
    BookNestDataStore.saveCart(this.getUserId(), []);
    this.updateBadge();
  },

  getTotals() {
    const items = this.getItems();
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = subtotal > 0 ? 0 : 0; // Campus pickup is free
    const total = subtotal + deliveryFee;

    return {
      subtotal,
      deliveryFee,
      total,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
    };
  },

  updateBadge() {
    const badges = document.querySelectorAll('.cart-count-badge');
    const totals = this.getTotals();
    badges.forEach(badge => {
      badge.textContent = totals.itemCount;
      badge.style.display = totals.itemCount > 0 ? 'flex' : 'none';
    });
  }
};

window.BookNestCart = BookNestCart;
