export const regexReplace = (
  str: string,
  regexPattern: string,
  replacementValue: string
) => {
  const regex = new RegExp(regexPattern, "g");
  return str.replace(regex, replacementValue);
};
