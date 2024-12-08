"use client";

import { ImageExtension } from "@harshtalks/image-tiptap";
import { Slash, enableKeyboardNavigation } from "@harshtalks/slash-tiptap";
import Bold from "@tiptap/extension-bold";
import BulletList from "@tiptap/extension-bullet-list";
import Document from "@tiptap/extension-document";
import Dropcursor from "@tiptap/extension-dropcursor";
import Heading from "@tiptap/extension-heading";
import Highlight from "@tiptap/extension-highlight";
import History from "@tiptap/extension-history";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Italic from "@tiptap/extension-italic";
import LinkExtension from "@tiptap/extension-link";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Text from "@tiptap/extension-text";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import UnderlineNode from "@tiptap/extension-underline";
import { useEditor } from "@tiptap/react";
import { slashSuggestions } from "./plugins/slash.plugin";

const useNotebookEditor = () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Italic,
      Bold,
      UnderlineNode,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") {
            return `Heading ${node.attrs.level}`;
          }
          return "Press '/' for commands";
        },
        includeChildren: true,
      }),
      Highlight,
      Typography,
      History,
      TextAlign.configure({
        defaultAlignment: "left",
        types: ["heading", "paragraph", "tableCell", "image"],
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "!list-disc !pl-4",
        },
        itemTypeName: "listItem",
      }),
      ListItem,
      OrderedList,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      Dropcursor,
      ImageExtension.configure({
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }).extend({
        allowGapCursor: true,
      }),
      TableCell,
      TableHeader,
      TableRow.extend({
        allowGapCursor: true,
      }),
      Slash.configure({
        suggestion: {
          items: () => slashSuggestions,
        },
      }),
      LinkExtension,
      HorizontalRule,
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none",
      },
      handleDOMEvents: {
        keydown: (_, event) => {
          return enableKeyboardNavigation(event);
        },
      },
    },
  });

  return { editor };
};

export default useNotebookEditor;
