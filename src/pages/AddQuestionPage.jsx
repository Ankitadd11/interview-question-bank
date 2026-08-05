import {
  useEffect,
  useRef,
  useState
} from "react";

import { Link } from "react-router-dom";

import RichTextEditor
  from "../components/RichTextEditor";

import CategorySelect
  from "../components/CategorySelect";

import FileSelect
  from "../components/FileSelect";

import {
  getCategories,
  getCategoryFiles
} from "../services/githubService";

import "../styles/form.css";

function AddQuestionPage() {
  const [categories, setCategories] =
    useState([]);

  const [files, setFiles] =
    useState([]);

  const [question, setQuestion] =
    useState("");

  const [answer, setAnswer] =
    useState({
      text: "",
      html: ""
    });

  const editorRef =
    useRef(null);

  const [category, setCategory] =
    useState("");

  const [file, setFile] =
    useState("");

  const [
    loadingCategories,
    setLoadingCategories
  ] = useState(true);

  const [
    loadingFiles,
    setLoadingFiles
  ] = useState(false);

  const [error, setError] =
    useState("");


  /*
   * Load categories when
   * the page opens.
   */
  useEffect(() => {
    async function loadCategories() {
      try {
        setLoadingCategories(true);

        const result =
          await getCategories();

        setCategories(result);
      } catch (err) {
        setError(
          "Unable to load categories."
        );

        console.error(err);
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);


  /*
   * Load files whenever the
   * selected category changes.
   */
  useEffect(() => {
    if (!category) {
      setFiles([]);
      setFile("");
      return;
    }

    async function loadFiles() {
      try {
        setLoadingFiles(true);
        setError("");
        setFile("");

        const result =
          await getCategoryFiles(
            category
          );

        setFiles(result);
      } catch (err) {
        setFiles([]);

        setError(
          "Unable to load files."
        );

        console.error(err);
      } finally {
        setLoadingFiles(false);
      }
    }

    loadFiles();
  }, [category]);


  return (
    <main className="page-container">

      <div className="page-header">

        <div>
          <h1>
            Interview Question Bank
          </h1>

          <p>
            Add and manage your
            interview questions.
          </p>
        </div>

        <div className="page-actions">

          <Link
            to="/categories/add"
            className=
            "button secondary-button"
          >
            + Add Category
          </Link>

          <Link
            to="/questions"
            className=
            "button link-button"
          >
            View Existing Questions
          </Link>

        </div>
      </div>


      <section className="content-card">

        <h2>Add Question</h2>

        <form className="question-form">

          <CategorySelect
            categories={categories}
            value={category}
            onChange={setCategory}
            loading={
              loadingCategories
            }
          />

          <FileSelect
            files={files}
            value={file}
            onChange={setFile}
            loading={loadingFiles}
            category={category}
          />
          <div className="form-group">
            <label htmlFor="question">
              Question
            </label>

            <textarea
              id="question"
              value={question}
              onChange={event =>
                setQuestion(
                  event.target.value
                )
              }
              placeholder=
              "Enter the interview question"
              rows="4"
              required
            />
          </div>


          <div className="form-group">
            <label>
              Answer
            </label>

            <RichTextEditor
              ref={editorRef}
              onChange={setAnswer}
            />
          </div>

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

        </form>

      </section>

    </main>
  );
}

export default AddQuestionPage;