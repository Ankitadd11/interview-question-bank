export function parseQuestions(content) {
  if (!content) {
    return [];
  }

  const normalizedContent = content
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  const questions = [];

  const questionRegex =
    /(?:^|\n)(?:#{1,6}\s*)?Q(\d+)\.\s*([^\n]*)([\s\S]*?)(?=(?:\n(?:#{1,6}\s*)?Q\d+\.)|$)/gi;

  let match;

  while ((match = questionRegex.exec(normalizedContent)) !== null) {
    const number = Number(match[1]);

    const question = match[2].trim();

    let answer = match[3].trim();

    answer = answer.replace(
      /^(?:#{1,6}\s*)?(?:Ans|Answer)\s*:?\s*/i,
      ""
    );

    answer = answer
      .replace(/&nbsp;/gi, " ")
      .replace(/\u00a0/g, " ")
      .trim();

    questions.push({
      number,
      question,
      answer,
    });
  }

  return questions.sort((a, b) => a.number - b.number);
}