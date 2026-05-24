// Enhanced Payment Processing
const processPayment = (bookingData) => {
  const selectedPaymentMethod = bookingData.paymentMethod;
  const totalPrice = bookingData.totalPrice;

  // Show processing indicator
  Toast.info('Processing payment...');

  // Generate transaction ID
  const transactionID = generateTransactionID();

  // Simulate payment processing with 85% success rate
  setTimeout(() => {
    const isSuccess = Math.random() > 0.15;

    if (isSuccess) {
      // Save booking to localStorage
      const bookings = Storage.get('bookings') || [];
      const currentUser = getCurrentUser();

      const booking = {
        id: generateID(),
        userId: currentUser?.id || 'guest',
        carId: bookingData.carId,
        pickupDate: bookingData.pickupDate,
        pickupTime: bookingData.pickupTime,
        dropoffDate: bookingData.dropoffDate,
        dropoffTime: bookingData.dropoffTime,
        pickupLocation: bookingData.pickupLocation,
        dropoffLocation: bookingData.dropoffLocation,
        status: 'confirmed',
        insurance: bookingData.insurance,
        addOns: bookingData.addOns,
        basePrice: bookingData.basePrice,
        insurancePrice: bookingData.insurancePrice,
        addOnsPrice: bookingData.addOnsPrice,
        discount: bookingData.discount,
        totalPrice: bookingData.totalPrice,
        paymentMethod: selectedPaymentMethod,
        transactionId: transactionID,
        bookingDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      bookings.push(booking);
      Storage.set('bookings', bookings);

      // Save payment record
      const payments = Storage.get('payments') || [];
      const payment = {
        id: generateID(),
        bookingId: booking.id,
        transactionId: transactionID,
        method: selectedPaymentMethod,
        amount: totalPrice,
        status: 'completed',
        createdAt: new Date().toISOString()
      };
      payments.push(payment);
      Storage.set('payments', payments);

      // Create notification for user
      if (currentUser) {
        addNotification(
          currentUser.id,
          'booking_confirmation',
          'Booking Confirmed!',
          `Your booking has been confirmed. Transaction ID: ${transactionID}`
        );
      }

      // Redirect to receipt page
      const queryParams = new URLSearchParams({
        status: 'success',
        bookingId: booking.id,
        transactionId: transactionID,
        method: selectedPaymentMethod,
        amount: totalPrice
      });

      setTimeout(() => {
        window.location.href = `receipt.html?${queryParams.toString()}`;
      }, 1000);
    } else {
      // Payment failed
      const failureReasons = [
        'Payment declined by bank',
        'Insufficient funds',
        'Invalid card details',
        'Transaction timeout'
      ];
      const reason = failureReasons[Math.floor(Math.random() * failureReasons.length)];

      Toast.error(`Payment Failed: ${reason}`);

      // Create notification for failure
      const currentUser = getCurrentUser();
      if (currentUser) {
        addNotification(
          currentUser.id,
          'payment_failed',
          'Payment Failed',
          `Your payment could not be processed. ${reason}`
        );
      }

      // Redirect after 2 seconds
      setTimeout(() => {
        const queryParams = new URLSearchParams({
          status: 'failed',
          reason: reason
        });
        window.location.href = `receipt.html?${queryParams.toString()}`;
      }, 2000);
    }
  }, 2000);
};

// Generate receipt HTML
const generateReceiptHTML = (booking) => {
  const car = getCarById(booking.carId);
  if (!car) return 'Booking details not found';

  return `
    <div class="receipt-container">
      <div class="receipt-header">
        <h1>Booking Confirmation</h1>
        <p class="transaction-id">Transaction ID: ${booking.transactionId}</p>
        <p class="booking-date">Date: ${formatDate(booking.createdAt, 'datetime')}</p>
      </div>

      <div class="receipt-section">
        <h3>Vehicle Details</h3>
        <table>
          <tr>
            <td>Car Model:</td>
            <td><strong>${car.name}</strong></td>
          </tr>
          <tr>
            <td>Brand:</td>
            <td>${car.brand}</td>
          </tr>
          <tr>
            <td>Fuel Type:</td>
            <td>${car.fuel}</td>
          </tr>
          <tr>
            <td>Seats:</td>
            <td>${car.seats}</td>
          </tr>
          <tr>
            <td>Transmission:</td>
            <td>${car.transmission}</td>
          </tr>
        </table>
      </div>

      <div class="receipt-section">
        <h3>Rental Period</h3>
        <table>
          <tr>
            <td>Pickup:</td>
            <td>${formatDate(booking.pickupDate)} at ${booking.pickupTime}</td>
          </tr>
          <tr>
            <td>Pickup Location:</td>
            <td>${booking.pickupLocation}</td>
          </tr>
          <tr>
            <td>Drop-off:</td>
            <td>${formatDate(booking.dropoffDate)} at ${booking.dropoffTime}</td>
          </tr>
          <tr>
            <td>Drop-off Location:</td>
            <td>${booking.dropoffLocation}</td>
          </tr>
          <tr>
            <td>Duration:</td>
            <td>${calculateDays(booking.pickupDate, booking.dropoffDate)} days</td>
          </tr>
        </table>
      </div>

      <div class="receipt-section">
        <h3>Coverage & Services</h3>
        <table>
          <tr>
            <td>Insurance:</td>
            <td><strong>${booking.insurance.toUpperCase()}</strong></td>
          </tr>
          ${booking.addOns.length > 0 ? `
            <tr>
              <td>Add-ons:</td>
              <td>${booking.addOns.join(', ')}</td>
            </tr>
          ` : ''}
        </table>
      </div>

      <div class="receipt-section">
        <h3>Price Breakdown</h3>
        <table class="price-breakdown">
          <tr>
            <td>Base Price:</td>
            <td>${formatCurrency(booking.basePrice)}</td>
          </tr>
          <tr>
            <td>Insurance:</td>
            <td>${formatCurrency(booking.insurancePrice)}</td>
          </tr>
          ${booking.addOnsPrice > 0 ? `
            <tr>
              <td>Add-ons:</td>
              <td>${formatCurrency(booking.addOnsPrice)}</td>
            </tr>
          ` : ''}
          ${booking.discount > 0 ? `
            <tr class="discount">
              <td>Discount:</td>
              <td>-${formatCurrency(booking.discount)}</td>
            </tr>
          ` : ''}
          <tr class="total">
            <td><strong>Total Amount</strong></td>
            <td><strong>${formatCurrency(booking.totalPrice)}</strong></td>
          </tr>
        </table>
      </div>

      <div class="receipt-section">
        <h3>Payment Information</h3>
        <table>
          <tr>
            <td>Payment Method:</td>
            <td><strong>${booking.paymentMethod.toUpperCase()}</strong></td>
          </tr>
          <tr>
            <td>Status:</td>
            <td><span class="status-badge status-${booking.status}">${booking.status.toUpperCase()}</span></td>
          </tr>
        </table>
      </div>

      <div class="receipt-section">
        <h3>Important Information</h3>
        <ul>
          <li>Please carry your booking confirmation and valid driving license</li>
          <li>Arrive 15 minutes before pickup time</li>
          <li>Check vehicle condition before and after use</li>
          <li>Fuel policy: Return with same fuel level</li>
          <li>In case of emergency, contact: +1-800-LUXEGO</li>
        </ul>
      </div>

      <div class="receipt-footer">
        <p>Thank you for choosing LuxeGo!</p>
        <p>Your booking reference: <strong>${booking.id}</strong></p>
      </div>
    </div>
  `;
};

// Get booking by ID
const getBookingById = (bookingId) => {
  const bookings = Storage.get('bookings') || [];
  return bookings.find(b => b.id === bookingId);
};

// Update booking status
const updateBookingStatus = (bookingId, newStatus) => {
  const bookings = Storage.get('bookings') || [];
  const booking = bookings.find(b => b.id === bookingId);
  if (booking) {
    booking.status = newStatus;
    Storage.set('bookings', bookings);
    return booking;
  }
  return null;
};

// Calculate refund amount
const getRefundAmount = (bookingId) => {
  const booking = getBookingById(bookingId);
  if (!booking) return 0;

  const bookingDate = new Date(booking.bookingDate);
  const pickupDate = new Date(booking.pickupDate);
  const daysBeforeBooking = Math.floor((pickupDate - bookingDate) / (1000 * 60 * 60 * 24));

  return calculateRefund(booking.totalPrice, daysBeforeBooking);
};

// Cancel booking
const cancelBooking = (bookingId, reason = '') => {
  const booking = updateBookingStatus(bookingId, 'cancelled');
  if (booking) {
    const refundAmount = getRefundAmount(bookingId);

    // Create refund payment record
    const refunds = Storage.get('refunds') || [];
    refunds.push({
      id: generateID(),
      bookingId,
      amount: refundAmount,
      originalAmount: booking.totalPrice,
      reason,
      status: 'processed',
      createdAt: new Date().toISOString()
    });
    Storage.set('refunds', refunds);

    // Notify user
    const currentUser = getCurrentUser();
    if (currentUser) {
      addNotification(
        booking.userId,
        'booking_cancelled',
        'Booking Cancelled',
        `Your booking has been cancelled. Refund amount: ${formatCurrency(refundAmount)}`
      );
    }

    return { booking, refundAmount };
  }
  return null;
};

console.log('✓ Payment system loaded successfully');
