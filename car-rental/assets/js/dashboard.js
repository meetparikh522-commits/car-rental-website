document.addEventListener('DOMContentLoaded', () => {
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  const contentSections = document.querySelectorAll('.dashboard-content');

  let currentUser = null;

  // Initialize dashboard
  function initDashboard() {
    currentUser = getCurrentUser();

    if (!currentUser) {
      alert('Please login to access your dashboard');
      window.location.href = 'login.html';
      return;
    }

    // Set user name
    document.getElementById('user-name-display').textContent = currentUser.name || 'User';

    // Load profile
    loadProfile();

    // Load all data
    loadBookingHistory();
    loadWishlist();
    loadNotifications();
    loadReviews();
    loadLoyaltyPoints();
    loadPaymentHistory();
    loadAddresses();

    // Add notification badge
    updateNotificationBadge();
  }

  // Sidebar navigation
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.dataset.target;

      // Update active link
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Update active content
      contentSections.forEach(section => {
        section.classList.remove('active');
      });
      document.getElementById(targetId).classList.add('active');
    });
  });

  // Load and display profile
  function loadProfile() {
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-email').textContent = currentUser.email;

    document.getElementById('edit-profile-btn').addEventListener('click', () => {
      showProfileEditModal();
    });
  }

  // Show profile edit modal
  function showProfileEditModal() {
    const modalContent = `
      <form id="profile-edit-form">
        <div class="form-group">
          <label>Name</label>
          <input type="text" id="edit-name" value="${currentUser.name}" required>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="edit-email" value="${currentUser.email}" required>
        </div>
        <div class="form-group">
          <label>Phone</label>
          <input type="tel" id="edit-phone" value="${currentUser.phone || ''}">
        </div>
        <button type="submit" class="btn btn-primary">Save Changes</button>
      </form>
    `;

    Modal.show('Edit Profile', modalContent);

    document.getElementById('profile-edit-form').addEventListener('submit', (e) => {
      e.preventDefault();

      const users = Storage.get('users') || [];
      const userIndex = users.findIndex(u => u.id === currentUser.id);

      if (userIndex !== -1) {
        users[userIndex].name = document.getElementById('edit-name').value;
        users[userIndex].email = document.getElementById('edit-email').value;
        users[userIndex].phone = document.getElementById('edit-phone').value;

        Storage.set('users', users);

        currentUser = users[userIndex];
        setCurrentUser(currentUser);

        loadProfile();
        Toast.success('Profile updated successfully!');
        document.querySelector('.modal-overlay').remove();
      }
    });
  }

  // Load booking history
  function loadBookingHistory() {
    const bookings = getBookingsByUser(currentUser.id);
    const listContainer = document.getElementById('booking-history-list');

    if (bookings.length === 0) {
      listContainer.innerHTML = '<p class="empty-message">No bookings yet. <a href="cars.html">Start booking now!</a></p>';
      return;
    }

    const cars = CarAPI.getCars();
    listContainer.innerHTML = bookings.map(booking => {
      const car = cars.find(c => c.id == booking.carId);
      const bookingDate = new Date(booking.pickupDate);
      const isUpcoming = bookingDate > new Date();
      const statusClass = `status-${booking.status}`;

      return `
        <div class="booking-card ${statusClass}">
          <div class="booking-header">
            <h3>${car?.name || 'Unknown Car'}</h3>
            <span class="status-badge">${booking.status.toUpperCase()}</span>
          </div>
          <div class="booking-details">
            <p><i class="fas fa-calendar"></i> ${formatDate(booking.pickupDate)} - ${formatDate(booking.dropoffDate)}</p>
            <p><i class="fas fa-map-marker-alt"></i> ${booking.pickupLocation} → ${booking.dropoffLocation}</p>
            <p><i class="fas fa-money-bill"></i> ${formatCurrency(booking.totalPrice)}</p>
          </div>
          <div class="booking-actions">
            <button class="btn btn-small" onclick="viewBookingDetails('${booking.id}')">View Details</button>
            ${booking.status === 'confirmed' && isUpcoming ? `
              <button class="btn btn-small btn-danger" onclick="cancelBooking('${booking.id}')">Cancel</button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // Load wishlist
  function loadWishlist() {
    const wishlistData = Storage.get('wishlist') || [];
    const userWishlist = wishlistData.filter(w => w.userId === currentUser.id);
    const cars = CarAPI.getCars();

    const container = document.getElementById('wishlist-items');

    if (userWishlist.length === 0) {
      container.innerHTML = '<p class="empty-message">Your wishlist is empty. <a href="cars.html">Add cars to your wishlist</a></p>';
      return;
    }

    container.innerHTML = userWishlist.map(item => {
      const car = cars.find(c => c.id === item.carId);
      if (!car) return '';

      return `
        <div class="car-card">
          <div class="car-image-wrapper">
            <img src="${car.image}" alt="${car.name}">
          </div>
          <div class="car-card-content">
            <h3>${car.name}</h3>
            <p class="price">${formatCurrency(car.price)}/day</p>
            <div class="car-details">
              <span><i class="fas fa-gas-pump"></i> ${car.fuel}</span>
              <span><i class="fas fa-couch"></i> ${car.seats}</span>
            </div>
            <button class="btn btn-primary" onclick="window.location.href='booking.html?car_id=${car.id}'">Book Now</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Load notifications
  function loadNotifications() {
    const notifications = getNotificationsByUser(currentUser.id);
    const container = document.getElementById('notifications-list');

    if (notifications.length === 0) {
      container.innerHTML = '<li class="empty-message">No notifications</li>';
      return;
    }

    container.innerHTML = notifications.map(notif => `
      <li class="notification-item ${notif.read ? 'read' : 'unread'}">
        <div class="notification-content">
          <h4>${notif.title}</h4>
          <p>${notif.message}</p>
          <small>${getRelativeTime(notif.createdAt)}</small>
        </div>
        <button class="btn-close" onclick="deleteNotification('${notif.id}')">×</button>
      </li>
    `).join('');
  }

  // Load reviews
  function loadReviews() {
    const allReviews = Storage.get('reviews') || [];
    const userReviews = allReviews.filter(r => r.userId === currentUser.id);
    const cars = CarAPI.getCars();

    const container = document.getElementById('reviews-list');

    if (userReviews.length === 0) {
      container.innerHTML = '<p class="empty-message">No reviews yet. <a href="cars.html">Book and review cars!</a></p>';
      return;
    }

    container.innerHTML = userReviews.map(review => {
      const car = cars.find(c => c.id == review.carId);
      return `
        <div class="review-card">
          <h4>${car?.name || 'Unknown Car'}</h4>
          <div class="rating">
            ${'⭐'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
          </div>
          <p><strong>${review.title}</strong></p>
          <p>${review.comment}</p>
          <small>${formatDate(review.createdAt)}</small>
        </div>
      `;
    }).join('');
  }

  // Load loyalty points
  function loadLoyaltyPoints() {
    const points = getUserLoyaltyPoints(currentUser.id);
    document.getElementById('loyalty-points').textContent = points;

    // Show VIP status
    if (points >= 500) {
      const card = document.querySelector('.loyalty-card');
      if (card) {
        const vipBadge = document.createElement('p');
        vipBadge.className = 'vip-badge';
        vipBadge.textContent = '🏆 VIP Member';
        card.appendChild(vipBadge);
      }
    }
  }

  // Load payment history
  function loadPaymentHistory() {
    const payments = Storage.get('payments') || [];
    const userPayments = payments.filter(p => {
      const booking = getBookingById(p.bookingId);
      return booking && booking.userId === currentUser.id;
    });

    const container = document.getElementById('payments-list');

    if (userPayments.length === 0) {
      container.innerHTML = '<p class="empty-message">No payment history</p>';
      return;
    }

    container.innerHTML = `
      <table class="payments-table">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${userPayments.map(payment => `
            <tr>
              <td>${payment.transactionId}</td>
              <td>${formatDate(payment.createdAt, 'short')}</td>
              <td>${formatCurrency(payment.amount)}</td>
              <td>${payment.method.toUpperCase()}</td>
              <td><span class="status-badge status-${payment.status}">${payment.status.toUpperCase()}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // Load saved addresses
  function loadAddresses() {
    const addresses = Storage.get('addresses') || [];
    const userAddresses = addresses.filter(a => a.userId === currentUser.id);

    const container = document.getElementById('addresses-list');

    if (userAddresses.length === 0) {
      container.innerHTML = '<p class="empty-message">No saved addresses yet.</p>';
      return;
    }

    container.innerHTML = userAddresses.map(addr => `
      <div class="address-card">
        <h4>${addr.label}</h4>
        <p>${addr.address}</p>
        ${addr.default ? '<span class="badge">Default</span>' : ''}
        <button class="btn-small" onclick="deleteAddress('${addr.id}')">Remove</button>
      </div>
    `).join('');
  }

  // Update notification badge
  function updateNotificationBadge() {
    const count = getUnreadNotificationCount(currentUser.id);
    if (count > 0) {
      const notificationLink = document.querySelector('[data-target="notifications"]');
      if (notificationLink) {
        notificationLink.innerHTML += `<span class="badge">${count}</span>`;
      }
    }
  }

  // Global functions for buttons
  window.viewBookingDetails = function(bookingId) {
    const booking = getBookingById(bookingId);
    if (booking) {
      const content = generateReceiptHTML(booking);
      Modal.show('Booking Details', content);
    }
  };

  window.cancelBooking = function(bookingId) {
    showConfirm(
      'Are you sure you want to cancel this booking? You may be eligible for a refund.',
      () => {
        const result = cancelBooking(bookingId);
        if (result) {
          Toast.success(`Booking cancelled. Refund: ${formatCurrency(result.refundAmount)}`);
          loadBookingHistory();
        }
      }
    );
  };

  window.deleteNotification = function(notifId) {
    deleteNotification(notifId);
    Toast.success('Notification deleted');
    loadNotifications();
  };

  window.deleteAddress = function(addrId) {
    const addresses = Storage.get('addresses') || [];
    const filtered = addresses.filter(a => a.id !== addrId);
    Storage.set('addresses', filtered);
    Toast.success('Address removed');
    loadAddresses();
  };

  // Add address button
  const addAddressBtn = document.getElementById('add-address-btn');
  if (addAddressBtn) {
    addAddressBtn.addEventListener('click', () => {
      const modalContent = `
        <form id="add-address-form">
          <div class="form-group">
            <label>Label (e.g., Home, Office)</label>
            <input type="text" id="addr-label" required>
          </div>
          <div class="form-group">
            <label>Address</label>
            <textarea id="addr-address" required></textarea>
          </div>
          <div class="form-group">
            <label><input type="checkbox" id="addr-default"> Set as default</label>
          </div>
          <button type="submit" class="btn btn-primary">Save Address</button>
        </form>
      `;

      Modal.show('Add New Address', modalContent);

      document.getElementById('add-address-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const addresses = Storage.get('addresses') || [];
        addresses.push({
          id: generateID(),
          userId: currentUser.id,
          label: document.getElementById('addr-label').value,
          address: document.getElementById('addr-address').value,
          default: document.getElementById('addr-default').checked,
          createdAt: new Date().toISOString()
        });

        Storage.set('addresses', addresses);
        Toast.success('Address saved!');
        const modal = document.querySelector('.modal-overlay');
        if (modal) modal.remove();
        loadAddresses();
      });
    });
  }

  // Initialize
  initDashboard();
});
