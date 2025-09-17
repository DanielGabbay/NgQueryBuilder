export function setDebugNameOnNode(node: any, debugName?: string): void {
  if (debugName) {
    node.debugName = debugName;
  }
}
