document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('is-ready');

  const catalog = [
    { id: 'ambatron-4', name: 'Ambatron 4', category: 'Camera Drone', price: 1299, image: 'https://api.builder.io/api/v1/image/assets/TEMP/7b55596cdf95235079ccfb686acf3250a69f9056?width=900' },
    { id: 'video-product', name: 'Video Product', category: 'Aerial Filmmaking', price: 899, image: 'https://api.builder.io/api/v1/image/assets/TEMP/9173e44a45ce5019dc1b3af481cd3f24d9d0e0b6?width=778' },
    { id: 'enterprise', name: 'Enterprise', category: 'Professional Drone', price: 2499, image: 'https://api.builder.io/api/v1/image/assets/TEMP/0fe971e98fa0c6caf7c371a0c51d2c5b31b5783b?width=778' },
    { id: 'agriculture', name: 'Agriculture', category: 'Agricultural Drone', price: 1899, image: 'https://api.builder.io/api/v1/image/assets/TEMP/9fc7ce2c70160b493c4af5a52f1c077a54f4064a?width=778' },
    { id: 'fuad-360', name: 'FUAD 360', category: '360 Camera', price: 699, image: 'https://api.builder.io/api/v1/image/assets/TEMP/abee392689392d6f8101dce55ff4b792724d8cfd?width=900' }
  ];
  const readCart = () => {
    try { return JSON.parse(localStorage.getItem('amba-cart') || '[]'); }
    catch { return []; }
  };
  const writeCart = (cart) => {
    localStorage.setItem('amba-cart', JSON.stringify(cart));
    document.querySelectorAll('.cart-count').forEach((badge) => {
      badge.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    });
  };
  const money = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const itemFor = (id) => catalog.find((item) => item.id === id);

  document.querySelectorAll('.nav__icons a[aria-label="Search"], .icons a[aria-label="Search"]').forEach((link) => { link.href = 'search.html'; });
  document.querySelectorAll('.nav__icons a[aria-label="Cart"], .icons a[aria-label="Cart"]').forEach((link) => {
    link.href = 'checkout.html';
    const badge = document.createElement('span');
    badge.className = 'cart-count';
    badge.textContent = readCart().reduce((total, item) => total + item.quantity, 0);
    link.append(badge);
  });

  document.querySelectorAll('.product-card, .product').forEach((card) => {
    const title = card.querySelector('.product-card__category, h2')?.textContent.trim().toLowerCase();
    const item = catalog.find((product) => product.name.toLowerCase() === title);
    if (!item) return;
    const action = card.querySelector('.learn-more, .button[href="#"]');
    if (!action) return;
    const button = document.createElement('button');
    button.className = `${action.className} add-to-cart`;
    button.type = 'button';
    button.dataset.addToCart = item.id;
    button.textContent = `ADD TO BAG · ${money(item.price)}`;
    action.replaceWith(button);
  });

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-add-to-cart]');
    if (!button) return;
    const item = itemFor(button.dataset.addToCart);
    if (!item) return;
    const cart = readCart();
    const existing = cart.find((entry) => entry.id === item.id);
    if (existing) existing.quantity += 1;
    else cart.push({ id: item.id, quantity: 1 });
    writeCart(cart);
    const originalText = button.textContent;
    button.textContent = 'ADDED';
    button.classList.add('is-added');
    window.setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('is-added');
    }, 1100);
  });

  const searchInput = document.querySelector('#product-search');
  if (searchInput) {
    const results = document.querySelector('#search-results');
    const renderSearch = () => {
      const query = searchInput.value.trim().toLowerCase();
      const matches = catalog.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(query));
      results.innerHTML = matches.length ? matches.map((item) => `
        <article class="search-product">
          <div><p>${item.category}</p><h2>${item.name}</h2><strong>${money(item.price)}</strong></div>
          <button type="button" data-add-to-cart="${item.id}" aria-label="Add ${item.name} to bag">Add to bag</button>
        </article>`).join('') : '<p class="search-empty">No products match that search.</p>';
    };
    searchInput.addEventListener('input', renderSearch);
    renderSearch();
  }

  const checkoutItems = document.querySelector('#checkout-items');
  if (checkoutItems) {
    const subtotal = document.querySelector('#checkout-subtotal');
    const empty = document.querySelector('#checkout-empty');
    const form = document.querySelector('#checkout-form');
    const renderCheckout = () => {
      const cart = readCart().filter((entry) => itemFor(entry.id));
      checkoutItems.innerHTML = cart.map((entry) => {
        const item = itemFor(entry.id);
        return `<article class="checkout-item"><img src="${item.image}" alt=""><div class="checkout-item__details"><h2>${item.name}</h2><p>${money(item.price)} each</p><div class="quantity-control"><button type="button" data-quantity="-1" data-item="${item.id}" aria-label="Decrease ${item.name} quantity">−</button><span>${entry.quantity}</span><button type="button" data-quantity="1" data-item="${item.id}" aria-label="Increase ${item.name} quantity">+</button><button type="button" class="remove-item" data-remove-item="${item.id}">Remove</button></div></div><strong>${money(item.price * entry.quantity)}</strong></article>`;
      }).join('');
      const total = cart.reduce((sum, entry) => sum + itemFor(entry.id).price * entry.quantity, 0);
      subtotal.textContent = money(total);
      document.querySelector('#checkout-subtotal-total').textContent = money(total);
      empty.hidden = cart.length > 0;
      form.hidden = cart.length === 0;
      document.querySelector('#checkout-summary').hidden = cart.length === 0 && !document.querySelector('#checkout-message').textContent;
      writeCart(cart);
    };
    checkoutItems.addEventListener('click', (event) => {
      const quantityButton = event.target.closest('[data-quantity]');
      const removeButton = event.target.closest('[data-remove-item]');
      let cart = readCart();
      if (quantityButton) {
        const item = cart.find((entry) => entry.id === quantityButton.dataset.item);
        if (item) item.quantity += Number(quantityButton.dataset.quantity);
        cart = cart.filter((entry) => entry.quantity > 0);
      }
      if (removeButton) cart = cart.filter((entry) => entry.id !== removeButton.dataset.removeItem);
      writeCart(cart);
      renderCheckout();
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      localStorage.removeItem('amba-cart');
      document.querySelector('#checkout-message').textContent = 'Order placed for this demo. No payment was processed.';
      renderCheckout();
    });
    renderCheckout();
  }

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a, .nav__links a, .links a').forEach((link) => {
    const target = link.getAttribute('href') || '';
    if (target.split('#')[0] === currentPage) {
      link.classList.add('is-active');
    }
  });

  document.querySelectorAll('.nav__icons a[aria-label="Account"], .icons a[aria-label="Account"]').forEach((link) => {
    link.setAttribute('href', 'login.html');
    const control = document.createElement('span');
    control.className = 'account-control';
    link.parentNode.insertBefore(control, link);
    control.appendChild(link);
    control.insertAdjacentHTML('beforeend', '<span class="account-menu"><a href="login.html">Log in</a><a href="login.html#register">Register</a></span>');
  });

  const revealSelector =
    '.intro, .hero-image, .story, .feature-band, .specs, .uses, .products, .product, .fuad, .services, .support, .support-section, .support-shortcut, .support-info, .faq-item, .drone-video, .site-footer__column, .footer';
  const revealItems = document.querySelectorAll(revealSelector);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  revealItems.forEach((item) => {
    item.dataset.reveal = '';
    const siblings = [...item.parentElement.children].filter((sibling) => sibling.matches(revealSelector));
    const stagger = Math.min(siblings.indexOf(item) * 75, 225);
    item.style.transitionDelay = reduceMotion ? '0ms' : `${stagger}ms`;
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  document.querySelectorAll('[data-tilt], .product-card, .card, .service').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const bounds = card.getBoundingClientRect();
      const rotateX = ((event.clientY - bounds.top) / bounds.height - 0.5) * -3;
      const rotateY = ((event.clientX - bounds.left) / bounds.width - 0.5) * 3;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });

  const drone = document.querySelector('.hero__drone');
  if (drone && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('pointermove', (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 10;
      const y = (event.clientY / window.innerHeight - 0.5) * 8;
      drone.style.setProperty('--pointer-x', `${x}px`);
      drone.style.setProperty('--pointer-y', `${y}px`);
    }, { passive: true });
  }

  const faqSearch = document.querySelector('#faq-search');
  if (faqSearch) {
    const faqItems = [...document.querySelectorAll('.faq-item')];
    const emptyMessage = document.querySelector('#faq-empty');
    faqSearch.addEventListener('input', () => {
      const query = faqSearch.value.trim().toLowerCase();
      let visibleCount = 0;
      faqItems.forEach((item) => {
        const matches = item.textContent.toLowerCase().includes(query);
        item.hidden = !matches;
        if (matches) visibleCount += 1;
      });
      emptyMessage.hidden = visibleCount > 0;
    });
  }

  const supportRequest = document.querySelector('#support-request');
  if (supportRequest) {
    supportRequest.addEventListener('submit', (event) => {
      event.preventDefault();
      const fields = new FormData(supportRequest);
      const subject = `Ambatron support request: ${fields.get('topic')}`;
      const body = [
        `Name: ${fields.get('name')}`,
        `Email: ${fields.get('email')}`,
        `Product model: ${fields.get('model') || 'Not provided'}`,
        `Topic: ${fields.get('topic')}`,
        '',
        'Issue description:',
        fields.get('message')
      ].join('\n');
      window.location.href = `mailto:support@ambatron.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }
});
