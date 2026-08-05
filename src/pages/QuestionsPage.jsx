import { Link } from "react-router-dom";

function QuestionsPage() {
  return (
    <main className="page-container">
      <Link
        to="/"
        className="back-link"
      >
        ← Back to Add Question
      </Link>

      <section className="content-card">
        <h1>Interview Questions</h1>

        <p className="muted-text">
          Categories and existing questions will
          be displayed here.
        </p>
      </section>
    </main>
  );
}

export default QuestionsPage;