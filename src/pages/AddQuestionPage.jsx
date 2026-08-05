import { Link } from "react-router-dom";

function AddQuestionPage() {
  return (
    <main className="page-container">
      <div className="page-header">
        <div>
          <h1>Interview Question Bank</h1>

          <p>
            Add and manage your interview questions.
          </p>
        </div>

        <div className="page-actions">
          <Link
            to="/categories/add"
            className="button secondary-button"
          >
            + Add Category
          </Link>

          <Link
            to="/questions"
            className="button link-button"
          >
            View Existing Questions
          </Link>
        </div>
      </div>

      <section className="content-card">
        <h2>Add Question</h2>

        <p className="muted-text">
          The question form will be added in the next step.
        </p>
      </section>
    </main>
  );
}

export default AddQuestionPage;