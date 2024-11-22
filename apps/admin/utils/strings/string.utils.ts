// Format text to have first letter uppercase and rest lowercase
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function capitalizeEachWord(text: string): string {
  return text
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}
