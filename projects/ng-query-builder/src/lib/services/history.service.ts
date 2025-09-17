import { Injectable, signal, computed, WritableSignal, Signal } from '@angular/core';
import { RuleGroup } from '../models/query-builder.models';

const MAX_HISTORY_LENGTH = 100;

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private history: WritableSignal<RuleGroup[]> = signal([]);
  private currentIndex: WritableSignal<number> = signal(-1);
  private initialQueryState: RuleGroup | null = null;

  readonly query: Signal<RuleGroup> = computed(() => {
    const hist = this.history();
    const index = this.currentIndex();
    if (index >= 0 && index < hist.length) {
      // Return a deep copy to prevent consumers from mutating the history state directly
      return JSON.parse(JSON.stringify(hist[index]));
    }
    return this.initialQueryState ?? { id: 'root-fallback', combinator: 'AND', rules: [] };
  });

  readonly canUndo = computed(() => this.currentIndex() > 0);
  readonly canRedo = computed(() => this.currentIndex() < this.history().length - 1);

  init(initialState: RuleGroup) {
    const clonedState = JSON.parse(JSON.stringify(initialState));
    this.initialQueryState = clonedState;
    this.history.set([clonedState]);
    this.currentIndex.set(0);
  }

  addState(newState: RuleGroup) {
    const clonedState = JSON.parse(JSON.stringify(newState));
    const currentHistory = this.history();
    const currentIndex = this.currentIndex();
    
    // Prevent adding identical state to the history
    if (currentIndex >= 0 && JSON.stringify(clonedState) === JSON.stringify(currentHistory[currentIndex])) {
        return;
    }

    const newIndex = currentIndex + 1;
    let newHistory = currentHistory.slice(0, newIndex);
    newHistory.push(clonedState);

    if (newHistory.length > MAX_HISTORY_LENGTH) {
      newHistory = newHistory.slice(newHistory.length - MAX_HISTORY_LENGTH);
    }
    
    this.history.set(newHistory);
    this.currentIndex.set(newHistory.length - 1);
  }

  undo() {
    if (this.canUndo()) {
      this.currentIndex.update(i => i - 1);
    }
  }

  redo() {
    if (this.canRedo()) {
      this.currentIndex.update(i => i + 1);
    }
  }
}
