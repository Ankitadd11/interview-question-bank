const OWNER = "Ankitadd11";
const REPOSITORY = "interview-question-bank";

const ALLOWED_CATEGORIES = new Set([
  "React",
  "NodeJS",
  "TypeScript",
  "JavaScript",
  "Microservices",
  "AWS",
  "System-Design",
  "Behavioural",
  "Project-Based"
]);

function send(response, status, body) {
  return response.status(status).json(body);
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return send(response, 405, {
      error: "Only POST requests are allowed."
    });
  }

  if (!process.env.GITHUB_TOKEN || !process.env.APP_PASSWORD) {
    return send(response, 500, {
      error: "Server configuration is incomplete."
    });
  }

  const suppliedPassword = request.headers["x-app-password"];

  if (suppliedPassword !== process.env.APP_PASSWORD) {
    return send(response, 401, {
      error: "Incorrect app password."
    });
  }

  const { category, file, question, answer } = request.body || {};

  if (!ALLOWED_CATEGORIES.has(category)) {
    return send(response, 400, {
      error: "Invalid category."
    });
  }

  if (!/^[A-Za-z0-9._-]+\.md$/.test(file || "")) {
    return send(response, 400, {
      error: "Invalid filename."
    });
  }

  if (typeof question !== "string" || !question.trim()) {
    return send(response, 400, {
      error: "Question is required."
    });
  }

  if (typeof answer !== "string" || !answer.trim()) {
    return send(response, 400, {
      error: "Answer is required."
    });
  }

  const targetPath = `questions/${category}/${file}`;

  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "interview-question-bank"
  };

  try {
    const githubUrl =
      `https://api.github.com/repos/${OWNER}/${REPOSITORY}` +
      `/contents/${targetPath}`;

    // Read the existing Markdown file
    const fileResponse = await fetch(githubUrl, {
      headers
    });

    if (!fileResponse.ok) {
      return send(response, fileResponse.status === 404 ? 404 : 502, {
        error:
          fileResponse.status === 404
            ? "Selected file does not exist."
            : "Could not read the selected file."
      });
    }

    const fileData = await fileResponse.json();

    const currentContent = Buffer.from(
      fileData.content || "",
      "base64"
    ).toString("utf8");

    // Supports both "Q1." and "## Q1." formats
    const questionMatches = [
      ...currentContent.matchAll(
        /(?:^|\n)(?:##\s*)?Q(\d+)\./g
      )
    ];

    const highestNumber = questionMatches.reduce(
      (highest, match) =>
        Math.max(highest, Number(match[1])),
      0
    );

    const nextNumber = highestNumber + 1;

    const newEntry = [
      `Q${nextNumber}. ${question.trim()}`,
      "",
      `Ans: ${answer.trim()}`,
      ""
    ].join("\n");

    const updatedContent = currentContent.trim()
      ? `${currentContent.trimEnd()}\n\n${newEntry}`
      : newEntry;

    // Update and commit the selected file
    const updateResponse = await fetch(githubUrl, {
      method: "PUT",
      headers: {
        ...headers,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Add Q${nextNumber} to ${category}/${file}`,
        content: Buffer.from(
          updatedContent,
          "utf8"
        ).toString("base64"),
        sha: fileData.sha
      })
    });

    if (!updateResponse.ok) {
      const details = await updateResponse
        .json()
        .catch(() => ({}));

      return send(response, updateResponse.status, {
        error:
          details.message ||
          "GitHub could not update the file."
      });
    }

    return send(response, 200, {
      message: "Question added successfully.",
      questionNumber: `Q${nextNumber}`,
      path: targetPath
    });
  } catch (error) {
    console.error(error);

    return send(response, 500, {
      error: "Unexpected server error."
    });
  }
};
