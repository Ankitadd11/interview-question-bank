import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef
} from "react";

import Quill from "quill";

import "quill/dist/quill.snow.css";
import "../styles/rich-text-editor.css";


function normalizeHtml(html) {
  return html
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00A0/g, " ")
    .trim();
}


const RichTextEditor = forwardRef(
  function RichTextEditor(
    {
      onChange
    },
    ref
  ) {

    const wrapperRef =
      useRef(null);

    const editorContainerRef =
      useRef(null);

    const quillRef =
      useRef(null);

    const onChangeRef =
      useRef(onChange);


    /*
     * Keep latest callback without
     * recreating Quill.
     */

    useEffect(() => {
      onChangeRef.current =
        onChange;
    }, [onChange]);


    /*
     * Initialize Quill.
     */

    useEffect(() => {

      if (
        !editorContainerRef.current
      ) {
        return;
      }


      const editorElement =
        editorContainerRef.current;


      const quill =
        new Quill(
          editorElement,
          {
            theme: "snow",

            placeholder:
              "Enter the answer",

            modules: {
              toolbar: [

                [
                  {
                    header: [
                      1,
                      2,
                      3,
                      false
                    ]
                  }
                ],

                [
                  "bold",
                  "italic",
                  "underline",
                  "strike"
                ],

                [
                  {
                    color: []
                  },

                  {
                    background: []
                  }
                ],

                [
                  {
                    list: "ordered"
                  },

                  {
                    list: "bullet"
                  }
                ],

                [
                  {
                    indent: "-1"
                  },

                  {
                    indent: "+1"
                  }
                ],

                [
                  {
                    align: []
                  }
                ],

                [
                  "blockquote",
                  "code-block"
                ],

                [
                  "link"
                ],

                [
                  "clean"
                ]

              ]
            }
          }
        );


      quillRef.current =
        quill;


      /*
       * Send editor contents
       * to AddQuestionPage.
       */

      const handleTextChange =
        () => {

          const text =
            quill
              .getText()
              .trim();


          const html =
            normalizeHtml(
              quill
                .getSemanticHTML()
            );


          onChangeRef
            .current?.({
              text,
              html
            });

        };


      quill.on(
        "text-change",
        handleTextChange
      );


      /*
       * Cleanup is especially
       * important because React
       * StrictMode mounts twice
       * during development.
       */

      return () => {

        quill.off(
          "text-change",
          handleTextChange
        );


        quillRef.current =
          null;


        /*
         * Quill automatically puts
         * the toolbar immediately
         * before the editor.
         *
         * Remove it during cleanup.
         */

        const toolbar =
          editorElement
            .previousElementSibling;


        if (
          toolbar &&
          toolbar.classList.contains(
            "ql-toolbar"
          )
        ) {
          toolbar.remove();
        }


        /*
         * Reset editor DOM so Quill
         * can initialize cleanly.
         */

        editorElement.innerHTML =
          "";

        editorElement.className =
          "rich-text-editor";

      };

    }, []);


    /*
     * Methods available to parent.
     */

    useImperativeHandle(
      ref,
      () => ({

        clear() {

          if (
            quillRef.current
          ) {
            quillRef
              .current
              .setText("");
          }

        }

      }),
      []
    );


    return (

      <div
        ref={wrapperRef}
        className=
          "rich-text-editor-wrapper"
      >

        <div
          ref={
            editorContainerRef
          }
          className=
            "rich-text-editor"
        />

      </div>

    );

  }
);


export default RichTextEditor;