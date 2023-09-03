import { marked } from "marked";

const assignmentKeyWords: string[] = [
  "uppgift",
  "inlämning",
  "test",
  "prov",
  "laboration",
  "lab",
  "projekt",
  "djupdykning",
];

export function mdToGroupedHtml(md: string): Schedule {
  const container = document.createElement("div");
  container.innerHTML = marked.parse(formatMarkDown(md));

  const title = container.querySelector("h1")?.textContent ?? "";

  const elements = Array.from(container.children);

  let list = document.createElement("ul");
  const listItem = document.createElement("li");

  for (const [i, element] of elements.entries()) {
    listItem.appendChild(element);

    if (elements[i + 1]?.tagName === "H2") {
      // Only add weeks to the list
      // Anything else like title or introduction should be ignored
      if (!listItem.innerHTML.includes("h2")) {
        listItem.innerHTML = "";
        continue;
      }

      // Add data-week attribute to the listItem
      // and data-week-title attribute to the weekTitle
      const weekTitle = listItem.querySelector("h2");
      weekTitle?.setAttribute("data-week-title", "");
      listItem?.setAttribute(
        "data-week",
        weekTitle?.textContent?.match(/\d+/)?.[0] ?? ""
      );

      list.appendChild(listItem.cloneNode(true));
      // Reset the list item
      listItem.innerHTML = "";
    }
  }

  list = markAssignments(list);

  return {
    title: title,
    weekList: list,
  };
}

function markAssignments(list: HTMLUListElement): HTMLUListElement {
  const mutableList = list.cloneNode(true) as HTMLUListElement;

  for (const link of mutableList.querySelectorAll("a")) {
    const isAssignment = assignmentKeyWords.some((keyword) =>
      link.outerHTML
        ?.toLowerCase()
        .match(
          new RegExp("[^a-z,A-z]" + keyword.toLowerCase() + "[^a-z,A-z]", "g")
        )
    );

    if (isAssignment) {
      link.setAttribute("data-assignment", "");
      link.setAttribute(
        "data-assignment-week",
        link.closest("li")?.dataset.week ?? ""
      );
    }
  }

  return mutableList;
}

function formatMarkDown(md: string): string {
  // Make bullets behave like lists
  md = md.replace(/•/g, "-");

  return md;
}

export type Schedule = {
  title: string;
  weekList: HTMLElement;
  assignemnts?: HTMLElement[];
};
