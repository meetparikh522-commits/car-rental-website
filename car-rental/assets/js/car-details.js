document.addEventListener('DOMContentLoaded', () => {
  const formatPrice = (amount) => {
    if (typeof formatCurrency === 'function') return formatCurrency(amount);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const mainCarImage = document.getElementById('main-car-image');
  const thumbnailImagesContainer = document.getElementById('thumbnail-images');
  const carName = document.getElementById('car-name');
  const carPrice = document.getElementById('car-price');
  const carAvailability = document.getElementById('car-availability');
  const specList = document.getElementById('spec-list');
  const reviewsList = document.getElementById('reviews-list');
  const similarCarsGrid = document.getElementById('similar-cars-grid');
  const bookNowBtn = document.getElementById('book-now-btn');

  let currentCar;

  async function fetchCarData() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const carId = parseInt(urlParams.get('id'));
      
      if (!carId) {
        console.warn('No car ID provided in URL, redirecting to catalog');
        window.location.href = 'cars.html';
        return;
      }

      // 1. Fetch details from dynamic CarAPI
      currentCar = CarAPI.getCarById(carId);

      if (currentCar) {
        renderCarDetails();
        renderSimilarCars();
        setupBookNowButton();
      } else {
        console.error(`Car with ID ${carId} not found`);
        document.querySelector('.car-details-page').innerHTML = `
          <div class="container" style="text-align: center; padding: 100px 20px;">
            <i class="fas fa-exclamation-circle" style="font-size: 4rem; color: var(--primary-color); margin-bottom: 20px;"></i>
            <h2>Vehicle Specification Not Found</h2>
            <p style="color: var(--text-muted); margin-top: 10px; margin-bottom: 20px;">The requested vehicle details could not be retrieved from the active database.</p>
            <a href="cars.html" class="btn btn-primary">Return to Catalog</a>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error loading vehicle details:', error);
    }
  }

  function renderCarDetails() {
    if (!currentCar) return;

    // Load main vehicle resources
    if (mainCarImage) {
      mainCarImage.src = currentCar.image;
      mainCarImage.alt = currentCar.name;
    }
    
    if (carName) carName.textContent = currentCar.name;
    if (carPrice) carPrice.textContent = `${formatPrice(currentCar.price)}/day`;

    // Dynamic availability check
    if (carAvailability) {
      // Check if booked today
      const todayStr = new Date().toISOString().split('T')[0];
      const isAvailable = CarAPI.checkAvailability(currentCar.id, todayStr, todayStr);
      
      if (isAvailable) {
        carAvailability.textContent = 'Available Now';
        carAvailability.style.color = '#10b981'; // Sleek green
        if (bookNowBtn) {
          bookNowBtn.style.pointerEvents = 'auto';
          bookNowBtn.style.opacity = '1';
          bookNowBtn.textContent = 'Book Now';
        }
      } else {
        carAvailability.textContent = 'Currently Booked';
        carAvailability.style.color = '#ef4444'; // Red alert
        if (bookNowBtn) {
          bookNowBtn.textContent = 'Unavailable';
          bookNowBtn.style.opacity = '0.6';
        }
      }
    }

    // Build specs list dynamically using CARAPI attributes
    if (specList) {
      const specs = {
        'Brand/Make': currentCar.brand,
        'Model Year': currentCar.year || '2022',
        'Body Style': currentCar.bodyType || 'Sedan',
        'Fuel Type': currentCar.fuel,
        'Seating Capacity': `${currentCar.seats} Passenger Seats`,
        'Transmission': currentCar.transmission
      };

      specList.innerHTML = '';
      for (const [key, value] of Object.entries(specs)) {
        const li = document.createElement('li');
        li.style.padding = '10px 0';
        li.style.borderBottom = '1px solid var(--border-color)';
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.innerHTML = `<span style="color: var(--text-muted);">${key}:</span> <strong style="color: var(--text-color);">${value}</strong>`;
        specList.appendChild(li);
      }
    }

    // Generate dynamic photo gallery thumbnails from the API-backed car record.
    if (thumbnailImagesContainer) {
      const galleryImages = currentCar.galleryImages && currentCar.galleryImages.length
        ? currentCar.galleryImages
        : [currentCar.image];
      
      thumbnailImagesContainer.innerHTML = '';
      galleryImages.forEach((imgSrc, index) => {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = `${currentCar.name} Spec Photo ${index + 1}`;
        img.style.cursor = 'pointer';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '4px';
        img.style.border = '2px solid transparent';
        if (index === 0) {
          img.classList.add('active');
          img.style.borderColor = 'var(--primary-color)';
        }

        img.addEventListener('click', () => {
          if (mainCarImage) mainCarImage.src = imgSrc;
          // Clear active thumbnail states
          thumbnailImagesContainer.querySelectorAll('img').forEach(t => {
            t.classList.remove('active');
            t.style.borderColor = 'transparent';
          });
          img.classList.add('active');
          img.style.borderColor = 'var(--primary-color)';
        });
        thumbnailImagesContainer.appendChild(img);
      });
    }

    // Load authentic local reviews
    if (reviewsList) {
      // Pull dynamic reviews from storage or use seed matching this car
      const allReviews = JSON.parse(localStorage.getItem('reviews')) || [];
      let carReviews = allReviews.filter(r => r.carId == currentCar.id);
      
      // Default placeholder reviews if empty
      if (carReviews.length === 0) {
        carReviews = [
          { 
            user: 'David Henderson', 
            rating: 5, 
            title: 'Exceeded all expectations',
            comment: `Renting this ${currentCar.brand} was an absolute pleasure. The specifications match exactly as advertised and it drove perfectly. Highly recommended!`,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          { 
            user: 'Clarissa Montgomery', 
            rating: 4, 
            title: 'Luxurious and extremely clean',
            comment: 'The vehicle arrived in immaculate condition. Seamless hand-off and great fuel efficiency. Will definitely book again.',
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
      }

      reviewsList.innerHTML = '';
      carReviews.forEach(review => {
        const reviewDiv = document.createElement('div');
        reviewDiv.className = 'review';
        reviewDiv.style.marginBottom = '25px';
        reviewDiv.style.padding = '20px';
        reviewDiv.style.border = '1px solid var(--border-color)';
        reviewDiv.style.borderRadius = '8px';
        reviewDiv.style.background = 'var(--card-background)';
        reviewDiv.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <strong style="font-size:1.1rem; color:var(--text-color);">${review.user}</strong>
            <span style="color:#f59e0b; font-size:1rem;">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
          </div>
          ${review.title ? `<p style="font-weight:600; margin-bottom:5px; color:var(--primary-color);">${review.title}</p>` : ''}
          <p style="color:var(--text-muted); line-height:1.5; font-size:0.95rem;">${review.comment}</p>
        `;
        reviewsList.appendChild(reviewDiv);
      });
    }
  }

  function renderSimilarCars() {
    if (!similarCarsGrid || !currentCar) return;

    const allCars = CarAPI.getCars();
    // Filter similar cars (same brand or bodyType, and not the current car)
    const similarCars = allCars
      .filter(car => (car.brand === currentCar.brand || car.bodyType === currentCar.bodyType) && car.id !== currentCar.id)
      .slice(0, 3);

    similarCarsGrid.innerHTML = '';

    if (similarCars.length === 0) {
      // Fallback to any 3 luxury cars
      const fallbackCars = allCars.filter(car => car.id !== currentCar.id).slice(0, 3);
      fallbackCars.forEach(renderSimilarCard);
      return;
    }

    similarCars.forEach(renderSimilarCard);
  }

  function renderSimilarCard(car) {
    const carCard = document.createElement('div');
    carCard.className = 'car-card';
    carCard.innerHTML = `
      <a href="car-details.html?id=${car.id}">
        <img src="${car.image}" alt="${car.name}" loading="lazy" style="height: 180px; width: 100%; object-fit: cover;">
        <div class="car-card-content" style="padding: 15px;">
          <h3 style="font-size: 1.1rem; margin-bottom: 5px;">${car.name}</h3>
          <p class="price" style="font-weight: 700; color: var(--primary-color);">${formatPrice(car.price)}/day</p>
        </div>
      </a>
    `;
    similarCarsGrid.appendChild(carCard);
  }

  function setupBookNowButton() {
    if (bookNowBtn && currentCar) {
      bookNowBtn.href = `booking.html?car_id=${currentCar.id}`;
    }
  }

  // Load details
  fetchCarData();
});
