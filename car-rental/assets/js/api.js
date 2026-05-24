// ==========================================
// LUXEGO - CARAPI CORE API SERVICE LAYER
// ==========================================
//
// ENVIRONMENT CONFIGURATION:
// Please paste your API Token and Secret keys below.
// If you only have one API Key, use it as both the token and the secret.
//
// Paste your API keys here:
const CARAPI_BASE_URL = 'https://carapi.app';
const CARAPI_TOKEN = '60cf30e9-84eb-418f-add2-d376add35737';
const CARAPI_SECRET = '3H4ZCi9mhZsFpowmmVhUh1NF1C5NoSPPvH';

const CarAPI = {
  // Local storage keys
  KEYS: {
    CARS: 'luxego_cars',
    BOOKINGS: 'bookings',
    JWT: 'luxego_jwt',
    JWT_EXP: 'luxego_jwt_exp',
    CATALOG_VERSION: 'luxego_catalog_version'
  },

  CATALOG_VERSION: 'local-colorful-real-car-images-inr-v10',

  LOCAL_CAR_IMAGES: {
    "Maruti Suzuki Swift": "assets/images/maruti-suzuki-swift.jpg",
    "Hyundai i20": "assets/images/hyundai-i20.jpg",
    "Tata Nexon": "assets/images/tata-nexon.jpg",
    "Mahindra XUV500": "assets/images/mahindra-xuv500.jpg",
    "Honda City": "assets/images/honda-city.jpg",
    "BMW 3 Series": "assets/images/bmw-3-series.jpg",
    "Audi A4": "assets/images/audi-a4.jpg",
    "Mercedes-Benz C-Class": "assets/images/mercedes-benz-c-class.jpg",
    "Porsche 911": "assets/images/porsche-911.jpg",
    "Ford Mustang": "assets/images/ford-mustang.jpg",
    "Chevrolet Camaro": "assets/images/chevrolet-camaro.jpg",
    "Land Rover Range Rover": "assets/images/land-rover-range-rover.jpg",
    "Lexus LC 500": "assets/images/lexus-lc-500.jpg",
    "Jaguar F-Type": "assets/images/jaguar-f-type.jpg",
    "Maserati Ghibli": "assets/images/maserati-ghibli.jpg",
    "Ferrari 488": "assets/images/ferrari-488.jpg",
    "Rolls Royce Phantom": "assets/images/rolls-royce-phantom.jpg",
    "Lamborghini Aventador": "assets/images/lamborghini-aventador.jpg",
    "Bentley Continental GT": "assets/images/bentley-continental-gt.jpg",
    "Bugatti Chiron": "assets/images/bugatti-chiron.jpg"
  },

  getStableImageSeed(car, angle) {
    const key = `${car.id || ''}-${car.name || ''}-${angle}`;
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash + key.charCodeAt(i) * (i + 1)) % 100000;
    }
    return hash;
  },

  getCarModelName(car) {
    const brand = car.brand || car.make?.name || 'car';
    const apiModel = car.modelName || car.model?.name || (typeof car.model === 'string' ? car.model : '');
    if (apiModel) return apiModel;

    const name = car.name || '';
    return name.toLowerCase().startsWith(brand.toLowerCase())
      ? name.slice(brand.length).trim()
      : name;
  },

  buildImageSearchUrl(car) {
    const brand = car.brand || car.make?.name || 'car';
    const model = this.getCarModelName(car);
    const fullName = car.name || `${brand} ${model}`.trim();
    return this.LOCAL_CAR_IMAGES[fullName] ||
      this.LOCAL_CAR_IMAGES[`${brand} ${model}`.trim()] ||
      "assets/images/maruti-suzuki-swift.jpg";
  },

  normalizeCar(car, index = 0) {
    const shouldRegenerateImage = src => (
      src &&
      (
        src.includes('source.unsplash.com') ||
        src.includes('images.unsplash.com') ||
        src.includes('image.pollinations.ai') ||
        src.startsWith('data:image/svg+xml')
      )
    );
    const primaryImage = car.image && !shouldRegenerateImage(car.image)
      ? car.image
      : this.buildImageSearchUrl(car);

    const normalized = {
      ...car,
      id: car.id || index + 1,
      modelName: car.modelName || car.model?.name || (typeof car.model === 'string' ? car.model : '') || this.getCarModelName(car),
      image: primaryImage,
      galleryImages: Array.isArray(car.galleryImages) && car.galleryImages.length
        ? car.galleryImages.filter(src => src && !shouldRegenerateImage(src))
        : [primaryImage]
    };

    if (normalized.galleryImages.length === 0) {
      normalized.galleryImages = [normalized.image];
    }

    return normalized;
  },

  // Seed collection of cars to serve as fallback and initialize catalog
  DEFAULT_CARS: [
    {
      id: 1,
      name: "Maruti Suzuki Swift",
      brand: "Maruti Suzuki",
      price: 35000,
      fuel: "Petrol",
      seats: 5,
      transmission: "Manual",
      image: "assets/images/maruti-suzuki-swift.jpg",
      colors: ["#ffffff", "#ff0000", "#000000"],
      description: "Budget-friendly hatchback perfect for daily commute and city driving.",
      year: 2022,
      bodyType: "Hatchback",
      availability: true
    },
    {
      id: 2,
      name: "Hyundai i20",
      brand: "Hyundai",
      price: 42000,
      fuel: "Petrol",
      seats: 5,
      transmission: "Manual",
      image: "assets/images/hyundai-i20.jpg",
      colors: ["#ffffff", "#000000", "#ff0000"],
      description: "Affordable hatchback with modern features and good fuel efficiency.",
      year: 2023,
      bodyType: "Hatchback",
      availability: true
    },
    {
      id: 3,
      name: "Tata Nexon",
      brand: "Tata",
      price: 55000,
      fuel: "Diesel",
      seats: 5,
      transmission: "Automatic",
      image: "assets/images/tata-nexon.jpg",
      colors: ["#000000", "#ffffff", "#ff6b00"],
      description: "Compact SUV with excellent safety features and spacious interior.",
      year: 2022,
      bodyType: "SUV",
      availability: true
    },
    {
      id: 4,
      name: "Mahindra XUV500",
      brand: "Mahindra",
      price: 95000,
      fuel: "Diesel",
      seats: 7,
      transmission: "Automatic",
      image: "assets/images/mahindra-xuv500.jpg",
      colors: ["#1a1a1a", "#ffffff", "#0066cc"],
      description: "Premium SUV with 3-row seating and advanced features for families.",
      year: 2021,
      bodyType: "SUV",
      availability: true
    },
    {
      id: 5,
      name: "Honda City",
      brand: "Honda",
      price: 65000,
      fuel: "Petrol",
      seats: 5,
      transmission: "Automatic",
      image: "assets/images/honda-city.jpg",
      colors: ["#1a1a1a", "#ffffff", "#6b0000"],
      description: "Popular sedan with excellent reliability and smooth driving experience.",
      year: 2022,
      bodyType: "Sedan",
      availability: true
    },
    {
      id: 6,
      name: "BMW 3 Series",
      brand: "BMW",
      price: 25000,
      fuel: "Petrol",
      seats: 5,
      transmission: "Automatic",
      image: "assets/images/bmw-3-series.jpg",
      colors: ["#000000", "#ffffff", "#c0c0c0"],
      description: "Luxury sedan with premium comfort and performance driving.",
      year: 2023,
      bodyType: "Sedan",
      availability: true
    },
    {
      id: 7,
      name: "Audi A4",
      brand: "Audi",
      price: 28000,
      fuel: "Diesel",
      seats: 5,
      transmission: "Automatic",
      image: "assets/images/audi-a4.jpg",
      colors: ["#000000", "#ffffff", "#505050"],
      description: "German engineering at its finest with sophisticated design.",
      year: 2022,
      bodyType: "Sedan",
      availability: true
    },
    {
      id: 8,
      name: "Mercedes-Benz C-Class",
      brand: "Mercedes-Benz",
      price: 32000,
      fuel: "Petrol",
      seats: 5,
      transmission: "Automatic",
      image: "assets/images/mercedes-benz-c-class.jpg",
      colors: ["#000000", "#ffffff", "#c0c0c0"],
      description: "Iconic luxury sedan representing elegance and performance.",
      year: 2023,
      bodyType: "Sedan",
      availability: true
    },
    {
      id: 9,
      name: "Porsche 911",
      brand: "Porsche",
      price: 85000,
      fuel: "Petrol",
      seats: 4,
      transmission: "Automatic",
      image: "assets/images/porsche-911.jpg",
      colors: ["#000000", "#ffffff", "#ffcc00", "#c8102e"],
      description: "Legendary sports car with incredible performance and precision handling.",
      year: 2023,
      bodyType: "Coupe",
      availability: true
    },
    {
      id: 10,
      name: "Ford Mustang",
      brand: "Ford",
      price: 45000,
      fuel: "Petrol",
      seats: 4,
      transmission: "Manual",
      image: "assets/images/ford-mustang.jpg",
      colors: ["#000000", "#ff0000", "#ffd700", "#2e8b57"],
      description: "Iconic American muscle car with powerful engine and thrilling drive.",
      year: 2022,
      bodyType: "Coupe",
      availability: true
    },
    {
      id: 11,
      name: "Chevrolet Camaro",
      brand: "Chevrolet",
      price: 42000,
      fuel: "Petrol",
      seats: 4,
      transmission: "Manual",
      image: "assets/images/chevrolet-camaro.jpg",
      colors: ["#000000", "#ffffff", "#ff8c00", "#800080"],
      description: "High-performance coupe with aggressive styling and powerful acceleration.",
      year: 2022,
      bodyType: "Coupe",
      availability: true
    },
    {
      id: 12,
      name: "Land Rover Range Rover",
      brand: "Land Rover",
      price: 55000,
      fuel: "Diesel",
      seats: 5,
      transmission: "Automatic",
      image: "assets/images/land-rover-range-rover.jpg",
      colors: ["#000000", "#ffffff", "#4682b4", "#556b2f"],
      description: "Premium SUV with exceptional off-road capability and luxury interior.",
      year: 2023,
      bodyType: "SUV",
      availability: true
    },
    {
      id: 13,
      name: "Lexus LC 500",
      brand: "Lexus",
      price: 65000,
      fuel: "Petrol",
      seats: 4,
      transmission: "Automatic",
      image: "assets/images/lexus-lc-500.jpg",
      colors: ["#000000", "#ffffff", "#b22222", "#4169e1"],
      description: "Japanese luxury coupe with silky-smooth engine and cutting-edge technology.",
      year: 2023,
      bodyType: "Coupe",
      availability: true
    },
    {
      id: 14,
      name: "Jaguar F-Type",
      brand: "Jaguar",
      price: 52000,
      fuel: "Petrol",
      seats: 2,
      transmission: "Automatic",
      image: "assets/images/jaguar-f-type.jpg",
      colors: ["#000000", "#d4af37", "#006400", "#8b0000"],
      description: "British sports car combining sleek design with exhilarating performance.",
      year: 2022,
      bodyType: "Coupe",
      availability: true
    },
    {
      id: 15,
      name: "Maserati Ghibli",
      brand: "Maserati",
      price: 72000,
      fuel: "Petrol",
      seats: 5,
      transmission: "Automatic",
      image: "assets/images/maserati-ghibli.jpg",
      colors: ["#000000", "#ffffff", "#ff4500", "#2f4f4f"],
      description: "Italian luxury sedan with unmistakable styling and powerful presence.",
      year: 2023,
      bodyType: "Sedan",
      availability: true
    },
    {
      id: 16,
      name: "Ferrari 488",
      brand: "Ferrari",
      price: 150000,
      fuel: "Petrol",
      seats: 2,
      transmission: "Automatic",
      image: "assets/images/ferrari-488.jpg",
      colors: ["#000000", "#ff0000", "#ffd700", "#8b0000"],
      description: "High-performance Italian supercar with stunning speed and precision.",
      year: 2021,
      bodyType: "Coupe",
      availability: true
    },
    {
      id: 17,
      name: "Rolls Royce Phantom",
      brand: "Rolls Royce",
      price: 120000,
      fuel: "Petrol",
      seats: 5,
      transmission: "Automatic",
      image: "assets/images/rolls-royce-phantom.jpg",
      colors: ["#000000", "#ffffff", "#c0c0c0"],
      description: "Ultimate luxury vehicle for the most discerning clientele.",
      year: 2022,
      bodyType: "Sedan",
      availability: true
    },
    {
      id: 18,
      name: "Lamborghini Aventador",
      brand: "Lamborghini",
      price: 140000,
      fuel: "Petrol",
      seats: 2,
      transmission: "Automatic",
      image: "assets/images/lamborghini-aventador.jpg",
      colors: ["#ffff00", "#ff8c00", "#000000"],
      description: "Stunning hypercar with aggressive styling and incredible acceleration.",
      year: 2022,
      bodyType: "Coupe",
      availability: true
    },
    {
      id: 19,
      name: "Bentley Continental GT",
      brand: "Bentley",
      price: 98000,
      fuel: "Petrol",
      seats: 4,
      transmission: "Automatic",
      image: "assets/images/bentley-continental-gt.jpg",
      colors: ["#000000", "#ffffff", "#8b4513"],
      description: "Grand touring coupe blending luxury with exhilarating performance.",
      year: 2023,
      bodyType: "Coupe",
      availability: true
    },
    {
      id: 20,
      name: "Bugatti Chiron",
      brand: "Bugatti",
      price: 180000,
      fuel: "Petrol",
      seats: 2,
      transmission: "Automatic",
      image: "assets/images/bugatti-chiron.jpg",
      colors: ["#000000", "#0066ff", "#ff0000"],
      description: "One of the fastest production cars with unmatched speed and power.",
      year: 2022,
      bodyType: "Coupe",
      availability: true
    }
  ],

  // Initialize cars in localStorage
  init() {
    let carsData = localStorage.getItem(this.KEYS.CARS);
    const cachedVersion = localStorage.getItem(this.KEYS.CATALOG_VERSION);
    let needReset = false;

    if (cachedVersion !== this.CATALOG_VERSION) {
      needReset = true;
    } else if (carsData) {
      try {
        const parsed = JSON.parse(carsData);
        // If it's not a valid array, is empty, or is missing new specifications (like bodyType)
        if (
          !Array.isArray(parsed) ||
          parsed.length === 0 ||
          !parsed[0].hasOwnProperty('bodyType') ||
          !parsed[0].hasOwnProperty('image') ||
          parsed.some(car => car.image && (
            car.image.includes('source.unsplash.com') ||
            car.image.includes('images.unsplash.com') ||
            car.image.includes('image.pollinations.ai') ||
            car.image.startsWith('data:image/svg+xml')
          )) ||
          parsed.some(car => Array.isArray(car.galleryImages) && car.galleryImages.some(src => src !== car.image))
        ) {
          needReset = true;
        }
      } catch (e) {
        needReset = true;
      }
    } else {
      needReset = true;
    }

    if (needReset) {
      this.saveCars(this.DEFAULT_CARS);
      localStorage.setItem(this.KEYS.CATALOG_VERSION, this.CATALOG_VERSION);
      console.log('Dynamic Vehicle Catalog cache upgraded/repaired successfully');
    }
  },

  // Get current catalog of cars
  getCars() {
    try {
      const data = localStorage.getItem(this.KEYS.CARS);
      const cars = data ? JSON.parse(data) : [];
      return cars.map((car, index) => this.normalizeCar(car, index));
    } catch (e) {
      console.error('Error fetching cars from local store', e);
      return this.DEFAULT_CARS.map((car, index) => this.normalizeCar(car, index));
    }
  },

  // Save cars back to localStorage
  saveCars(carsList) {
    const normalizedCars = carsList.map((car, index) => this.normalizeCar(car, index));
    localStorage.setItem(this.KEYS.CARS, JSON.stringify(normalizedCars));
    localStorage.setItem('cars', JSON.stringify(normalizedCars)); // DUAL WRITE for legacy compat
    localStorage.setItem(this.KEYS.CATALOG_VERSION, this.CATALOG_VERSION);
  },

  // Fetch specific car by ID
  getCarById(id) {
    const cars = this.getCars();
    return cars.find(car => car.id == id) || null;
  },

  // Check JWT Token expiration
  isTokenExpired() {
    const exp = localStorage.getItem(this.KEYS.JWT_EXP);
    if (!exp) return true;
    return Date.now() > parseInt(exp);
  },

  // Authenticate with CARAPI to retrieve a JWT Token
  async getJWT() {
    if (!this.isTokenExpired()) {
      return localStorage.getItem(this.KEYS.JWT);
    }

    console.log('Authenticating with CARAPI...');
    try {
      const response = await fetch(`${CARAPI_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Accept': 'text/plain',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_token: CARAPI_TOKEN,
          api_secret: CARAPI_SECRET
        })
      });

      if (!response.ok) {
        throw new Error(`Login failed with status code ${response.status}`);
      }

      const jwt = await response.text();
      // Store token and set expiration to 7 days in the future
      localStorage.setItem(this.KEYS.JWT, jwt);
      const expirationTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem(this.KEYS.JWT_EXP, expirationTime.toString());
      console.log('CARAPI Authentication Successful');
      return jwt;
    } catch (error) {
      console.warn('CARAPI Auth Error (falling back to cached CARAPI catalog):', error.message);
      return null;
    }
  },

  // Sync inventory directly from CARAPI using public/verbose endpoints
  async syncFromAPI() {
    try {
      const token = await this.getJWT();
      if (!token) {
        throw new Error('Authentication unsuccessful or blocked by CORS policies.');
      }

      // Fetch trims from CARAPI
      // Using an allorigins proxy to bypass CORS if called client-side
      const targetUrl = `${CARAPI_BASE_URL}/api/trims?verbose=yes&limit=25`;
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;

      console.log('Fetching live trims from CARAPI...');
      const response = await fetch(proxyUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch from CARAPI: ${response.statusText}`);
      }

      const payload = await response.json();
      const trims = payload.data || [];

      if (trims.length === 0) {
        throw new Error('No trims found in CARAPI response.');
      }

      // Map trims to LuxeGo model schema
      const syncedCars = trims.map((trim, index) => {
        const id = index + 1;
        const brand = trim.make?.name || 'Unknown Make';
        const model = trim.model?.name || 'Unknown Model';
        const year = trim.year || new Date().getFullYear();
        const trimName = trim.trim || '';
        const name = `${brand} ${model} ${trimName}`.trim();
        const bodyType = trim.body?.type || 'Sedan';
        
        // Map specs
        const transmission = trim.transmission?.type || 'Automatic';
        const fuel = trim.engine?.fuel_type || 'Petrol';
        const seats = trim.seats?.count || 5;

        // Pricing simulation based on MSRP or year
        const msrp = trim.msrp || 30000;
        const price = Math.round((msrp * 0.001) + (10 * (seats > 5 ? 1.5 : 1.0)));

        return this.normalizeCar({
          id: id,
          name: name,
          brand: brand,
          modelName: model,
          price: price || 60,
          fuel: fuel,
          seats: seats,
          transmission: transmission,
          colors: ["#ffffff", "#000000", "#c0c0c0", "#ff0000"],
          description: `${year} ${brand} ${model} ${trimName} with ${bodyType} layout, ${fuel} powertrain, ${transmission} transmission, and seating for ${seats}.`,
          year: year,
          bodyType: bodyType,
          availability: true
        }, index);
      });

      // Save to localStorage
      this.saveCars(syncedCars);
      return { success: true, count: syncedCars.length };
    } catch (error) {
      console.warn('Sync failed (will continue using robust local inventory):', error.message);
      // Simulate sync with augmented cache for admin presentation
      const cached = this.getCars();
      if (cached.length === 0) {
        this.saveCars(this.DEFAULT_CARS);
      }
      return { success: false, error: error.message, count: this.getCars().length };
    }
  },

  // Check if a car is available for a given range of dates
  checkAvailability(carId, pickupDateStr, dropoffDateStr) {
    if (!pickupDateStr || !dropoffDateStr) return true;
    
    const pickup = new Date(pickupDateStr);
    const dropoff = new Date(dropoffDateStr);
    
    // Fetch all confirmed bookings
    const bookings = JSON.parse(localStorage.getItem(this.KEYS.BOOKINGS)) || [];
    
    // Look for active conflicting bookings for the same car
    const conflict = bookings.find(booking => {
      if (booking.carId != carId) return false;
      if (booking.status === 'cancelled') return false;
      
      const bPickup = new Date(booking.pickupDate);
      const bDropoff = new Date(booking.dropoffDate);
      
      // Ranges overlap if: bPickup <= dropoff AND pickup <= bDropoff
      return bPickup <= dropoff && pickup <= bDropoff;
    });
    
    return !conflict;
  }
};

// Auto initialize on load
CarAPI.init();
window.CarAPI = CarAPI; // Make globally accessible
