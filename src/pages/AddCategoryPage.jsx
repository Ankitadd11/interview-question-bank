import { Link } from "react-router-dom";

function AddCategoryPage() {
  return (
    <main className="page-container">
      <Link
        to="/"
        className="back-link"
      >
        ← Back to Add Question
      </Link>

      <section className="content-card">
        <h1>Add Category</h1>

        <p className="muted-text">
          The category form will be added later.
        </p>
      </section>
    </main>
  );
}

export default AddCategoryPage;