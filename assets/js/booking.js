document.addEventListener('DOMContentLoaded', () => {
  const bookingForm = document.getElementById('booking-form');
  const nextStepButtons = document.querySelectorAll('.next-step');
  const prevStepButtons = document.querySelectorAll('.prev-step');
  const progressSteps = document.querySelectorAll('.progress-step');
  const proceedToPaymentBtn = document.getElementById('proceed-to-payment');

  let currentStep = 1;
  let bookingData = {
    carId: null,
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    pickupTime: '',
    dropoffDate: '',
    dropoffTime: '',
    insurance: 'basic',
    addOns: [],
    days: 0,
    basePrice: 0,
    insurancePrice: 0,
    addOnsPrice: 0,
    discount: 0,
    totalPrice: 0,
    paymentMethod: 'upi',
    couponCode: ''
  };

  // Insurance pricing
  const insurancePricing = {
    basic: 20,
    premium: 35,
    full: 50
  };

  // Add-ons pricing
  const addOnsPricing = {
    'gps': 5,
    'child-seat': 10,
    'extra-driver': 15,
    'wifi': 3
  };

  // Step Navigation
  nextStepButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      if (validateStep(currentStep)) {
        changeStep(currentStep + 1);
      }
    });
  });

  prevStepButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      changeStep(currentStep - 1);
    });
  });

  function changeStep(step) {
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    document.getElementById(`step-${step}`).classList.add('active');
    progressSteps.forEach(pStep => {
      pStep.classList.toggle('active', pStep.dataset.step <= step);
    });
    currentStep = step;

    if (currentStep === 2) {
      calculatePrice();
    }
  }

  // Load car details from URL parameter or localStorage
  function loadCarDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('car_id');

    if (!carId) {
      alert('Please select a car first');
      window.location.href = 'cars.html';
      return;
    }

    const car = CarAPI.getCarById(carId);

    if (car) {
      bookingData.carId = car.id;
      document.getElementById('car-details-content').innerHTML = `
        <div style="display: flex; gap: 20px; align-items: flex-start;">
          <img src="${car.image}" alt="${car.name}" style="width: 120px; height: 100px; object-fit: cover; border-radius: 8px;">
          <div>
            <h3>${car.name}</h3>
            <p><strong>${car.brand}</strong></p>
            <p><i class="fas fa-gas-pump"></i> ${car.fuel} | <i class="fas fa-couch"></i> ${car.seats} seats | <i class="fas fa-cogs"></i> ${car.transmission}</p>
            <h3 style="color: var(--primary-color);">${formatCurrency(car.price)}/day</h3>
          </div>
        </div>
      `;
      bookingForm.dataset.carId = carId;
    }
  }

  // Form Validation
  function validateStep(step) {
    if (step === 1) {
      const pickupLocation = document.getElementById('pickup-location').value.trim();
      const dropoffLocation = document.getElementById('dropoff-location').value.trim();
      const pickupDate = document.getElementById('pickup-date').value;
      const dropoffDate = document.getElementById('dropoff-date').value;

      if (!pickupLocation) {
        Toast.error('Please enter pickup location');
        return false;
      }
      if (!dropoffLocation) {
        Toast.error('Please enter drop-off location');
        return false;
      }
      if (!pickupDate) {
        Toast.error('Please select pickup date');
        return false;
      }
      if (!dropoffDate) {
        Toast.error('Please select drop-off date');
        return false;
      }

      const validation = validateBookingDates(pickupDate, dropoffDate);
      if (!validation.valid) {
        Toast.error(validation.error);
        return false;
      }

      // Check CARAPI active reservations availability overlap
      const isAvailable = CarAPI.checkAvailability(bookingForm.dataset.carId || bookingData.carId, pickupDate, dropoffDate);
      if (!isAvailable) {
        Toast.error('Vehicle is already reserved for the selected date range. Please choose other dates or select another car.');
        return false;
      }

      // Save booking data
      bookingData.pickupLocation = pickupLocation;
      bookingData.dropoffLocation = dropoffLocation;
      bookingData.pickupDate = pickupDate;
      bookingData.pickupTime = document.getElementById('pickup-time').value;
      bookingData.dropoffDate = dropoffDate;
      bookingData.dropoffTime = document.getElementById('dropoff-time').value;
      bookingData.insurance = document.querySelector('input[name="insurance"]:checked').value;

      // Get selected add-ons
      bookingData.addOns = Array.from(document.querySelectorAll('.addon-options input[type="checkbox"]:checked'))
        .map(cb => cb.value);

      return true;
    }
    return true;
  }

  // Calculate price breakdown
  function calculatePrice() {
    const car = CarAPI.getCarById(bookingData.carId);

    if (!car) return;

    // Calculate days
    const days = calculateDays(bookingData.pickupDate, bookingData.dropoffDate);
    bookingData.days = days;

    // Base price
    const basePrice = days * car.price;
    bookingData.basePrice = basePrice;

    // Insurance price
    const insurancePerDay = insurancePricing[bookingData.insurance];
    const insurancePrice = insurancePerDay * days;
    bookingData.insurancePrice = insurancePrice;

    // Add-ons price
    let addOnsPrice = 0;
    bookingData.addOns.forEach(addon => {
      addOnsPrice += (addOnsPricing[addon] || 0) * days;
    });
    bookingData.addOnsPrice = addOnsPrice;

    // Coupon discount
    let discount = 0;
    const couponCode = document.getElementById('coupon-code').value.toUpperCase();
    if (couponCode === 'LUXEGO10') {
      discount = (basePrice + insurancePrice + addOnsPrice) * 0.1;
      bookingData.couponCode = couponCode;
    }
    bookingData.discount = discount;

    // Total price
    const totalPrice = basePrice + insurancePrice + addOnsPrice - discount;
    bookingData.totalPrice = totalPrice;

    // Update UI
    const breakdownHTML = `
      <table class="price-table">
        <tr>
          <td>Base Price (${days} days × ${formatCurrency(car.price)})</td>
          <td>${formatCurrency(basePrice)}</td>
        </tr>
        <tr>
          <td>Insurance (${formatCurrency(car.price)}) - ${bookingData.insurance.toUpperCase()}</td>
          <td>${formatCurrency(insurancePrice)}</td>
        </tr>
        ${bookingData.addOns.length > 0 ? `
          <tr>
            <td>Add-ons (${bookingData.addOns.join(', ')})</td>
            <td>${formatCurrency(addOnsPrice)}</td>
          </tr>
        ` : ''}
        ${discount > 0 ? `
          <tr class="discount-row">
            <td>Discount (${couponCode})</td>
            <td>-${formatCurrency(discount)}</td>
          </tr>
        ` : ''}
        <tr class="total-row">
          <td><strong>Total Amount</strong></td>
          <td><strong>${formatCurrency(totalPrice)}</strong></td>
        </tr>
      </table>
      <div class="cancellation-policy">
        <h4>Cancellation Policy</h4>
        <p>✓ Free cancellation up to 3 days before booking</p>
        <p>✓ 50% refund if cancelled 1-2 days before</p>
        <p>✓ No refund if cancelled less than 24 hours before</p>
      </div>
    `;

    document.getElementById('price-breakdown').innerHTML = breakdownHTML;
    document.getElementById('total-price').innerHTML = `<strong>Total: ${formatCurrency(totalPrice)}</strong>`;
  }

  // Payment method selection
  document.querySelectorAll('input[name="payment"]').forEach(input => {
    input.addEventListener('change', (e) => {
      bookingData.paymentMethod = e.target.value;
    });
  });

  // Insurance selection
  document.querySelectorAll('input[name="insurance"]').forEach(input => {
    input.addEventListener('change', (e) => {
      bookingData.insurance = e.target.value;
      if (currentStep === 2) calculatePrice();
    });
  });

  // Add-ons selection
  document.querySelectorAll('.addon-options input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        bookingData.addOns.push(e.target.value);
      } else {
        bookingData.addOns = bookingData.addOns.filter(addon => addon !== e.target.value);
      }
      if (currentStep === 2) calculatePrice();
    });
  });

  // Apply coupon
  document.getElementById('apply-coupon').addEventListener('click', () => {
    if (currentStep === 2) {
      calculatePrice();
      Toast.success('Coupon applied!');
    }
  });

  // Proceed to payment
  proceedToPaymentBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // Save booking draft to localStorage
    Storage.set('bookingDraft', bookingData);

    // Save loyalLoyalty points
    const currentUser = getCurrentUser();
    if (currentUser) {
      const points = calculateLoyaltyPoints(bookingData.totalPrice);
      addLoyaltyPoints(currentUser.id, points);
    }

    // Process payment
    processPayment(bookingData);
  });

  // Initialize
  loadCarDetails();

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('pickup-date').min = today;
  document.getElementById('dropoff-date').min = today;
});
