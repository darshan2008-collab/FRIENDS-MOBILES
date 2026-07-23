// FRIENDS MOBILE - Interactive Functionality

document.addEventListener('DOMContentLoaded', () => {
  let cartCount = 3;
  const cartBadge = document.getElementById('cartBadge');
  const toastContainer = document.getElementById('toastContainer');

  // Helper: Show Toast Notification
  function showToast(message, icon = '🛒') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // Add to Cart Handlers
  document.querySelectorAll('.add-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      cartCount++;
      if (cartBadge) {
        cartBadge.textContent = cartCount;
        cartBadge.style.transform = 'scale(1.4)';
        setTimeout(() => cartBadge.style.transform = 'scale(1)', 200);
      }

      // Get product title
      const card = btn.closest('.product-card');
      const title = card ? card.querySelector('.prod-title').textContent : 'Item';
      showToast(`Added "${title.slice(0, 20)}..." to Cart!`, '🛍️');
    });
  });

  // Wishlist Heart Toggle
  document.querySelectorAll('.wishlist-icon-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn.classList.toggle('liked');
      const isLiked = btn.classList.contains('liked');
      showToast(isLiked ? 'Added to Wishlist ❤️' : 'Removed from Wishlist', isLiked ? '❤️' : '🤍');
    });
  });

  // Newsletter Submission
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletterEmail');
      if (emailInput && emailInput.value) {
        showToast('Subscribed to newsletter successfully!', '📩');
        emailInput.value = '';
      }
    });
  }

  // Product Search Filter
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const productCards = document.querySelectorAll('.product-card');

  function filterProducts() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let foundCount = 0;

    productCards.forEach(card => {
      const title = card.querySelector('.prod-title').textContent.toLowerCase();
      if (title.includes(query)) {
        card.style.display = 'flex';
        foundCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (query.length > 0 && foundCount === 0) {
      showToast(`No products found for "${query}"`, '🔍');
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterProducts);
  }
  if (searchBtn) {
    searchBtn.addEventListener('click', filterProducts);
  }

  // Next Carousel Button Smooth Scroll
  const nextProdBtn = document.getElementById('nextProdBtn');
  const productsGrid = document.getElementById('productsGrid');

  if (nextProdBtn && productsGrid) {
    nextProdBtn.addEventListener('click', () => {
      productsGrid.scrollBy({ left: 300, behavior: 'smooth' });
    });
  }

  // Smooth scroll for internal anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
});
