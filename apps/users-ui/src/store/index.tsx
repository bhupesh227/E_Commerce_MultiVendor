import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type Product = {
  id: string;
  title: string;
  image: string;
  price: number;
  quantity?: number;
  shopId: string;
};

type Store = {
    cart: Product[];
    wishlist: Product[];
    addToCart: (
        product: Product,
        user: any,
        location: { country: string; city: string } | null,
        deviceInfo: string
    ) => void;

    removeFromCart: (
        id: string,
        user: any,
        location: { country: string; city: string } | null,
        deviceInfo: string
    ) => void;

    addToWishlist: (
        product: Product,
        user: any,
        location: { country: string; city: string } | null,
        deviceInfo: string
    ) => void;

    removeFromWishlist: (
        id: string,
        user: any,
        location: { country: string; city: string } | null,
        deviceInfo: string
    ) => void;
};


const isClient = typeof window !== 'undefined';


export const useStore = create<Store>()(
    persist(
        (set, get) => ({
            cart: [],
            wishlist: [],
            // Add to cart
            addToCart: (product, user, location, deviceInfo) => {
                set((state) => {
                    const existing = state.cart?.find((item) => item.id === product.id);
                    if (existing) {
                        return {
                            cart: state.cart.map((item) =>
                                item.id === product.id
                                    ? { ...item, quantity: (item.quantity ?? 1) + 1 }
                                    : item
                            ),
                        };
                    }
                    return { cart: [...state.cart, { ...product, quantity: 1 }] };
                });
            },
            
            removeFromCart: (id, user, location, deviceInfo) => {
                //const removedProduct = get().cart.find((item) => item.id === id);
                set((state) => ({
                    cart: state.cart.filter((item) => item.id !== id),
                }));
            },
            

            addToWishlist: (product, user, location, deviceInfo) => {
                set((state) => {
                    if(state.wishlist?.find((item) => item.id === product.id)) {
                        return state;
                    }

                    return {
                        wishlist: [...state.wishlist, product]
                    }
                });
            },
            
            removeFromWishlist: (id, user, location, deviceInfo) => {
                // const removedProduct = get().wishlist.find((item) => item.id === id);
                // if (!removedProduct) return;
                set((state) => ({
                    wishlist: state.wishlist.filter((item) => item.id !== id),
                }));
            },
        }),
        { 
            name: 'store-storage',
            storage: isClient
                ? createJSONStorage(() => localStorage)
                : undefined, 
            skipHydration: true,
        }
    )
);