export interface Product {
  id: string;
  name: string;
  quantity: number;
  category?: string;
  barcode?: string;
  timestamp: number;
  
  // Sempre 3 preços (0 se não existir na etiqueta)
  precoAvulso: number;
  precoCartao: number;
  precoAtacado: number;
}

export interface ShoppingList {
  id: string;
  name: string;
  products: Product[];
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
  totalValue?: number;
}

export interface SavedList {
  id: string;
  name: string;
  items: SavedListItem[];
  createdAt: number;
  updatedAt: number;
  lastShoppingDate?: number;
  totalLastTime?: number;
}

export interface SavedListItem {
  id: string;
  name: string;
  lastPrice: number;
  currentPrice?: number;
  isNeeded: boolean; // "preciso" ou "não preciso"
  quantity: number;
  category?: string;
}

export interface CompareProduct {
  id: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

export interface MarketComparison {
  id: string;
  marketName: string;
  location: string;
  products: CompareProduct[];
  totalPrice: number;
  rating: number;
  distance: number;
}

export interface UserContribution {
  id: string;
  userName: string;
  contributionsCount: number;
  accuracy: number;
  level: number;
  avatar?: string;
}

export interface Favorite {
  id: string;
  productName: string;
  lastPrice: number;
  addedAt: number;
}

export type Screen = 
  | 'home' 
  | 'scanner' 
  | 'cart' 
  | 'compare' 
  | 'whereToShop'
  | 'history'
  | 'savedLists'
  | 'savedListDetail'
  | 'favorites'
  | 'settings'
  | 'settingsProfile'
  | 'settingsNotifications'
  | 'settingsPrivacy'
  | 'settingsHelp'
  | 'settingsAbout'
  | 'network'
  | 'login'
  | 'resetPassword';

export type PaymentMode = 'atacado' | 'credito' | 'varejo';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  contributionsCount: number;
  level: number;
}