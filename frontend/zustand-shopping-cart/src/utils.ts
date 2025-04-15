export function formatToReal(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export const uid = function () {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
