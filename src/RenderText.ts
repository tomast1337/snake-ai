import hljs from "highlight.js";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";

export const displayMarkdownContent = () => {
  const explanation = document.getElementById("article")! as HTMLDivElement;
  fetch("/README.md")
    .then((response) => response.text())
    .then((text) => {
      const marked = new Marked(
        markedHighlight({
          emptyLangClass: "hljs",
          langPrefix: "hljs language-",
          highlight: (code, lang) => {
            if ((lang && hljs.getLanguage(lang)) || lang === "typescript") {
              try {
                return hljs.highlight(code, { language: lang }).value;
              } catch (error) {
                console.error("Error highlighting code", error);
              }
            }
            return "";
          },
        })
      );
      explanation.innerHTML = marked.parse(text, {
        gfm: true,
        breaks: true,
        async: false,
      });
    })
    .catch((error) => {
      console.error("Error fetching README.md", error);
    });
};
