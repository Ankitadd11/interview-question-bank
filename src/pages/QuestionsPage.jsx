import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DOMPurify from "dompurify";

import {
  getCategories,
  getCategoryFiles,
  getQuestionFile,
} from "../services/githubService";

import { parseQuestions } from "../utils/questionParser";

import "../styles/questions.css";

const QUESTIONS_PER_PAGE = 5;

function containsHtml(value) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function AnswerContent({ answer }) {
  if (!answer) {
    return (
      <p className="empty-answer">
        No answer available.
      </p>
    );
  }

  if (!containsHtml(answer)) {
    return (
      <div className="plain-answer">
        {answer}
      </div>
    );
  }

  const safeHtml = DOMPurify.sanitize(answer);

  return (
    <div
      className="formatted-answer"
      dangerouslySetInnerHTML={{
        __html: safeHtml,
      }}
    />
  );
}

export default function QuestionsPage() {
  const [categories, setCategories] = useState([]);
  const [files, setFiles] = useState([]);

  const [category, setCategory] = useState("");
  const [file, setFile] = useState("");

  const [questions, setQuestions] = useState([]);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [loadingFiles, setLoadingFiles] =
    useState(false);

  const [loadingQuestions, setLoadingQuestions] =
    useState(false);

  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoadingCategories(true);
        setError("");

        const data = await getCategories();

        setCategories(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    async function loadFiles() {
      if (!category) {
        setFiles([]);
        setFile("");
        setQuestions([]);
        return;
      }

      try {
        setLoadingFiles(true);
        setError("");
        setFile("");
        setQuestions([]);
        setCurrentPage(1);

        const data = await getCategoryFiles(category);

        setFiles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingFiles(false);
      }
    }

    loadFiles();
  }, [category]);

  useEffect(() => {
    async function loadQuestions() {
      if (!category || !file) {
        setQuestions([]);
        return;
      }

      try {
        setLoadingQuestions(true);
        setError("");
        setCurrentPage(1);

        const content = await getQuestionFile(
          category,
          file
        );

        const parsedQuestions =
          parseQuestions(content);

        setQuestions(parsedQuestions);
      } catch (err) {
        setError(err.message);
        setQuestions([]);
      } finally {
        setLoadingQuestions(false);
      }
    }

    loadQuestions();
  }, [category, file]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      questions.length / QUESTIONS_PER_PAGE
    )
  );

  const visibleQuestions = useMemo(() => {
    const start =
      (currentPage - 1) * QUESTIONS_PER_PAGE;

    return questions.slice(
      start,
      start + QUESTIONS_PER_PAGE
    );
  }, [questions, currentPage]);

  function goToPreviousPage() {
    setCurrentPage((page) =>
      Math.max(page - 1, 1)
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goToNextPage() {
    setCurrentPage((page) =>
      Math.min(page + 1, totalPages)
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <main className="questions-page">
      <div className="questions-header">
        <div>
          <h1>Interview Questions</h1>

          <p>
            Select a category and file to view
            existing questions.
          </p>
        </div>

        <Link
          to="/"
          className="back-link"
        >
          ← Add Question
        </Link>
      </div>

      {error && (
        <div className="questions-error">
          {error}
        </div>
      )}

      <section className="question-filters">
        <div className="filter-group">
          <label htmlFor="view-category">
            Category
          </label>

          <select
            id="view-category"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
            disabled={loadingCategories}
          >
            <option value="">
              {loadingCategories
                ? "Loading categories..."
                : "Select category"}
            </option>

            {categories.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="view-file">
            File
          </label>

          <select
            id="view-file"
            value={file}
            onChange={(event) =>
              setFile(event.target.value)
            }
            disabled={
              !category || loadingFiles
            }
          >
            <option value="">
              {loadingFiles
                ? "Loading files..."
                : "Select file"}
            </option>

            {files.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {loadingQuestions && (
        <div className="questions-loading">
          Loading questions...
        </div>
      )}

      {!loadingQuestions &&
        category &&
        file &&
        questions.length === 0 && (
          <div className="no-questions">
            No questions found in this file.
          </div>
        )}

      {!loadingQuestions &&
        questions.length > 0 && (
          <>
            <div className="questions-summary">
              {questions.length} question
              {questions.length !== 1
                ? "s"
                : ""}{" "}
              found
            </div>

            <section className="questions-list">
              {visibleQuestions.map(
                (item) => (
                  <article
                    key={item.number}
                    className="question-card"
                  >
                    <h2>
                      Q{item.number}.{" "}
                      {item.question}
                    </h2>

                    <div className="answer-label">
                      Answer
                    </div>

                    <AnswerContent
                      answer={item.answer}
                    />
                  </article>
                )
              )}
            </section>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  onClick={
                    goToPreviousPage
                  }
                  disabled={
                    currentPage === 1
                  }
                >
                  ← Previous
                </button>

                <span>
                  Page {currentPage} of{" "}
                  {totalPages}
                </span>

                <button
                  type="button"
                  onClick={goToNextPage}
                  disabled={
                    currentPage ===
                    totalPages
                  }
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
    </main>
  );
}