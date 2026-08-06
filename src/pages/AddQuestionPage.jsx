import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  Link
} from "react-router-dom";


import CategorySelect
  from "../components/CategorySelect";

import FileSelect
  from "../components/FileSelect";

import RichTextEditor
  from "../components/RichTextEditor";


import {
  getCategories,
  getCategoryFiles
} from "../services/githubService";

import {
  addQuestion
} from "../services/questionService";


import "../styles/form.css";


function AddQuestionPage() {

  /*
   * GitHub data
   */

  const [
    categories,
    setCategories
  ] = useState([]);

  const [
    files,
    setFiles
  ] = useState([]);


  /*
   * Form data
   */

  const [
    category,
    setCategory
  ] = useState("");

  const [
    file,
    setFile
  ] = useState("");

  const [
    question,
    setQuestion
  ] = useState("");

  const [
    answer,
    setAnswer
  ] = useState({
    text: "",
    html: ""
  });

  const [
    appPassword,
    setAppPassword
  ] = useState("");


  /*
   * Loading state
   */

  const [
    loadingCategories,
    setLoadingCategories
  ] = useState(true);

  const [
    loadingFiles,
    setLoadingFiles
  ] = useState(false);

  const [
    submitting,
    setSubmitting
  ] = useState(false);


  /*
   * Messages
   */

  const [
    loadError,
    setLoadError
  ] = useState("");

  const [
    submitError,
    setSubmitError
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage
  ] = useState("");


  /*
   * Quill reference
   */

  const editorRef =
    useRef(null);


  /*
   * Load GitHub categories
   */

  useEffect(() => {

    async function loadCategories() {

      try {

        setLoadingCategories(
          true
        );

        setLoadError("");


        const result =
          await getCategories();


        setCategories(
          result
        );

      } catch (error) {

        console.error(
          error
        );


        setLoadError(
          "Unable to load categories."
        );

      } finally {

        setLoadingCategories(
          false
        );

      }

    }


    loadCategories();

  }, []);


  /*
   * Load files when category
   * changes
   */

  useEffect(() => {

    if (!category) {

      setFiles([]);

      setFile("");

      return;
    }


    async function loadFiles() {

      try {

        setLoadingFiles(
          true
        );

        setLoadError("");

        setFile("");


        const result =
          await getCategoryFiles(
            category
          );


        setFiles(
          result
        );

      } catch (error) {

        console.error(
          error
        );


        setFiles([]);


        setLoadError(
          "Unable to load files."
        );

      } finally {

        setLoadingFiles(
          false
        );

      }

    }


    loadFiles();

  }, [category]);


  /*
   * Submit question
   */

  async function handleSubmit(
    event
  ) {

    event.preventDefault();


    setSubmitError("");

    setSuccessMessage("");


    /*
     * Client validation
     */

    if (!category) {

      setSubmitError(
        "Please select a category."
      );

      return;
    }


    if (!file) {

      setSubmitError(
        "Please select a file."
      );

      return;
    }


    if (!question.trim()) {

      setSubmitError(
        "Please enter a question."
      );

      return;
    }


    if (!answer.text) {

      setSubmitError(
        "Please enter an answer."
      );

      return;
    }


    if (!appPassword) {

      setSubmitError(
        "Please enter the app password."
      );

      return;
    }


    try {

      setSubmitting(
        true
      );


      const result =
        await addQuestion({
          category,
          file,

          question:
            question.trim(),

          answer:
            answer.html,

          appPassword
        });


      setSuccessMessage(
        `${result.questionNumber} ` +
        `added successfully to ` +
        `${result.path}.`
      );


      /*
       * Clear Question
       */

      setQuestion("");


      /*
       * Clear Answer state
       */

      setAnswer({
        text: "",
        html: ""
      });


      /*
       * Clear Quill
       */

      editorRef
        .current
        ?.clear();


      /*
       * Category and File
       * intentionally remain
       * selected.
       *
       * This makes adding several
       * questions easier.
       */


    } catch (error) {

      console.error(
        error
      );


      setSubmitError(
        error.message
      );

    } finally {

      setSubmitting(
        false
      );

    }

  }


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
            className="button secondary-button"
          >
            + Add Category / File
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

        <h2>
          Add Question
        </h2>


        <form
          className="question-form"
          onSubmit={handleSubmit}
        >

          <CategorySelect
            categories={
              categories
            }

            value={
              category
            }

            onChange={
              setCategory
            }

            loading={
              loadingCategories
            }
          />


          <FileSelect
            files={
              files
            }

            value={
              file
            }

            onChange={
              setFile
            }

            loading={
              loadingFiles
            }

            category={
              category
            }
          />


          <div className="form-group">

            <label htmlFor="question">
              Question
            </label>


            <textarea
              id="question"

              value={
                question
              }

              onChange={
                event =>
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
              ref={
                editorRef
              }

              onChange={
                setAnswer
              }
            />

          </div>


          <div className="form-group">

            <label htmlFor="appPassword">
              App Password
            </label>


            <input
              id="appPassword"

              type="password"

              value={
                appPassword
              }

              onChange={
                event =>
                  setAppPassword(
                    event.target.value
                  )
              }

              placeholder=
              "Enter the app password"

              autoComplete=
              "current-password"

              required
            />

          </div>


          {loadError && (
            <p className="error-message">
              {loadError}
            </p>
          )}


          {submitError && (
            <p className="error-message">
              {submitError}
            </p>
          )}


          {successMessage && (
            <p className="success-message">
              {successMessage}
            </p>
          )}


          <button
            type="submit"

            className="submit-button"

            disabled={
              submitting
            }
          >

            {
              submitting
                ? "Adding Question..."
                : "Add Question"
            }

          </button>

        </form>

      </section>

    </main>
  );
}


export default AddQuestionPage;