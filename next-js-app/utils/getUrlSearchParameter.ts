export default function getUrlSearchParameter(
  searchParams: URLSearchParams,
  key: string
) {
  const value = searchParams.get(key);
  if (value === "null" || value === "undefined" || value === "") {
    return null;
  }
  return value;
}
