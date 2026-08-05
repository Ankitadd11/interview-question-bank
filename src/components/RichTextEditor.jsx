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
    const editorContainerRef =
      useRef(null);

    const quillRef =
      useRef(null);

    const onChangeRef =
      useRef(onChange);


    /*
     * Keep latest onChange function
     * without recreating Quill.
     */
    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);


    /*
     * Create Quill once.
     */
    useEffect(() => {
      if (!editorContainerRef.current) {
        return;
      }


      const quill = new Quill(
        editorContainerRef.current,
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


      quillRef.current = quill;


      /*
       * Whenever the editor changes,
       * give both HTML and plain text
       * back to the parent.
       */
      const handleTextChange = () => {
        const text =
          quill
            .getText()
            .trim();

        const html =
          normalizeHtml(
            quill.getSemanticHTML()
          );


        onChangeRef.current?.({
          text,
          html
        });
      };


      quill.on(
        "text-change",
        handleTextChange
      );


      return () => {
        quill.off(
          "text-change",
          handleTextChange
        );

        quillRef.current = null;

        if (editorContainerRef.current) {
          editorContainerRef.current.innerHTML =
            "";
        }
      };
    }, []);


    /*
     * Parent can call:
     *
     * editorRef.current.clear()
     *
     * after successful submission.
     */
    useImperativeHandle(
      ref,
      () => ({
        clear() {
          quillRef.current?.setText("");
        }
      }),
      []
    );


    return (
      <div
        ref={editorContainerRef}
        className="rich-text-editor"
      />
    );
  }
);


export default RichTextEditor;