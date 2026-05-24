document.addEventListener('DOMContentLoaded', () => {
    const themeToggler = document.querySelector('.theme-toggler');
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const loader = document.getElementById('loader');

    // --- Dynamic Navigation Guard for Admin Portal link ---
    const checkNavbarAdminLink = () => {
        const adminLinks = document.querySelectorAll('nav a[href="admin.html"], ul.nav-links a[href="admin.html"], footer a[href="admin.html"]');
        adminLinks.forEach(link => {
            const li = link.closest('li');
            if (li) {
                if (localStorage.getItem('isAdminLoggedIn') === 'true') {
                    li.style.display = '';
                } else {
                    li.style.display = 'none';
                }
            }
        });
    };
    checkNavbarAdminLink();

    const formatPrice = (amount) => {
        if (typeof formatCurrency === 'function') return formatCurrency(amount);
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    // Show loader on page load (with resilient fail-safe)
    if (loader) {
        const hideLoader = () => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        };
        
        if (document.readyState === 'complete') {
            hideLoader();
        } else {
            window.addEventListener('load', hideLoader);
            // Fail-safe to ensure loader never hangs if image load delay occurs
            setTimeout(hideLoader, 1500);
        }
    }

    // --- Theme (Dark/Light Mode) --- //
    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateThemeTogglerIcon(theme);
    };

    const updateThemeTogglerIcon = (theme) => {
        if (themeToggler) {
            themeToggler.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
    };

    if (themeToggler) {
        themeToggler.addEventListener('click', () => {
            const currentTheme = localStorage.getItem('theme') || 'light';
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // --- Mobile Menu --- //
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // --- Wishlist Management --- //
    const getWishlist = () => JSON.parse(localStorage.getItem('wishlist')) || [];
    const saveWishlist = (wishlist) => localStorage.setItem('wishlist', JSON.stringify(wishlist));

    const addToWishlist = (car) => {
        try {
            let wishlist = getWishlist();
            if (!wishlist.some(item => item.id === car.id)) {
                wishlist.push(car);
                saveWishlist(wishlist);
                alert(`${car.name} has been added to your wishlist.`);
                updateWishlistDisplay(); // Update display if on the right page
            } else {
                alert(`${car.name} is already in your wishlist.`);
            }
        } catch (error) {
            console.error("Error adding to wishlist:", error);
            alert("Could not add car to wishlist. Please try again.");
        }
    };

    const removeFromWishlist = (carId) => {
        try {
            let wishlist = getWishlist();
            const updatedWishlist = wishlist.filter(car => car.id != carId);
            if (wishlist.length !== updatedWishlist.length) {
                saveWishlist(updatedWishlist);
                updateWishlistDisplay(); // Re-render the wishlist display
            }
        } catch (error) {
            console.error("Error removing from wishlist:", error);
            alert("Could not remove car from wishlist. Please try again.");
        }
    };

    const updateWishlistDisplay = () => {
        const wishlistGrid = document.getElementById('wishlist-grid');
        const wishlistItems = document.getElementById('wishlist-items'); // For dashboard

        const container = wishlistGrid || wishlistItems;
        if (!container) return; // Exit if no wishlist container on the page

        const wishlist = getWishlist();
        container.innerHTML = ''; // Clear current items

        if (wishlist.length === 0) {
            container.innerHTML = '<p>Your wishlist is empty.</p>';
            return;
        }

        wishlist.forEach(car => {
            const carCard = document.createElement('div');
            carCard.classList.add('car-card');
            carCard.innerHTML = `
                <img src="${car.image}" alt="${car.name}">
                <div class="car-card-content">
                    <h3>${car.name}</h3>
                    <p class="price">${formatPrice(car.price)}/day</p>
                    <div class="car-card-actions">
                         <button class="btn btn-secondary" onclick="location.href='booking.html?carId=${car.id}'">Book Now</button>
                         <button class="btn remove-from-wishlist" data-id="${car.id}">Remove</button>
                    </div>
                </div>
            `;
            container.appendChild(carCard);
        });
    };

    // --- Event Delegation for Wishlist actions --- //
    document.body.addEventListener('click', (event) => {
        // Add to Wishlist
        if (event.target.classList.contains('add-to-wishlist')) {
            const button = event.target;
            const car = {
                id: button.dataset.id,
                name: button.dataset.name,
                price: button.dataset.price,
                image: button.dataset.image,
            };
            addToWishlist(car);
        }

        // Remove from Wishlist
        if (event.target.classList.contains('remove-from-wishlist')) {
            const carId = event.target.dataset.id;
            removeFromWishlist(carId);
        }
    });

    // Initial render on relevant pages
    if (window.location.pathname.includes('wishlist.html') || window.location.pathname.includes('dashboard.html')) {
        updateWishlistDisplay();
    }

    // --- FAQ Accordion ---
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            item.classList.toggle('active');
        });
    });

    // --- Render Featured Cars dynamically from CarAPI --- //
    const featuredCarGrid = document.querySelector('.featured-cars .car-grid');
    if (featuredCarGrid) {
        const cars = typeof CarAPI !== 'undefined' ? CarAPI.getCars() : [];
        if (cars.length > 0) {
            featuredCarGrid.innerHTML = '';
            // Render the full dynamic CARAPI catalog on the home page.
            cars.forEach(car => {
                const carCard = document.createElement('div');
                carCard.className = 'car-card';
                carCard.style.display = 'flex';
                carCard.style.flexDirection = 'column';
                carCard.style.justifyContent = 'space-between';
                carCard.style.height = '100%';
                
                carCard.innerHTML = `
                    <div style="position: relative; overflow: hidden; border-radius: 4px;">
                        <img src="${car.image}" alt="${car.name}" loading="lazy" style="width: 100%; height: 180px; object-fit: cover;">
                    </div>
                    <div class="car-card-content" style="padding: 20px 0 0 0; display: flex; flex-direction: column; flex-grow: 1; justify-content: space-between;">
                        <div>
                            <h3 style="margin: 0 0 8px 0; font-size: 1.25rem;">${car.name}</h3>
                            <p style="font-weight: 600; color: var(--primary-color); font-size: 1.1rem; margin: 0 0 15px 0;">${formatPrice(car.price)}/day</p>
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: auto;">
                            <button class="btn btn-secondary add-to-wishlist" data-id="${car.id}" data-name="${car.name}" data-price="${formatPrice(car.price)}/day" data-image="${car.image}" style="flex: 1; padding: 8px 12px; font-size: 0.85rem;">Wishlist</button>
                            <a href="booking.html?car_id=${car.id}" class="btn btn-primary" style="flex: 1; padding: 8px 12px; font-size: 0.85rem; text-align: center; text-decoration: none;">Book Now</a>
                        </div>
                    </div>
                `;
                featuredCarGrid.appendChild(carCard);
            });
        }
    }
});
