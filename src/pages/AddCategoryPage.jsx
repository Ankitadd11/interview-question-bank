import { useState } from "react";
import { Link } from "react-router-dom";
import { addCategory } from "../services/categoryService";

export default function AddCategoryPage() {
  const [name, setName] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = name.trim();

    if (!cleanName) {
      setError("Please enter a category name.");
      return;
    }

    if (!appPassword) {
      setError("Please enter the app password.");
      return;
    }

    try {
      setSubmitting(true);

      const result = await addCategory({
        name: cleanName,
        appPassword,
      });

      setSuccess(
        `${result.message} general.md and technical.md are ready.`
      );

      setName("");
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
          <h1>Add Category</h1>
          <p>
            Create a new interview question category.
          </p>
        </div>

        <Link to="/" className="secondary-button">
          ← Add Question
        </Link>
      </div>

      <form className="question-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="categoryName">
            Category Name
          </label>

          <input
            id="categoryName"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Example: Spring Boot"
            maxLength={80}
            disabled={submitting}
          />
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
              setAppPassword(event.target.value)
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
          {submitting ? "Creating Category..." : "Create Category"}
        </button>
      </form>
    </main>
  );
}