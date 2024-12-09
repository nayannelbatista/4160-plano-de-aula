import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { Product } from '../interfaces/product';
import { CartItem } from '../interfaces/cart_item';
import { supabase } from './supabase.client';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  constructor() {
    this.loadCart();
  }

  private loadCart() {
    from(
      supabase
        .from('cart')
        .select(`quantity, product:product_id (id, title, price, image)`)
    ).subscribe({
      next: ({ data, error }) => {
        if (error) {
          console.error('Erro ao carregar carrinho:', error.message);
        } else {
          const items = (data || []).map((item: any) => ({
            product: item.product,
            quantity: item.quantity,
          }));
          this.cartItemsSubject.next(items);
        }
      },
    });
  }

  private saveCartItem(cartItem: CartItem): Observable<void> {
    return from(
      supabase
        .from('cart')
        .upsert(
          {
            product_id: cartItem.product.id,
            quantity: cartItem.quantity,
          },
          { onConflict: 'product_id' }
        )
        .then(({ error }) => {
          if (error) throw new Error(error.message);
        })
    );
  }

  private deleteCartItem(productId: number): Observable<void> {
    return from(
      supabase
        .from('cart')
        .delete()
        .eq('product_id', productId)
        .then(({ error }) => {
          if (error) throw new Error(error.message);
        })
    );
  }

  private getCurrentItems(): CartItem[] {
    return this.cartItemsSubject.getValue();
  }

  private findItemIndexByProductId(productId: number): number {
    const currentItems = this.getCurrentItems();
    return currentItems.findIndex((item) => item.product.id === productId);
  }

  addToCart(product: Product, quantity: number = 1) {
    const currentItems = this.getCurrentItems();
    const itemIndex = this.findItemIndexByProductId(product.id);

    if (itemIndex >= 0) {
      currentItems[itemIndex].quantity += quantity;
    } else {
      currentItems.push({ product, quantity });
    }
    this.cartItemsSubject.next(currentItems);
    this.saveCartItem(currentItems[itemIndex] || { product, quantity }).subscribe();
  }

  removeFromCart(productId: number) {
    const updatedItems = this.getCurrentItems().filter((item) => item.product.id !== productId);
    this.cartItemsSubject.next(updatedItems);
    this.deleteCartItem(productId).subscribe();
  }

  updateCartItem(productId: number, quantity: number) {
    const currentItems = this.getCurrentItems();
    const itemIndex = this.findItemIndexByProductId(productId);

    if (itemIndex >= 0) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        currentItems[itemIndex].quantity = quantity;
        this.cartItemsSubject.next(currentItems);
        this.saveCartItem(currentItems[itemIndex]).subscribe();
      }
    }
  }

  getTotalQuantity(): number {
    return this.getCurrentItems().reduce((acc, item) => acc + item.quantity, 0);
  }
}