// export server comps
import "server-only";
export type { Product } from "./types/product";
export { ProductCard } from "./components/ProductCard";
export { fetchProducts, fetchProductById } from "./db/product";
