const API_BASE_URL = 'http://localhost:5000/api';

let menuData = [];
let cart = JSON.parse(localStorage.getItem('kazmikitchen_cart')) || [];

// DOM Elements
const menuContainer = document.getElementById('menu-container');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const openCartBtn = document.getElementById('open-cart-btn');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalCount = document.getElementById('cart-count');
const cartTotalPrice = document.getElementById('cart-total-price');
const filterBtns = document.querySelectorAll('.filter-btn');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const checkoutForm = document.getElementById('checkout-form');

// Fetch Menu from Express Backend API
async function fetchMenu() {
    try {
        const response = await fetch(`${API_BASE_URL}/menu`);
        const result = await response.json();
        if (result.success) {
            menuData = result.data;
            renderMenu('All');
        }
    } catch (error) {
        console.error('Error fetching menu:', error);
        menuContainer.innerHTML = '<p style="text-align:center; color:red;">Failed to load menu from backend server.</p>';
    }
}

// Render Menu Cards
function renderMenu(category = 'All') {
    menuContainer.innerHTML = '';
    const filtered = category === 'All' 
        ? menuData 
        : menuData.filter(item => item.category === category);

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'food-card';
        card.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="food-info">
                <div class="food-title">${item.title}</div>
                <div class="food-desc">${item.desc}</div>
                <div class="food-bottom">
                    <span class="food-price">$${item.price.toFixed(2)}</span>
                    <button class="add-cart-btn" onclick="addToCart(${item.id})">Add to Cart</button>
                </div>
            </div>
        `;
        menuContainer.appendChild(card);
    });
}

// Category Filter Event Listeners
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderMenu(btn.dataset.category);
    });
});

// Cart State Management
function addToCart(id) {
    const item = menuData.find(prod => prod.id === id);
    const existingIndex = cart.findIndex(cItem => cItem.id === id);

    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    updateCart();
}

function updateQuantity(id, change) {
    const index = cart.findIndex(item => item.id === id);
    if (index > -1) {
        cart[index].qty += change;
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
    }
    updateCart();
}

function updateCart() {
    localStorage.setItem('kazmikitchen_cart', JSON.stringify(cart));
    renderCart();
}

function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    let count = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align:center; color: #888; margin-top: 20px;">Your cart is empty.</p>';
    } else {
        cart.forEach(item => {
            total += item.price * item.qty;
            count += item.qty;

            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div>
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)} x ${item.qty}</div>
                </div>
                <div class="cart-controls">
                    <button onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(div);
        });
    }

    cartTotalCount.textContent = count;
    cartTotalPrice.textContent = `$${total.toFixed(2)}`;
}

// Cart Drawer Visibility
function toggleCart(show) {
    if (show) {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('open');
    } else {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('open');
    }
}

openCartBtn.addEventListener('click', () => toggleCart(true));
closeCartBtn.addEventListener('click', () => toggleCart(false));
cartOverlay.addEventListener('click', () => toggleCart(false));

// Modal Visibility
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    toggleCart(false);
    checkoutModal.classList.add('open');
});

closeModalBtn.addEventListener('click', () => checkoutModal.classList.remove('open'));

// Send Order to Backend API
checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const address = document.getElementById('address').value;
    const payment = document.getElementById('payment').value;
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const orderPayload = {
        name,
        address,
        payment,
        cart,
        totalAmount
    };

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
        });

        const result = await response.json();

        if (result.success) {
            alert(`Order Placed Successfully!\nOrder ID: ${result.orderId}`);
            cart = [];
            updateCart();
            checkoutForm.reset();
            checkoutModal.classList.remove('open');
        } else {
            alert('Failed to place order: ' + result.message);
        }
    } catch (error) {
        console.error('Checkout error:', error);
        alert('Could not connect to backend server to submit the order.');
    }
});

// Initialize Application
fetchMenu();
renderCart();