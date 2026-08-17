const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-Memory Database for Food Menu Items
const menuData = [
    { id: 1, title: 'Classic Beef Burger', category: 'Burgers', price: 8.99, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80', desc: 'Juicy beef patty with cheese, lettuce, and special sauce.' },
    { id: 2, title: 'Pepperoni Pizza', category: 'Pizza', price: 12.49, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=80', desc: 'Loaded with double pepperoni, mozzarella, and tomato sauce.' },
    { id: 3, title: 'Crispy Veggie Burger', category: 'Burgers', price: 7.49, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80', desc: 'Fresh veggie patty served with crunchy lettuce and mayo.' },
    { id: 4, title: 'Margherita Pizza', category: 'Pizza', price: 10.99, image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=80', desc: 'Classic basil, fresh mozzarella, and tomato base.' },
    { id: 5, title: 'Iced Latte', category: 'Drinks', price: 3.99, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80', desc: 'Chilled espresso with whole milk and syrup.' },
    { id: 6, title: 'Chocolate Lava Cake', category: 'Desserts', price: 5.49, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80', desc: 'Warm chocolate cake with a molten lava center.' }
];

// In-Memory Database for Storing Placed Orders
const orders = [];

// API Endpoint: Get All Menu Items
app.get('/api/menu', (req, res) => {
    res.status(200).json({ success: true, data: menuData });
});

// API Endpoint: Place a New Order
app.post('/api/orders', (req, res) => {
    const { name, address, payment, cart, totalAmount } = req.body;

    if (!name || !address || !cart || cart.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid order details provided.' });
    }

    const newOrder = {
        orderId: 'ORD-' + Date.now(),
        customer: { name, address, payment },
        items: cart,
        totalAmount,
        createdAt: new Date().toISOString()
    };

    orders.push(newOrder);
    console.log('New Order Received:', newOrder);

    return res.status(201).json({
        success: true,
        message: 'Order placed successfully!',
        orderId: newOrder.orderId
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Backend API Server is running on http://localhost:${PORT}`);
});