export function detectUnusualTyping(text: string, time: number): boolean {
  const wordsPerMinute = (text.split(" ").length / time) * 60
  return wordsPerMinute > 100 // Assuming typing speed above 100 WPM is unusual
}

