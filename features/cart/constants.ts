// Maximum quantity allowed for a single cart item.
const MAX_QTY = 10;
// Cart expires after 3 days of inactivity.
const CART_TTL = 1000 * 60 * 60 * 24 * 3;
// Shared toast UI configuration.
const TOAST_CONFIG = { position: "top-center", duration: 300 } as const;

export { MAX_QTY, CART_TTL, TOAST_CONFIG };
