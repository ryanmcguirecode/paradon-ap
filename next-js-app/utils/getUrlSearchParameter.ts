export default function getUrlSearchParameter(
  searchParams: URLSearchParams,
  key: string
) {
  const value = searchParams.get(key);
  if (value === "null") {
    return null;
  }
  return value;
}
