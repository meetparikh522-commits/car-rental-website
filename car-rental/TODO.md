# TODO

- [ ] Determine “previous” pricing logic from the requirement: set every car price above 15000 and assign rent according to brand.
- [ ] Update `assets/js/api.js`:
  - [ ] Adjust `DEFAULT_CARS[].price` based on brand rules (and keep all prices > 15000).
  - [ ] Bump `CATALOG_VERSION` so localStorage resets.
- [ ] Update `cars-data.json`:
  - [ ] Adjust each car’s `price` to match the same brand-based rule and ensure > 15000.
- [ ] Verify booking totals and car cards reflect updated pricing.

