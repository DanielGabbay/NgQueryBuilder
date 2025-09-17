import { WritableSignal } from '@angular/core';
import { StorageSignalOptions, storageSignalStoreFactory } from './storage-signal';

function createDefaultStorageSignalOptions<T>(key: string): StorageSignalOptions<T> {
  return {
    equal: (a, b) => a === b,
    debugName: `localSignal(${key})`,
    lazy: false,
  };
}

export function localSignal<T>(initialValue: T, key: string, createSignalOptions?: StorageSignalOptions<T>): WritableSignal<T> {
  if (!createSignalOptions) {
    createSignalOptions = createDefaultStorageSignalOptions(key);
  }
  const storageSignalRef$: WritableSignal<T> = storageSignalStoreFactory<T>({
    get: (key: string) => {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : undefined;
    },
    set: (key: string, value: T) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
  })(initialValue, key, createSignalOptions);

  return storageSignalRef$;
}
