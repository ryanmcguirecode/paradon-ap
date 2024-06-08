function snakeToCamel(s: string) {
  return s
    .split("_")
    .map((word, index) => {
      if (index === 0) {
        // First word, make sure it's in lower case
        return word.toLowerCase();
      }
      // Capitalize the first letter of each subsequent word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join("");
}

export function snakeToCamelObject(obj: Record<string, any>) {
  const newObj: Record<string, any> = {};
  for (const key in obj) {
    newObj[snakeToCamel(key)] = obj[key];
  }
  return newObj;
}

export function capitalizedToCamelObject(obj: Record<string, any>) {
  const newObj: Record<string, any> = {};
  for (const key in obj) {
    newObj[key.charAt(0).toLowerCase() + key.slice(1)] = obj[key];
  }
  return newObj;
}
