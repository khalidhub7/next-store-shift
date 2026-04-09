import { fileURLToPath } from "url";
import { readFile } from "fs/promises";

const cartsFilePath = fileURLToPath(
  new URL("./lib/data/carts.json", import.meta.url),
);

const getCarts = async () => {
  const data = await readFile(cartsFilePath, "utf-8");
  return data === "" ? [] : JSON.parse(data);
};

console.log(await getCarts());