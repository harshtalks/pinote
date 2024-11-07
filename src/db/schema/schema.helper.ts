export const prefixedId = (prefix: string) => () => {
  return `${prefix}_${crypto.randomUUID()}`;
};
