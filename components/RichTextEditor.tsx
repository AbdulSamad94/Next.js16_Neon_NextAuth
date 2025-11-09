"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Code,
  Type,
} from "lucide-react";
import { useCallback } from "react";
import { RichTextEditorProps } from "@/lib/types";

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your amazing content...",
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "ProseMirror prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-4",
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="bg-muted/30 border-b border-border p-2 flex flex-wrap gap-1 items-center">
        {/* Heading Buttons */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 1 }).run();
            }}
            className={`h-8 px-2 ${
              editor.isActive("heading", { level: 1 })
                ? "bg-primary text-primary-foreground"
                : ""
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 2 }).run();
            }}
            className={`h-8 px-2 ${
              editor.isActive("heading", { level: 2 })
                ? "bg-primary text-primary-foreground"
                : ""
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 3 }).run();
            }}
            className={`h-8 px-2 ${
              editor.isActive("heading", { level: 3 })
                ? "bg-primary text-primary-foreground"
                : ""
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              editor.chain().focus().setParagraph().run();
            }}
            className={`h-8 px-2 ${
              editor.isActive("paragraph")
                ? "bg-primary text-primary-foreground"
                : ""
            }`}
            title="Normal Text"
          >
            <Type className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Text Formatting */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`h-8 px-2 ${
              editor.isActive("bold")
                ? "bg-primary text-primary-foreground"
                : ""
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`h-8 px-2 ${
              editor.isActive("italic")
                ? "bg-primary text-primary-foreground"
                : ""
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`h-8 px-2 ${
              editor.isActive("underline")
                ? "bg-primary text-primary-foreground"
                : ""
            }`}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Lists */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`h-8 px-2 ${
              editor.isActive("bulletList")
                ? "bg-primary text-primary-foreground"
                : ""
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`h-8 px-2 ${
              editor.isActive("orderedList")
                ? "bg-primary text-primary-foreground"
                : ""
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Other */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={setLink}
            className={`h-8 px-2 ${
              editor.isActive("link")
                ? "bg-primary text-primary-foreground"
                : ""
            }`}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`h-8 px-2 ${
              editor.isActive("code")
                ? "bg-primary text-primary-foreground"
                : ""
            }`}
            title="Inline Code"
          >
            <Code className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="bg-background">
        <EditorContent editor={editor} />
      </div>

      {/* Helper Text */}
      <div className="bg-muted/30 border-t border-border px-4 py-2">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Tip:</strong> Type on any line, then click a heading button
          to convert it. Or select text first to format it.
        </p>
      </div>
    </div>
  );
}
