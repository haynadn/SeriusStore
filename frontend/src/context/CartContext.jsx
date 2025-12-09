import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setItems([]);
            setTotal(0);
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const res = await cartAPI.getCart();
            setItems(res.data.items || []);
            setTotal(res.data.total || 0);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        try {
            await cartAPI.addToCart({ product_id: productId, quantity });
            await fetchCart();
            return true;
        } catch (error) {
            console.error('Failed to add to cart:', error);
            throw error;
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        try {
            await cartAPI.updateQuantity(itemId, quantity);
            await fetchCart();
        } catch (error) {
            console.error('Failed to update quantity:', error);
            throw error;
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            await cartAPI.removeFromCart(itemId);
            await fetchCart();
        } catch (error) {
            console.error('Failed to remove from cart:', error);
            throw error;
        }
    };

    const clearCart = async () => {
        try {
            await cartAPI.clearCart();
            setItems([]);
            setTotal(0);
        } catch (error) {
            console.error('Failed to clear cart:', error);
            throw error;
        }
    };

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                total,
                loading,
                itemCount,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
                fetchCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
