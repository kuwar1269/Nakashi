// cart.js - Complete Shopping Cart Functionality
let cart = JSON.parse(localStorage.getItem('nakashiCart')) || [];

function updateCartCount() {
    const cartIcons = document.querySelectorAll('.icon:last-child, .fa-bag-shopping');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartIcons.forEach(icon => {
        icon.setAttribute('data-count', totalItems);
        if (totalItems > 0) {
            icon.style.position = 'relative';
            let badge = icon.querySelector('.cart-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'cart-badge';
                badge.style.cssText = 'position:absolute;top:-8px;right:-8px;background:#ff4444;color:white;border-radius:50%;width:18px;height:18px;font-size:12px;display:flex;align-items:center;justify-content:center;font-weight:bold;';
                icon.appendChild(badge);
            }
            badge.textContent = totalItems;
        } else {
            const badge = icon.querySelector('.cart-badge');
            if (badge) badge.remove();
        }
    });
}

function addToCart(productTitle, price, imageSrc = '', productUrl = '', quantity = 1) {
    const existingItem = cart.find(item => item.title === productTitle && item.price === price);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ title: productTitle, price: parseFloat(price.replace(/[^\d.]/g, '')), image: imageSrc, url: productUrl, quantity });
    }
    localStorage.setItem('nakashiCart', JSON.stringify(cart));
    updateCartCount();
    
    // Visual feedback
    const btn = event.target.closest('.btn-cart, .cart-btn-buy');
    if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Added!';
        btn.style.backgroundColor = '#28a745';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.backgroundColor = '';
        }, 1500);
    }
    
    console.log('Added to cart:', { title: productTitle, price, quantity });
}

function initCartButtons() {
    // Grid product cards (beds.html, table-and-chair.html, etc.)
    document.querySelectorAll('.btn-cart').forEach(btn => {
        btn.onclick = function(e) {
            e.preventDefault();
            const card = this.closest('.product-card, article');
            const title = card.querySelector('.product-title, h3').textContent.trim();
            const price = card.querySelector('.product-price').textContent.trim();
            const img = card.querySelector('img')?.src || '';
            addToCart(title, price, img);
        };
    });
    
    // Detail page buttons (Chettinad_upholstered_bed.html, etc.)
    document.querySelectorAll('.cart-btn-buy:not([onclick])').forEach(btn => {
        const originalOnclick = btn.getAttribute('onclick');
        btn.onclick = function(e) {
            if (originalOnclick) eval(originalOnclick); // Keep existing alert
            const title = document.querySelector('h1').textContent.trim();
            const price = document.querySelector('.price-large, .price-small').textContent.trim();
            const img = document.querySelector('.main-image')?.src || '';
            const qtySelect = document.querySelector('#quantity');
            const qty = parseInt(qtySelect?.value || 1);
            addToCart(title, price, img, window.location.href, qty);
        };
    });
    
    // Cart icon click handlers
    document.querySelectorAll('.icon:last-child, .fa-bag-shopping').forEach(icon => {
        icon.style.cursor = 'pointer';
        icon.onclick = function(e) {
            e.stopPropagation();
            showCartModal();
        };
    });
    
    updateCartCount();
}

function showCartModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);
        z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;
    `;
    modal.innerHTML = `
        <div style="background:white;border-radius:15px;max-width:500px;max-height:80vh;overflow-y:auto;width:90%;position:relative;">
            <div style="padding:20px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;">
                <h2 style="margin:0;font-family:Poppins,sans-serif;">Shopping Cart (${cart.length} items)</h2>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background:none;border:none;font-size:24px;cursor:pointer;">×</button>
            </div>
            <div id="cart-items" style="padding:20px;"></div>
            <div style="padding:20px;border-top:1px solid #eee;">
                <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:18px;margin-bottom:15px;">
                    <span>Total: ₹${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
                </div>
                <button onclick="checkout()" style="width:100%;padding:15px;background:#f7b844;color:#222;border:none;border-radius:8px;font-weight:bold;font-size:16px;cursor:pointer;">Proceed to Checkout</button>
            </div>
        </div>
    `;
    
    function renderItems() {
        const container = modal.querySelector('#cart-items');
        if (cart.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#666;padding:40px 20px;">Your cart is empty</p>';
            return;
        }
        container.innerHTML = cart.map((item, index) => `
            <div style="display:flex;align-items:center;padding:15px 0;border-bottom:1px solid #f0f0f0;">
                <img src="${item.image}" style="width:60px;height:60px;object-fit:cover;border-radius:5px;margin-right:15px;">
                <div style="flex:1;">
                    <div style="font-weight:500;">${item.title}</div>
                    <div style="color:#666;">₹${item.price.toLocaleString()} x 
                        <select onchange="updateQuantity(${index}, this.value)" style="width:60px;margin:0 10px;border:1px solid #ddd;padding:2px;border-radius:3px;">
                            ${[1,2,3,4,5].map(q => `<option ${q === item.quantity ? 'selected' : ''}>${q}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:bold;color:#333;">₹${(item.price * item.quantity).toLocaleString()}</div>
                    <button onclick="removeFromCart(${index})" style="background:#ff4444;color:white;border:none;border-radius:4px;padding:5px 10px;font-size:12px;cursor:pointer;margin-top:5px;">Remove</button>
                </div>
            </div>
        `).join('');
    }
    
    renderItems();
    document.body.appendChild(modal);
}

function updateQuantity(index, qty) {
    cart[index].quantity = parseInt(qty);
    localStorage.setItem('nakashiCart', JSON.stringify(cart));
    updateCartCount();
    // Re-render modal if open
    const modal = document.querySelector('#cart-items')?.closest('div[style*="position:fixed"]');
    if (modal) showCartModal();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('nakashiCart', JSON.stringify(cart));
    updateCartCount();
    showCartModal();
}

function checkout() {
    if (cart.length === 0) return;
    alert(`Proceeding to checkout with ${cart.length} items!\nTotal: ₹${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}\n\n(Implement payment gateway integration here)`);
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', initCartButtons);
