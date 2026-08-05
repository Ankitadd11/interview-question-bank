const GITHUB_OWNER = "Ankitadd11";

const GITHUB_REPOSITORY =
  "interview-question-bank";

const BASE_URL =
  `https://api.github.com/repos/` +
  `${GITHUB_OWNER}/${GITHUB_REPOSITORY}/contents`;

async function githubRequest(path) {
  const response = await fetch(
    `${BASE_URL}/${path}`,
    {
      headers: {
        Accept: "application/vnd.github+json"
      }
    }
  );

  if (!response.ok) {
    throw new Error(
      `GitHub request failed: ${response.status}`
    );
  }

  return response.json();
}

export async function getCategories() {
  const items =
    await githubRequest("questions");

  return items
    .filter(item => item.type === "dir")
    .map(item => ({
      value: item.name,

      label: item.name
        .replaceAll("-", " ")
        .replace(
          /\b\w/g,
          letter => letter.toUpperCase()
        )
    }))
    .sort((a, b) =>
      a.label.localeCompare(b.label)
    );
}

export async function getCategoryFiles(
  category
) {
  if (!category) {
    return [];
  }

  const items =
    await githubRequest(
      `questions/${encodeURIComponent(category)}`
    );

  return items
    .filter(
      item =>
        item.type === "file" &&
        item.name
          .toLowerCase()
          .endsWith(".md")
    )
    .map(item => ({
      value: item.name,

      label: item.name
        .replace(/\.md$/i, "")
        .replaceAll("-", " ")
        .replace(
          /\b\w/g,
          letter => letter.toUpperCase()
        )
    }))
    .sort((a, b) =>
      a.label.localeCompare(b.label)
    );
}