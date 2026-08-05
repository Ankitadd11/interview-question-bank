const GITHUB_OWNER = "Ankitadd11";
const GITHUB_REPO = "interview-question-bank";

function sendJson(res, status, data) {
  return res.status(status).json(data);
}

function createCategorySlug(name) {
  return name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9._-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function isValidCategory(category) {
  return /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(category);
}

function encodeGitHubPath(path) {
  return path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

async function getGitHubFile(path, token) {
  const encodedPath = encodeGitHubPath(path);

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodedPath}`,
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
    const error = await response.text();
    throw new Error(`GitHub read failed: ${response.status} ${error}`);
  }

  return response.json();
}

async function createGitHubFile({
  path,
  content,
  message,
  token,
}) {
  const encodedPath = encodeGitHubPath(path);

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodedPath}`,
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
        content: Buffer.from(content, "utf8").toString("base64"),
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `GitHub create failed for ${path}: ${response.status} ${error}`
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
    const githubToken = process.env.GITHUB_TOKEN;
    const appPassword = process.env.APP_PASSWORD;
    const providedPassword = req.headers["x-app-password"];

    if (!githubToken) {
      console.error("GITHUB_TOKEN is not configured.");

      return sendJson(res, 500, {
        error: "Server configuration error.",
      });
    }

    if (!appPassword) {
      console.error("APP_PASSWORD is not configured.");

      return sendJson(res, 500, {
        error: "Server configuration error.",
      });
    }

    if (!providedPassword || providedPassword !== appPassword) {
      return sendJson(res, 401, {
        error: "Invalid app password.",
      });
    }

    const name = String(req.body?.name || "").trim();

    if (!name) {
      return sendJson(res, 400, {
        error: "Category name is required.",
      });
    }

    if (name.length > 80) {
      return sendJson(res, 400, {
        error: "Category name is too long.",
      });
    }

    const category = createCategorySlug(name);

    if (!category || !isValidCategory(category)) {
      return sendJson(res, 400, {
        error: "Please enter a valid category name.",
      });
    }

    const generalPath = `questions/${category}/general.md`;
    const technicalPath = `questions/${category}/technical.md`;

    const [existingGeneral, existingTechnical] = await Promise.all([
      getGitHubFile(generalPath, githubToken),
      getGitHubFile(technicalPath, githubToken),
    ]);

    if (existingGeneral && existingTechnical) {
      return sendJson(res, 409, {
        error: `Category "${name}" already exists.`,
      });
    }

    const createdFiles = [];

    if (!existingGeneral) {
      await createGitHubFile({
        path: generalPath,
        token: githubToken,
        message: `Add ${name} general question bank`,
        content: `# ${name} - General Interview Questions\n`,
      });

      createdFiles.push("general.md");
    }

    if (!existingTechnical) {
      await createGitHubFile({
        path: technicalPath,
        token: githubToken,
        message: `Add ${name} technical question bank`,
        content: `# ${name} - Technical Interview Questions\n`,
      });

      createdFiles.push("technical.md");
    }

    console.log("Category created", {
      category,
      createdFiles,
    });

    return sendJson(res, 201, {
      success: true,
      message: `Category "${name}" created successfully.`,
      category,
      files: ["general.md", "technical.md"],
      createdFiles,
    });
  } catch (error) {
    console.error("Add category failed:", error.message);

    return sendJson(res, 500, {
      error: "Unable to create category. Please try again.",
    });
  }
}