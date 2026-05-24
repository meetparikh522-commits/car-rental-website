// ===== UTILITY FUNCTIONS FOR LUXEGO CAR RENTAL =====

// Storage Helpers
const Storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
      return false;
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  },
  clear: () => localStorage.clear()
};

// ID Generation
const generateID = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Currency Formatting
const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Date Formatting
const formatDate = (date, format = 'short') => {
  if (typeof date === 'string') {
    date = new Date(date);
  }

  const options = {
    short: { year: '2-digit', month: '2-digit', day: '2-digit' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit', hour12: true },
    datetime: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  };

  return date.toLocaleDateString('en-US', options[format] || options.short);
};

// Get number of days between two dates
const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays || 1;
};

// Get car by ID
const getCarById = (carId) => {
  const cars = Storage.get('cars') || [];
  return cars.find(car => car.id == carId) || null;
};

// Get all cars
const getAllCars = () => {
  return Storage.get('cars') || [];
};

// Get bookings by user ID
const getBookingsByUser = (userId) => {
  const bookings = Storage.get('bookings') || [];
  return bookings.filter(booking => booking.userId === userId);
};

// Get all bookings
const getAllBookings = () => {
  return Storage.get('bookings') || [];
};

// Get reviews for a car
const getReviewsByCarId = (carId) => {
  const reviews = Storage.get('reviews') || [];
  return reviews.filter(review => review.carId == carId);
};

// Calculate average rating for a car
const calculateAverageRating = (carId) => {
  const reviews = getReviewsByCarId(carId);
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
  return (sum / reviews.length).toFixed(1);
};

// Get current user
const getCurrentUser = () => {
  return Storage.get('currentUser') || null;
};

// Set current user
const setCurrentUser = (user) => {
  return Storage.set('currentUser', user);
};

// Get all notifications for user
const getNotificationsByUser = (userId) => {
  const notifications = Storage.get('notifications') || [];
  return notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Add notification
const addNotification = (userId, type, title, message) => {
  const notifications = Storage.get('notifications') || [];
  const notification = {
    id: generateID(),
    userId,
    type,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString()
  };
  notifications.push(notification);
  Storage.set('notifications', notifications);
  return notification;
};

// Mark notification as read
const markNotificationAsRead = (notificationId) => {
  const notifications = Storage.get('notifications') || [];
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
    Storage.set('notifications', notifications);
  }
  return notification;
};

// Delete notification
const deleteNotification = (notificationId) => {
  const notifications = Storage.get('notifications') || [];
  const filtered = notifications.filter(n => n.id !== notificationId);
  Storage.set('notifications', filtered);
};

// Get unread notification count
const getUnreadNotificationCount = (userId) => {
  const notifications = getNotificationsByUser(userId);
  return notifications.filter(n => !n.read).length;
};

// Toast Notification System
const Toast = {
  show: (message, type = 'info', duration = 3000) => {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.animation = 'slideIn 0.3s ease-in-out';

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in-out';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
  success: (message, duration) => Toast.show(message, 'success', duration),
  error: (message, duration) => Toast.show(message, 'error', duration),
  info: (message, duration) => Toast.show(message, 'info', duration),
  warning: (message, duration) => Toast.show(message, 'warning', duration)
};

// Create toast container if it doesn't exist
const createToastContainer = () => {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
  `;
  document.body.appendChild(container);

  // Add toast styles if not already added
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      .toast {
        padding: 12px 16px;
        border-radius: 4px;
        color: white;
        font-weight: 500;
        min-width: 250px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }
      .toast-success {
        background-color: #10b981;
      }
      .toast-error {
        background-color: #ef4444;
      }
      .toast-info {
        background-color: #3b82f6;
      }
      .toast-warning {
        background-color: #f59e0b;
      }
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  return container;
};

// Modal System
const Modal = {
  show: (title, content, options = {}) => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'modal-' + generateID();

    const buttons = options.buttons || [
      { text: 'Cancel', type: 'secondary', onclick: () => modal.remove() },
      { text: 'OK', type: 'primary', onclick: () => modal.remove() }
    ];

    const buttonsHtml = buttons.map(btn =>
      `<button class="btn btn-${btn.type}" data-action="${btn.text}">${btn.text}</button>`
    ).join('');

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
        <div class="modal-footer">
          ${buttonsHtml}
        </div>
      </div>
    `;

    // Add styles
    if (!document.getElementById('modal-styles')) {
      const style = document.createElement('style');
      style.id = 'modal-styles';
      style.textContent = `
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9998;
        }
        .modal-content {
          background: var(--card-background);
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          overflow: hidden;
        }
        .modal-header {
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-header h2 {
          margin: 0;
          font-size: 1.3rem;
        }
        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--text-muted);
        }
        .modal-body {
          padding: 20px;
        }
        .modal-footer {
          padding: 20px;
          border-top: 1px solid var(--border-color);
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(modal);

    // Event listeners for buttons
    buttons.forEach((btn, index) => {
      const btnElement = modal.querySelectorAll('button')[index + 1];
      if (btnElement && btn.onclick) {
        btnElement.addEventListener('click', () => {
          btn.onclick();
          modal.remove();
        });
      }
    });

    // Close button
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());

    return modal;
  }
};

// Confirm Dialog
const showConfirm = (message, onConfirm, onCancel) => {
  Modal.show('Confirm', message, {
    buttons: [
      { text: 'Cancel', type: 'secondary', onclick: onCancel || (() => {}) },
      { text: 'Confirm', type: 'primary', onclick: onConfirm }
    ]
  });
};

// Calculate loyalty points (1 point per Rs. 10 spent)
const calculateLoyaltyPoints = (amount) => {
  return Math.floor(amount / 10);
};

// Get user loyalty points
const getUserLoyaltyPoints = (userId) => {
  const users = Storage.get('users') || [];
  const user = users.find(u => u.id === userId);
  return user ? user.loyaltyPoints || 0 : 0;
};

// Add loyalty points to user
const addLoyaltyPoints = (userId, points) => {
  const users = Storage.get('users') || [];
  const user = users.find(u => u.id === userId);
  if (user) {
    user.loyaltyPoints = (user.loyaltyPoints || 0) + points;
    Storage.set('users', users);
    return user.loyaltyPoints;
  }
  return 0;
};

// Validate booking dates
const validateBookingDates = (pickupDate, dropoffDate) => {
  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropoffDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (pickup < today) return { valid: false, error: 'Pickup date must be in the future' };
  if (dropoff <= pickup) return { valid: false, error: 'Drop-off date must be after pickup date' };

  return { valid: true };
};

// Generate Transaction ID
const generateTransactionID = () => {
  const prefix = 'TXN';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Calculate refund based on cancellation policy
const calculateRefund = (bookingAmount, daysBeforeBooking) => {
  if (daysBeforeBooking >= 3) return bookingAmount * 0.9; // 90% refund
  if (daysBeforeBooking >= 1) return bookingAmount * 0.5; // 50% refund
  return 0; // No refund
};

// Format time (HH:MM)
const formatTime = (date) => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

// Get relative time (e.g., "2 hours ago")
const getRelativeTime = (date) => {
  if (typeof date === 'string') {
    date = new Date(date);
  }

  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

  return formatDate(date);
};

// Debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle function
const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

console.log('✓ Utilities loaded successfully');
