// Slash Cmd

import { ReactNode } from "react";

import {
  Heading1,
  Heading2,
  Heading3,
  List,
  Text,
  ListOrdered,
  Heading4,
  Heading5,
  Heading6,
  Divide,
  Table,
} from "lucide-react";
import { createSuggestionsItems } from "@harshtalks/slash-tiptap";

export const slashSuggestions = createSuggestionsItems<{
  description: string;
  icon: ReactNode;
}>([
  {
    title: "Text",
    description: "Just start typing with plain text.",
    searchTerms: ["p", "paragraph"],
    icon: <Text size={16} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .run();
    },
  },
  {
    title: "Heading 1",
    description: "Big section heading.",
    searchTerms: ["title", "big", "large"],
    icon: <Heading1 size={16} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading.",
    searchTerms: ["subtitle", "medium"],
    icon: <Heading2 size={16} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading.",
    searchTerms: ["subtitle", "small"],
    icon: <Heading3 size={16} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
    },
  },
  {
    title: "Heading 4",
    description: "Small section heading.",
    searchTerms: ["subtitle", "smaller"],
    icon: <Heading4 size={16} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 4 }).run();
    },
  },
  {
    title: "Heading 5",
    description: "Small section heading.",
    searchTerms: ["subtitle", "small"],
    icon: <Heading5 size={16} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 5 }).run();
    },
  },
  {
    title: "Heading 6",
    description: "Small section heading.",
    searchTerms: ["subtitle", "small"],
    icon: <Heading6 size={16} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 6 }).run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list.",
    searchTerms: ["unordered", "point"],
    icon: <List size={16} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Ordered List",
    description: "Create a simple ordered list.",
    searchTerms: ["ordered", "point", "numbers"],
    icon: <ListOrdered size={16} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Divider",
    description: "Add a horizontal divider.",
    searchTerms: ["line", "separator", "divider"],
    icon: <Divide size={16} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: "Table",
    description: "Insert a table.",
    searchTerms: ["table", "grid"],
    icon: <Table size={16} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertTable().run();
    },
  },
]);
