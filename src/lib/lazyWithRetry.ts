/**
 * Lazy import with one automatic full reload on stale chunk errors (post-deploy).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { lazy, type ComponentType } from "react";

const CHUNK_RELOAD_KEY = "pgr_chunk_reload_attempted";

export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("Importing a module script failed") ||
    message.includes("error loading dynamically imported module") ||
    message.includes("Loading chunk") ||
    message.includes("Loading CSS chunk")
  );
}

export function clearChunkReloadFlag(): void {
  try {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  } catch {
    /* ignore */
  }
}

function reloadOnceForStaleChunk(): never {
  try {
    if (!sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
      sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
      window.location.reload();
      return new Promise(() => {}) as never;
    }
  } catch {
    window.location.reload();
    return new Promise(() => {}) as never;
  }
  throw new Error("Stale app bundle — please hard-refresh the page.");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      const module = await factory();
      clearChunkReloadFlag();
      return module;
    } catch (error) {
      if (isChunkLoadError(error)) {
        return reloadOnceForStaleChunk();
      }
      throw error;
    }
  });
}
