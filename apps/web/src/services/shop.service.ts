import api from '../lib/api';
import type { ShopItem, InventoryItem } from '@lifequest/shared';

export async function fetchShopItems(): Promise<ShopItem[]> {
  const { data } = await api.get<{ items: ShopItem[] }>('/shop/items');
  return data.items;
}

export async function purchaseItem(shopItemId: string): Promise<{ inventoryItem: InventoryItem; user: unknown }> {
  const { data } = await api.post('/shop/purchase', { shopItemId });
  return data;
}

export async function fetchInventory(): Promise<InventoryItem[]> {
  const { data } = await api.get<{ items: InventoryItem[] }>('/shop/inventory');
  return data.items;
}

export async function equipItem(inventoryItemId: string): Promise<InventoryItem> {
  const { data } = await api.post<{ inventoryItem: InventoryItem }>(`/shop/inventory/${inventoryItemId}/equip`);
  return data.inventoryItem;
}

export async function useItem(inventoryItemId: string): Promise<InventoryItem> {
  const { data } = await api.post<{ inventoryItem: InventoryItem }>(`/shop/inventory/${inventoryItemId}/use`);
  return data.inventoryItem;
}
