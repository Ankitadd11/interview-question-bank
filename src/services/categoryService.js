export async function addCategoryFile({
  category,
  filename,
  appPassword,
}) {
  const response = await fetch(
    "/api/categories",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        "X-App-Password":
          appPassword,
      },

      body: JSON.stringify({
        category,
        filename,
      }),
    }
  );

  let result;

  try {
    result =
      await response.json();
  } catch {
    throw new Error(
      "Invalid response from server."
    );
  }

  if (!response.ok) {
    throw new Error(
      result.error ||
        "Unable to create category/file."
    );
  }

  return result;
}