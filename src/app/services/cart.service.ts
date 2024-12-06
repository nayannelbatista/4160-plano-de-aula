import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../interfaces/product';
import { CartItem } from '../interfaces/cart_item';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  getCartItems() {
    return this.cartItemsSubject.getValue();
  }
  
  private getCurrentItems(): CartItem[] {
    return this.cartItemsSubject.getValue();
  }

  addToCart(product: Product, quantity: number = 1) {
    const currentItems = this.getCartItems();
    const itemIndex = currentItems.findIndex((item) => item.product.id === product.id);
    if (itemIndex >= 0) {
      currentItems[itemIndex].quantity += quantity;
    } else {
      currentItems.push({ product, quantity });
    }
    this.cartItemsSubject.next(currentItems);
  }

  getTotalQuantity(): number {
    return this.getCurrentItems().reduce((acc, item) => acc + item.quantity, 0);
  }
}