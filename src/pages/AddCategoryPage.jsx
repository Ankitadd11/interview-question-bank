import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { addCategoryFile } from "../services/categoryService";

import "../styles/pages.css";
import "../styles/form.css";

function getMarkdownFilename(input) {
  let filename = input.trim();

  if (!filename) {
    return "";
  }

  filename = filename
    .replace(/[\\/]/g, "")
    .replace(/\s+/g, "-");

  if (/\.md$/i.test(filename)) {
    filename = filename.replace(
      /\.md$/i,
      ""
    );
  } else {
    const lastDot =
      filename.lastIndexOf(".");

    if (lastDot > 0) {
      filename =
        filename.substring(
          0,
          lastDot
        );
    }
  }

  filename = filename
    .replace(
      /[^A-Za-z0-9._-]/g,
      ""
    )
    .replace(/\.+$/g, "")
    .replace(/^-+|-+$/g, "");

  return filename
    ? `${filename}.md`
    : "";
}

export default function AddCategoryPage() {
  const [category, setCategory] =
    useState("");

  const [filename, setFilename] =
    useState("");

  const [
    appPassword,
    setAppPassword,
  ] = useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const normalizedFilename =
    useMemo(
      () =>
        getMarkdownFilename(
          filename
        ),
      [filename]
    );

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!category.trim()) {
      setError(
        "Please enter category name."
      );
      return;
    }

    if (!filename.trim()) {
      setError(
        "Please enter file name."
      );
      return;
    }

    if (!appPassword) {
      setError(
        "Please enter app password."
      );
      return;
    }

    try {
      setSubmitting(true);

      const result =
        await addCategoryFile({
          category:
            category.trim(),

          filename:
            filename.trim(),

          appPassword,
        });

      setSuccess(
        `Created: ${result.path}`
      );

      setFilename("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-container">
      <div className="page-header">
        <div>
          <h1>
            Add Category / File
          </h1>

          <p>
            Create a new category or
            add a Markdown file to an
            existing category.
          </p>
        </div>

        <Link
          to="/"
          className="button link-button"
        >
          ← Add Question
        </Link>
      </div>
      <section className="content-card">
        <form
          className="question-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label htmlFor="category">
              Category Name
            </label>

            <input
              id="category"
              type="text"
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
              placeholder="Example: NodeJS"
              maxLength={80}
              disabled={submitting}
            />

            <small>
              Example: React, NodeJS,
              Microservices
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="filename">
              File Name
            </label>

            <input
              id="filename"
              type="text"
              value={filename}
              onChange={(event) =>
                setFilename(
                  event.target.value
                )
              }
              placeholder="Example: technical"
              maxLength={100}
              disabled={submitting}
            />

            {normalizedFilename && (
              <small>
                File will be created as:{" "}
                <strong>
                  {normalizedFilename}
                </strong>
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="appPassword">
              App Password
            </label>

            <input
              id="appPassword"
              type="password"
              value={appPassword}
              onChange={(event) =>
                setAppPassword(
                  event.target.value
                )
              }
              placeholder="Enter app password"
              autoComplete="current-password"
              disabled={submitting}
            />
          </div>

          {error && (
            <div className="form-message error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="form-message success-message">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={submitting}
          >
            {submitting
              ? "Creating..."
              : "Create Category / File"}
          </button>
        </form>
      </section>
    </main>
  );
}