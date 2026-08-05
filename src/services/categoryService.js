export async function addCategory({ name, appPassword }) {
  const response = await fetch("/api/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-App-Password": appPassword,
    },
    body: JSON.stringify({
      name,
    }),
  });

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("Invalid response from the server.");
  }

  if (!response.ok) {
    throw new Error(result.error || "Unable to create category.");
  }

  return result;
}