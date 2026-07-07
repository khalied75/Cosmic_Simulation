import { useSyncExternalStore } from "react";

const fabricState = new Map();
const listeners = new Set();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function getSpacetimeFabricEnabled(bodyId) {
  return Boolean(fabricState.get(bodyId));
}

export function setSpacetimeFabricEnabled(bodyId, enabled) {
  fabricState.set(bodyId, enabled);
  emitChange();
}

export function toggleSpacetimeFabric(bodyId) {
  const next = !getSpacetimeFabricEnabled(bodyId);
  setSpacetimeFabricEnabled(bodyId, next);
  return next;
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSpacetimeFabric(bodyId) {
  return useSyncExternalStore(
    subscribe,
    () => getSpacetimeFabricEnabled(bodyId),
    () => false,
  );
}
