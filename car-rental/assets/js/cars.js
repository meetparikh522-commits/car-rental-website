document.addEventListener('DOMContentLoaded', () => {
  const formatPrice = (amount) => {
    if (typeof formatCurrency === 'function') return formatCurrency(amount);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const carGrid = document.getElementById('car-grid');
  const searchInput = document.getElementById('search');
  const priceRange = document.getElementById('price-range');
  const priceValue = document.getElementById('price-value');
  const brandFilter = document.getElementById('brand-filter');
  const fuelFilter = document.getElementById('fuel-filter');
  const seatsFilter = document.getElementById('seats-filter');
  const transmissionFilter = document.getElementById('transmission-filter');
  const sortBy = document.getElementById('sort-by');
  const prevPageButton = document.getElementById('prev-page');
  const nextPageButton = document.getElementById('next-page');
  const pageInfo = document.getElementById('page-info');

  let cars = [];
  let filteredCars = [];
  let currentPage = 1;
  const carsPerPage = 6;

  // Add CSS pulse animation for loading skeletons
  if (!document.getElementById('skeleton-styles')) {
    const style = document.createElement('style');
    style.id = 'skeleton-styles';
    style.textContent = `
      @keyframes pulse {
        0% { opacity: 0.3; }
        50% { opacity: 0.7; }
        100% { opacity: 0.3; }
      }
      .skeleton-card {
        border: 1px solid var(--border-color);
        border-radius: 8px;
        overflow: hidden;
        background: var(--card-background);
      }
      .skeleton {
        background-color: var(--border-color);
        animation: pulse 1.5s infinite ease-in-out;
      }
    `;
    document.head.appendChild(style);
  }

  // Show modern premium loading skeletons
  function showLoadingSkeletons() {
    if (!carGrid) return;
    carGrid.innerHTML = Array(6).fill(0).map(() => `
      <div class="car-card skeleton-card">
        <div class="skeleton" style="height: 200px; width: 100%;"></div>
        <div class="car-card-content" style="padding: 20px; display: flex; flex-direction: column; gap: 10px;">
          <div class="skeleton" style="height: 22px; width: 70%; border-radius: 4px;"></div>
          <div class="skeleton" style="height: 18px; width: 40%; border-radius: 4px;"></div>
          <div class="skeleton" style="height: 40px; width: 100%; border-radius: 4px;"></div>
          <div style="display: flex; gap: 8px; margin-top: 10px;">
            <div class="skeleton" style="height: 12px; width: 30%; border-radius: 2px;"></div>
            <div class="skeleton" style="height: 12px; width: 30%; border-radius: 2px;"></div>
            <div class="skeleton" style="height: 12px; width: 30%; border-radius: 2px;"></div>
          </div>
        </div>
      </div>
    `).join('');
  }

  async function fetchCars() {
    try {
      // 1. Show dynamic loading skeletons
      showLoadingSkeletons();

      // 2. Fetch cars from centralized CarAPI client
      // Simulate network request duration for aesthetic purposes
      await new Promise(resolve => setTimeout(resolve, 400));
      
      cars = CarAPI.getCars();
      filteredCars = [...cars];

      // 3. Set up price range limits based on CARAPI data
      try {
        const maxPrice = Math.max(...cars.map(c => Number(c.price) || 0));
        if (priceRange) {
          priceRange.max = maxPrice || priceRange.max;
          priceRange.value = priceRange.max;
        }
        if (priceValue) priceValue.textContent = formatPrice(priceRange.value);
      } catch (err) {
        console.error('Error setting price range:', err);
      }

      populateFilters();
      renderCars();
    } catch (error) {
      console.error('Error fetching car data from CARAPI:', error);
      if (carGrid) {
        carGrid.innerHTML = `
          <div class="error-fallback" style="grid-column: 1/-1; text-align: center; padding: 40px 20px; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 8px; color: #ef4444;">
            <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem; margin-bottom: 15px;"></i>
            <h3>Could Not Load Dynamic Catalog</h3>
            <p style="margin-top: 8px;">There was an error communicating with CARAPI. Please refresh or check your API configuration.</p>
          </div>
        `;
      }
    }
  }

  function populateFilters() {
    if (!brandFilter) return;
    
    // Clear all except the "All" option
    brandFilter.innerHTML = '<option value="">All</option>';
    
    // Extract unique brands from CARAPI dataset
    const brands = [...new Set(cars.map(car => car.brand))].sort();
    brands.forEach(brand => {
      const option = document.createElement('option');
      option.value = brand;
      option.textContent = brand;
      brandFilter.appendChild(option);
    });
  }

  function renderCars() {
    if (!carGrid) return;
    carGrid.innerHTML = '';

    if (filteredCars.length === 0) {
      carGrid.innerHTML = `
        <div class="empty-fallback" style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
          <h3>No Matching Vehicles Found</h3>
          <p style="margin-top: 10px;">Try adjusting your filters or search keywords to find your dream car.</p>
        </div>
      `;
      updatePagination();
      return;
    }

    const startIndex = (currentPage - 1) * carsPerPage;
    const endIndex = startIndex + carsPerPage;
    const carsToRender = filteredCars.slice(startIndex, endIndex);

    carsToRender.forEach(car => {
      const carCard = document.createElement('div');
      carCard.className = 'car-card';
      carCard.innerHTML = `
        <a href="car-details.html?id=${car.id}">
          <div class="car-image-wrapper">
            <img src="${car.image}" alt="${car.name}" loading="lazy">
            <div class="color-overlay" data-carid="${car.id}"></div>
          </div>
          <div class="car-card-content">
            <h3>${car.name}</h3>
            <p class="price">${formatPrice(car.price)}/day</p>
            ${car.description ? `<p class="description">${car.description}</p>` : ''}
            <div class="color-swatches">
              ${car.colors ? car.colors.map(c => `<span class="color-swatch" data-color="${c}" style="background:${c}"></span>`).join('') : ''}
            </div>
            <div class="car-details">
              <span><i class="fas fa-gas-pump"></i> ${car.fuel}</span>
              <span><i class="fas fa-couch"></i> ${car.seats}</span>
              <span><i class="fas fa-cogs"></i> ${car.transmission}</span>
            </div>
          </div>
        </a>
      `;

      carGrid.appendChild(carCard);

      // Bind swatch handler to tint images in real-time
      const overlay = carCard.querySelector('.color-overlay');
      const swatches = carCard.querySelectorAll('.color-swatch');
      if (swatches && swatches.length && overlay) {
        swatches.forEach(s => {
          s.addEventListener('click', (ev) => {
            ev.preventDefault();
            const color = s.dataset.color;
            swatches.forEach(x => x.classList.remove('active'));
            s.classList.add('active');
            overlay.style.backgroundColor = color;
            overlay.style.opacity = '0.4';
          });
        });
      }
    });

    updatePagination();
  }

  function updatePagination() {
    if (!pageInfo || !prevPageButton || !nextPageButton) return;

    const totalPages = Math.ceil(filteredCars.length / carsPerPage) || 1;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;
  }

  function applyFiltersAndSorting() {
    let tempCars = [...cars];

    // Search query matching brand or model
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    if (searchTerm) {
      tempCars = tempCars.filter(car => 
        car.name.toLowerCase().includes(searchTerm) || 
        car.brand.toLowerCase().includes(searchTerm)
      );
    }

    // Price range filter
    if (priceRange) {
      tempCars = tempCars.filter(car => car.price <= priceRange.value);
    }

    // Brand select option filter
    if (brandFilter && brandFilter.value) {
      tempCars = tempCars.filter(car => car.brand === brandFilter.value);
    }

    // Fuel category filter
    if (fuelFilter && fuelFilter.value) {
      tempCars = tempCars.filter(car => car.fuel.toLowerCase() === fuelFilter.value.toLowerCase());
    }

    // Seats count filter
    if (seatsFilter && seatsFilter.value) {
      tempCars = tempCars.filter(car => car.seats == seatsFilter.value);
    }

    // Transmission filter
    if (transmissionFilter && transmissionFilter.value) {
      tempCars = tempCars.filter(car => car.transmission.toLowerCase() === transmissionFilter.value.toLowerCase());
    }

    // Sorting algorithms
    if (sortBy) {
      const sortValue = sortBy.value;
      if (sortValue === 'price-asc') {
        tempCars.sort((a, b) => a.price - b.price);
      } else if (sortValue === 'price-desc') {
        tempCars.sort((a, b) => b.price - a.price);
      } else if (sortValue === 'name-asc') {
        tempCars.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortValue === 'name-desc') {
        tempCars.sort((a, b) => b.name.localeCompare(a.name));
      }
    }

    filteredCars = tempCars;
    currentPage = 1;
    renderCars();
  }

  // Bind Event Listeners
  if (priceRange) {
    priceRange.addEventListener('input', () => {
      if (priceValue) priceValue.textContent = formatPrice(priceRange.value);
      applyFiltersAndSorting();
    });
  }

  if (searchInput) searchInput.addEventListener('input', applyFiltersAndSorting);
  if (brandFilter) brandFilter.addEventListener('change', applyFiltersAndSorting);
  if (fuelFilter) fuelFilter.addEventListener('change', applyFiltersAndSorting);
  if (seatsFilter) seatsFilter.addEventListener('change', applyFiltersAndSorting);
  if (transmissionFilter) transmissionFilter.addEventListener('change', applyFiltersAndSorting);
  if (sortBy) sortBy.addEventListener('change', applyFiltersAndSorting);

  if (prevPageButton) {
    prevPageButton.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderCars();
        window.scrollTo({ top: carGrid.offsetTop - 100, behavior: 'smooth' });
      }
    });
  }

  if (nextPageButton) {
    nextPageButton.addEventListener('click', () => {
      const totalPages = Math.ceil(filteredCars.length / carsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderCars();
        window.scrollTo({ top: carGrid.offsetTop - 100, behavior: 'smooth' });
      }
    });
  }

  // Execute catalog load
  fetchCars();
});
