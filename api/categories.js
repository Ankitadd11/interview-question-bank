const GITHUB_OWNER = "Ankitadd11";
const GITHUB_REPO = "interview-question-bank";

function sendJson(res, status, data) {
  return res.status(status).json(data);
}

function normalizeCategoryName(name) {
  return name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9._-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeMarkdownFilename(input) {
  let filename = String(input || "").trim();

  if (!filename) {
    return "";
  }

  // Do not allow directory paths.
  filename = filename.replace(/[\\/]/g, "");

  // Replace spaces with hyphens.
  filename = filename.replace(/\s+/g, "-");

  // Already .md
  if (/\.md$/i.test(filename)) {
    filename = filename.replace(/\.md$/i, "");
  } else {
    // Replace any other extension.
    // test.js -> test
    // test.txt -> test
    const lastDot = filename.lastIndexOf(".");

    if (lastDot > 0) {
      filename = filename.substring(0, lastDot);
    }
  }

  filename = filename
    .replace(/[^A-Za-z0-9._-]/g, "")
    .replace(/\.+$/g, "")
    .replace(/^-+|-+$/g, "");

  if (!filename) {
    return "";
  }

  return `${filename}.md`;
}

function isValidCategory(category) {
  return /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(
    category
  );
}

function isValidMarkdownFile(filename) {
  return (
    /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}\.md$/i.test(
      filename
    )
  );
}

function encodeGitHubPath(path) {
  return path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

async function getGitHubFile(path, token) {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeGitHubPath(
      path
    )}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      `GitHub read failed: ${response.status} ${message}`
    );
  }

  return response.json();
}

async function createGitHubFile({
  path,
  content,
  message,
  token,
}) {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeGitHubPath(
      path
    )}`,
    {
      method: "PUT",

      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },

      body: JSON.stringify({
        message,
        content: Buffer.from(
          content,
          "utf8"
        ).toString("base64"),
      }),
    }
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      `GitHub create failed: ${response.status} ${message}`
    );
  }

  return response.json();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return sendJson(res, 405, {
      error: "Method not allowed.",
    });
  }

  try {
    const githubToken =
      process.env.GITHUB_TOKEN;

    const appPassword =
      process.env.APP_PASSWORD;

    const providedPassword =
      req.headers["x-app-password"];

    if (!githubToken) {
      console.error(
        "GITHUB_TOKEN environment variable is missing."
      );

      return sendJson(res, 500, {
        error: "Server configuration error.",
      });
    }

    if (!appPassword) {
      console.error(
        "APP_PASSWORD environment variable is missing."
      );

      return sendJson(res, 500, {
        error: "Server configuration error.",
      });
    }

    if (
      !providedPassword ||
      providedPassword !== appPassword
    ) {
      return sendJson(res, 401, {
        error: "Invalid app password.",
      });
    }

    const categoryInput = String(
      req.body?.category || ""
    ).trim();

    const filenameInput = String(
      req.body?.filename || ""
    ).trim();

    if (!categoryInput) {
      return sendJson(res, 400, {
        error: "Category name is required.",
      });
    }

    if (!filenameInput) {
      return sendJson(res, 400, {
        error: "File name is required.",
      });
    }

    const category =
      normalizeCategoryName(categoryInput);

    const filename =
      normalizeMarkdownFilename(filenameInput);

    if (
      !category ||
      !isValidCategory(category)
    ) {
      return sendJson(res, 400, {
        error: "Invalid category name.",
      });
    }

    if (
      !filename ||
      !isValidMarkdownFile(filename)
    ) {
      return sendJson(res, 400, {
        error: "Invalid file name.",
      });
    }

    const path =
      `questions/${category}/${filename}`;

    const existingFile =
      await getGitHubFile(
        path,
        githubToken
      );

    if (existingFile) {
      return sendJson(res, 409, {
        error:
          `${category}/${filename} already exists.`,
      });
    }

    const displayCategory =
      categoryInput.trim();

    const fileTitle =
      filename.replace(/\.md$/i, "");

    const content =
      `# ${displayCategory} - ${fileTitle} Interview Questions\n`;

    await createGitHubFile({
      path,
      content,
      token: githubToken,
      message:
        `Add ${filename} to ${category}`,
    });

    console.log("Question file created", {
      category,
      filename,
      path,
    });

    return sendJson(res, 201, {
      success: true,
      message:
        `${filename} created successfully under ${category}.`,
      category,
      filename,
      path,
    });
  } catch (error) {
    console.error(
      "Category/file creation failed:",
      error
    );

    return sendJson(res, 500, {
      error:
        "Unable to create category/file. Please try again.",
    });
  }
}