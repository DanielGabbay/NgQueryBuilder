import { CreateSignalOptions, WritableSignal } from '@angular/core';
import { createSignal, SIGNAL, SignalGetter } from '@angular/core/primitives/signals';
import { setDebugNameOnNode } from '../helpers/utilities';

export interface StorageSignalStore<T> {
  get(key: string): T | undefined;

  set(key: string, value: T): void;
}

export type StorageSignalOptions<T> = CreateSignalOptions<T> & { lazy: boolean };

type StorageSignal<T> = (initialValue: T, key: string, options: StorageSignalOptions<T>) => WritableSignal<T>;

export function storageSignalStoreFactory<TStorage>(storageProvider: StorageSignalStore<TStorage>): StorageSignal<TStorage> {
  return <T extends TStorage>(initialValue: T, key: string, options: StorageSignalOptions<T>): WritableSignal<T> => {
    const storageValue = storageProvider.get(key);
    const [getter, setter, updater] = createSignal(storageValue === undefined ? initialValue : storageValue);
    const $output = getter as SignalGetter<T> & WritableSignal<T>;
    const outputNode = $output[SIGNAL];
    const md = {
      prevValue: null,
    };
    const equalFn = options?.equal ?? outputNode.equal;
    setDebugNameOnNode(outputNode, options?.debugName);
    $output.asReadonly = () => $output;
    $output.set = (value: T) => {
      if (!md.prevValue || !equalFn(md.prevValue, value)) {
        md.prevValue = value;
        storageProvider.set(key, value);
        setter(value);
      }
    };
    $output.update = (updateFn: (value: T) => T) => {
      const next = updateFn(outputNode.value);
      if (!md.prevValue || !equalFn(md.prevValue, next)) {
        md.prevValue = next;
        storageProvider.set(key, next);
        updater(updateFn);
      }
    };
    return $output;
  };
}
