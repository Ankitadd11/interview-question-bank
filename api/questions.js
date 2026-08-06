const OWNER =
  "Ankitadd11";

const REPOSITORY =
  "interview-question-bank";


function send(
  response,
  status,
  body
) {
  return response
    .status(status)
    .json(body);
}


function isValidCategory(category) {
  return (
    typeof category === "string" &&
    /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/
      .test(category)
  );
}


function isValidFile(file) {
  return (
    typeof file === "string" &&
    /^[A-Za-z0-9._-]+\.md$/
      .test(file)
  );
}


function normalizeAnswer(answer) {
  return answer
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00A0/g, " ")
    .trim();
}


export default async function handler(
  request,
  response
) {

  /*
   * Only POST is allowed.
   */

  if (request.method !== "POST") {
    response.setHeader(
      "Allow",
      "POST"
    );

    return send(
      response,
      405,
      {
        error:
          "Only POST requests are allowed."
      }
    );
  }


  /*
   * Verify server configuration.
   */

  if (
    !process.env.GITHUB_TOKEN ||
    !process.env.APP_PASSWORD
  ) {
    console.error(
      "Question API configuration missing."
    );

    return send(
      response,
      500,
      {
        error:
          "Server configuration is incomplete."
      }
    );
  }


  /*
   * Authenticate the request.
   */

  const suppliedPassword =
    request.headers[
      "x-app-password"
    ];


  if (
    suppliedPassword !==
    process.env.APP_PASSWORD
  ) {
    return send(
      response,
      401,
      {
        error:
          "Incorrect app password."
      }
    );
  }


  const {
    category,
    file,
    question,
    answer
  } = request.body || {};


  /*
   * Validate category.
   *
   * Categories are no longer
   * hardcoded.
   */

  if (!isValidCategory(category)) {
    return send(
      response,
      400,
      {
        error:
          "Invalid category."
      }
    );
  }


  /*
   * Validate Markdown filename.
   */

  if (!isValidFile(file)) {
    return send(
      response,
      400,
      {
        error:
          "Invalid filename."
      }
    );
  }


  /*
   * Validate question.
   */

  if (
    typeof question !== "string" ||
    !question.trim()
  ) {
    return send(
      response,
      400,
      {
        error:
          "Question is required."
      }
    );
  }


  /*
   * Validate answer.
   */

  if (
    typeof answer !== "string" ||
    !answer.trim()
  ) {
    return send(
      response,
      400,
      {
        error:
          "Answer is required."
      }
    );
  }


  /*
   * Prevent unexpectedly large
   * requests.
   */

  if (
    question.length > 2000 ||
    answer.length > 30000
  ) {
    return send(
      response,
      400,
      {
        error:
          "Question or answer is too long."
      }
    );
  }


  const cleanQuestion =
    question.trim();

  const cleanAnswer =
    normalizeAnswer(answer);


  const targetPath =
    `questions/` +
    `${category}/` +
    `${file}`;


  const githubPath =
    `questions/` +
    `${encodeURIComponent(category)}/` +
    `${encodeURIComponent(file)}`;


  const githubUrl =
    `https://api.github.com/repos/` +
    `${OWNER}/${REPOSITORY}/contents/` +
    githubPath;


  const githubHeaders = {
    Accept:
      "application/vnd.github+json",

    Authorization:
      `Bearer ${process.env.GITHUB_TOKEN}`,

    "X-GitHub-Api-Version":
      "2022-11-28",

    "User-Agent":
      "interview-question-bank"
  };


  try {

    /*
     * Read selected file.
     */

    console.log(
      "Reading question file",
      {
        category,
        file
      }
    );


    const fileResponse =
      await fetch(
        githubUrl,
        {
          headers:
            githubHeaders
        }
      );


    /*
     * A category/file supplied by
     * the user must actually exist.
     */

    if (
      fileResponse.status === 404
    ) {
      return send(
        response,
        404,
        {
          error:
            "Selected category or file does not exist."
        }
      );
    }


    if (!fileResponse.ok) {
      console.error(
        "GitHub file read failed",
        {
          status:
            fileResponse.status,
          category,
          file
        }
      );


      return send(
        response,
        502,
        {
          error:
            "Could not read the selected file."
        }
      );
    }


    const fileData =
      await fileResponse.json();


    const currentContent =
      Buffer.from(
        fileData.content || "",
        "base64"
      ).toString("utf8");


    /*
     * Find all existing question
     * numbers.
     *
     * Supports:
     *
     * Q1.
     * ## Q1.
     */

    const questionMatches = [
      ...currentContent.matchAll(
        /(?:^|\n)(?:##\s*)?Q(\d+)\./g
      )
    ];


    const highestNumber =
      questionMatches.reduce(
        (
          highest,
          match
        ) =>
          Math.max(
            highest,
            Number(match[1])
          ),
        0
      );


    const nextNumber =
      highestNumber + 1;


    /*
     * Build new question.
     */

    const newEntry = [
      `Q${nextNumber}. ${cleanQuestion}`,
      "",
      `Ans: ${cleanAnswer}`,
      ""
    ].join("\n");


    /*
     * Append to existing file.
     */

    const updatedContent =
      currentContent.trim()
        ? (
            `${currentContent.trimEnd()}` +
            `\n\n${newEntry}`
          )
        : newEntry;


    /*
     * Update GitHub file.
     */

    const updateResponse =
      await fetch(
        githubUrl,
        {
          method: "PUT",

          headers: {
            ...githubHeaders,

            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            message:
              `Add Q${nextNumber} ` +
              `to ${category}/${file}`,

            content:
              Buffer.from(
                updatedContent,
                "utf8"
              ).toString(
                "base64"
              ),

            sha:
              fileData.sha
          })
        }
      );


    if (!updateResponse.ok) {

      const details =
        await updateResponse
          .json()
          .catch(
            () => ({})
          );


      /*
       * This can happen if two
       * submissions change the same
       * file simultaneously.
       */

      if (
        updateResponse.status ===
        409
      ) {
        return send(
          response,
          409,
          {
            error:
              "The question file changed while saving. Please submit again."
          }
        );
      }


      console.error(
        "GitHub file update failed",
        {
          status:
            updateResponse.status,

          message:
            details.message,

          category,
          file
        }
      );


      return send(
        response,
        502,
        {
          error:
            details.message ||
            "GitHub could not update the file."
        }
      );
    }


    /*
     * Success.
     */

    console.log(
      "Question added",
      {
        questionNumber:
          `Q${nextNumber}`,

        path:
          targetPath
      }
    );


    return send(
      response,
      200,
      {
        message:
          "Question added successfully.",

        questionNumber:
          `Q${nextNumber}`,

        path:
          targetPath
      }
    );


  } catch (error) {

    console.error(
      "Question API failed",
      {
        message:
          error.message
      }
    );


    return send(
      response,
      500,
      {
        error:
          "Unexpected server error."
      }
    );
  }
}