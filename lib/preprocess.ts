export function preprocessText(input: string) {
  let text = input || "";

  text = text.replace(/\r\n/g, "\n");
  text = text.replace(/\t/g, " ");
  text = text.replace(/[ ]{2,}/g, " ");
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.trim();

  const wordCount = text ? text.split(/\s+/).length : 0;
  const paragraphCount = text ? text.split(/\n+/).filter(Boolean).length : 0;

  return {
    cleanedText: text,
    wordCount,
    paragraphCount,
    tooShort: wordCount < 3,
    tooLong: wordCount > 3000,
  };
}