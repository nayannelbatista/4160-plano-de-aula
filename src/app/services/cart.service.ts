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

  addToCart(product: Product) {
    const currentItems = this.getCartItems();
    const itemIndex = currentItems.findIndex((item) => item.product.id === product.id);
    if (itemIndex >= 0) {
      currentItems[itemIndex].quantity++;
    } else {
      currentItems.push({ product, quantity: 1 });
    }
    this.cartItemsSubject.next(currentItems);
  }
}