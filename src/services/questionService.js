export async function addQuestion({
  category,
  file,
  question,
  answer,
  appPassword
}) {
  const response = await fetch(
    "/api/questions",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        "X-App-Password":
          appPassword
      },

      body: JSON.stringify({
        category,
        file,
        question,
        answer
      })
    }
  );


  let result;

  try {
    result =
      await response.json();
  } catch {
    throw new Error(
      "Invalid response from the server."
    );
  }


  if (!response.ok) {
    throw new Error(
      result.error ||
      "Unable to add question."
    );
  }


  return result;
}