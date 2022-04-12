/** @format */

import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
const TextView = ({ code, language, showLnNum }) => {
  const codeString = "(num) => num + 1";
  return (
    <SyntaxHighlighter
      language={language}
      style={dark}
      showLineNumbers={showLnNum}
    >
      {JSON.parse(code)}
    </SyntaxHighlighter>
  );
};
export default TextView;
