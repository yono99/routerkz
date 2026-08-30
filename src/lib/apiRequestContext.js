import { AsyncLocalStorage } from "node:async_hooks";

const storage = new AsyncLocalStorage();

export function runWithApiRequestContext(request, context, handler) {
  return storage.run({ ...context, requestId: context.requestId || crypto.randomUUID() }, handler);
}

export function getApiRequestContext() {
  return storage.getStore() || null;
}
