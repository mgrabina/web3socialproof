import { IconAttributes } from "../constants";

export const isMobile = () => window.innerWidth < 768;

// Function to style {{METRIC}} placeholders
export function renderTextWithMetricStyles(
  text: string,
  baseColor: string,
  availableMetricNames: Set<string>,
  fontSize: string,
  fontWeight: string
): HTMLDivElement {
  if (
    !availableMetricNames.size ||
    !text ||
    !text.includes("{") ||
    !text.includes("}")
  ) {
    const span = document.createElement("div");
    span.textContent = text;
    span.style.fontSize = fontSize;
    span.style.fontWeight = fontWeight;
    span.style.color = baseColor;

    return span;
  }

  const container = document.createElement("div");
  container.style.fontSize = fontSize;
  const regex = /{(.*?)}/g;
  const parts = text.split(regex);

  parts.forEach((part, index) => {
    if (index % 2 === 1) {
      // This is a placeholder (e.g., {METRIC})
      const isValidMetric = availableMetricNames?.has(part);
      const span = document.createElement("span");
      span.textContent = isValidMetric ? "3.5k" : `{${part}}`;
      span.style.color = isValidMetric ? baseColor : "#FA7070";
      span.style.fontWeight = fontWeight;
      container.appendChild(span);
    } else {
      // Regular text
      const span = document.createElement("span");
      span.textContent = part;
      span.style.color = baseColor;
      span.style.fontWeight = fontWeight;
      container.appendChild(span);
    }
  });

  return container;
}

export const createSvgIcon = (
  pathsArray: string[],
  attributes: IconAttributes = {}
): SVGElement | null => {
  if (typeof document === "undefined") {
    return null;
  }

  const {
    viewBox = "0 0 24 24",
    width = "24",
    height = "24",
    color = "currentColor",
  } = attributes;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("viewBox", viewBox);

  pathsArray.forEach((pathData) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    svg.appendChild(path);
  });

  return svg;
};
