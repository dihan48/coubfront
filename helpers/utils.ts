export function decimalToBase62(decimalString: string) {
  const characters =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const base = BigInt(characters.length);

  let decimal = BigInt(decimalString);
  let base62 = "";

  while (decimal > 0) {
    const remainder = Number(decimal % base);;
    base62 = characters[remainder] + base62;
    decimal = decimal / base;
  }

  return base62 || "0";
}

export function base62ToDecimal(base62String: string) {
  const characters =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const base = BigInt(characters.length);

  let decimal = BigInt(0);
  let basePower = BigInt(1);

  for (let i = base62String.length - 1; i >= 0; i--) {
    const value = BigInt(characters.indexOf(base62String[i]));
    decimal += value * basePower;
    basePower *= base;
  }

  return decimal.toString();
}
