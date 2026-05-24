# LuxeGo Car Rental

## Overview

LuxeGo is a modern and stylish car rental website. It provides a seamless user experience for finding, booking, and managing car rentals. The design is clean, with a focus on high-quality imagery and intuitive navigation.

## Implemented Features

### Design & Style

*   **Color Palette:** A sophisticated color scheme of dark gray, gold, and white is used to create a luxurious and premium feel.
*   **Typography:** The Poppins font is used for its clean and modern aesthetic.
*   **Layout:** The layout is clean and spacious, with a focus on readability and ease of use.
*   **Imagery:** High-quality images of luxury cars are used throughout the site to create a visually appealing experience.
*   **Theme Toggle:** A theme toggle allows users to switch between light and dark modes.

### Pages & Navigation

*   **Home Page:** A welcoming landing page with a hero section, featured cars, a "How it Works" section, and a call-to-action.
*   **Cars Page:** A grid of available cars with filtering and sorting options.
*   **Car Details Page:** A page with a large image gallery, specifications, availability, price, similar cars, and reviews. A "Book Now" button takes the user to the booking page for the selected car.
*   **Wishlist Page:** A page where users can view their saved cars.
*   **About Page:** A page with information about the company.
*   **Contact Page:** A page with a contact form and company details.
*   **Login & Sign Up Pages:** Forms for user authentication.
*   **FAQ Page:** A page with frequently asked questions.
*   **Reviews Page:** A page with customer reviews.
*   **Booking & Receipt Pages:** A multi-step booking process and a final confirmation receipt page.
*   **Dashboard Page:** A user dashboard to manage profile, booking history, wishlist, notifications, and reviews.
*   **Admin Page:** A dedicated admin dashboard for managing the platform.
*   **Navigation:** An intuitive navigation bar provides easy access to all pages. It dynamically updates to show the user's name and a "Logout" button when they are logged in. The "Booking" link is now included in the main navigation.

### Interactivity & User Features

*   **Hero Section:** An eye-catching hero section with a headline and a call-to-action button.
*   **Featured Cars:** A section showcasing a selection of popular cars.
*   **How it Works:** A step-by-step guide to renting a car.
*   **Testimonials:** A section with quotes from satisfied customers.
*   **Call to Action:** A prominent call-to-action button encourages users to browse cars.
*   **Footer:** A footer with copyright information.
*   **Theme Toggle:** A button to toggle between light and dark modes.
*   **User Authentication:**
    *   **Login & Sign Up:** Secure login and signup forms with client-side validation for email format and password strength. Logged-in users are redirected from these pages.
    *   **Password Visibility:** A toggle to show or hide the password.
    *   **Session Management:** The application uses `localStorage` to maintain user sessions, keeping them logged in across pages.
    *   **Dynamic Navigation:** The navigation bar updates to greet logged-in users by name and provides a "Logout" button.
*   **Wishlist:** Users can add and remove cars from their personal wishlist, which is saved in `localStorage`.

### Booking Module

*   **Multi-Step Form:** A user-friendly, multi-step booking form guides users through the process (Details -> Payment -> Confirmation).
*   **Booking Details:**
    *   Users can specify pickup and drop-off locations.
    *   Date and time selectors for pickup and drop-off.
    *   The selected car's details are displayed for confirmation.
*   **Price Calculation:**
    *   The total price is dynamically calculated based on the rental duration.
    *   Support for coupon codes (e.g., `LUXEGO10` for a 10% discount).
*   **Fake Payment System:**
    *   Multiple simulated payment options are provided: Demo UPI, Demo Card, Demo Wallet, and Cash on Pickup.
    *   The system simulates payment success or failure.
*   **Booking Confirmation:**
    *   A `receipt.html` page displays the final status of the booking (Success or Failed).
    *   For successful bookings, a summary of the rental details is shown.

### User Dashboard

*   **User-Centric Design:** A dedicated dashboard for users to manage their activities.
*   **Sidebar Navigation:** Easy access to My Profile, Booking History, My Wishlist, Notifications, and My Reviews.
*   **Dynamic Content:** The dashboard displays user-specific information, such as their name, email, booking history, and wishlist items.

### Admin Dashboard

*   **Admin Panel:** A dedicated `admin.html` page for managing the platform.
*   **Sidebar Navigation:** Easy navigation between Dashboard, Manage Cars, Manage Bookings, and Manage Users sections.
*   **Analytics:**
    *   Dashboard view with key metrics: Total Cars, Total Users, Total Revenue.
    *   A revenue chart to visualize earnings over time.
*   **Car Management:**
    *   Interface to add, edit, and delete cars from the inventory.
*   **Booking Management:**
    *   View and manage all user bookings.
*   **User Management:**
    *   View and manage all registered users.

## Current Task: Responsive Design and Footer Links

I will add a responsive design to the website to ensure it works well on mobile and web. I will also add links to the `faq.html` and `reviews.html` pages in the footer of all pages.
