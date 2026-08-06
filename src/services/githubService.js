const GITHUB_OWNER = "Ankitadd11";
const GITHUB_REPO = "interview-question-bank";

const GITHUB_API = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents`;

async function githubGet(path) {
  const response = await fetch(`${GITHUB_API}/${path}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("GitHub file or folder was not found.");
    }

    throw new Error(
      `Unable to read GitHub data. Status: ${response.status}`
    );
  }

  return response.json();
}

function formatCategoryName(folderName) {
  return folderName
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function getCategories() {
  const data = await githubGet("questions");

  return data
    .filter((item) => item.type === "dir")
    .map((item) => ({
      value: item.name,
      label: formatCategoryName(item.name),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export async function getCategoryFiles(category) {
  if (!category) {
    return [];
  }

  const data = await githubGet(
    `questions/${encodeURIComponent(category)}`
  );

  return data
    .filter(
      (item) =>
        item.type === "file" &&
        item.name.toLowerCase().endsWith(".md")
    )
    .map((item) => ({
      value: item.name,
      label: item.name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export async function getQuestionFile(category, file) {
  if (!category || !file) {
    return "";
  }

  const data = await githubGet(
    `questions/${encodeURIComponent(category)}/${encodeURIComponent(file)}`
  );

  if (!data.content) {
    return "";
  }

  const base64Content = data.content.replace(/\n/g, "");

  const binaryString = atob(base64Content);

  const bytes = Uint8Array.from(
    binaryString,
    (character) => character.charCodeAt(0)
  );

  return new TextDecoder("utf-8").decode(bytes);
}