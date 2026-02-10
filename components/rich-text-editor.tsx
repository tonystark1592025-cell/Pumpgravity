'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Mathematics } from '@tiptap/extension-mathematics';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import 'katex/dist/katex.min.css';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [mathFormula, setMathFormula] = useState('');
  const [showMathInput, setShowMathInput] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Subscript,
      Superscript,
      Mathematics,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const base64 = e.target?.result as string;
                editor?.chain().focus().setImage({ src: base64 }).run();
              };
              reader.readAsDataURL(file);
              return true;
            }
          }
        }
        return false;
      },
    },
  });

  if (!mounted || !editor) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
        <p className="text-center text-gray-500">Loading editor...</p>
      </div>
    );
  }

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageInput(false);
    }
  };

  const addMath = () => {
    if (mathFormula) {
      editor.chain().focus().insertContent(`<span data-type="mathematics" data-latex="${mathFormula}"></span>`).run();
      setMathFormula('');
      setShowMathInput(false);
    }
  };

  return (
    <div className="border rounded-lg">
      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-800">
        {/* Text Formatting */}
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('bold') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('italic') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('underline') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <u>U</u>
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('strike') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <s>S</s>
        </Button>

        <div className="w-px h-8 bg-gray-300 mx-1" />

        {/* Headings */}
        {[1, 2, 3, 4].map((level) => (
          <Button
            key={level}
            type="button"
            size="sm"
            variant={editor.isActive('heading', { level }) ? 'default' : 'outline'}
            onClick={() => editor.chain().focus().toggleHeading({ level: level as any }).run()}
          >
            H{level}
          </Button>
        ))}

        <div className="w-px h-8 bg-gray-300 mx-1" />

        {/* Lists */}
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('bulletList') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('orderedList') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </Button>

        <div className="w-px h-8 bg-gray-300 mx-1" />

        {/* Alignment */}
        <Button
          type="button"
          size="sm"
          variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          ⬅
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          ↔
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          ➡
        </Button>

        <div className="w-px h-8 bg-gray-300 mx-1" />

        {/* Colors */}
        <input
          type="color"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          className="w-8 h-8 rounded cursor-pointer"
          title="Text Color"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          🖍 Highlight
        </Button>

        <div className="w-px h-8 bg-gray-300 mx-1" />

        {/* Subscript/Superscript */}
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('subscript') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
        >
          X<sub>2</sub>
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('superscript') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
        >
          X<sup>2</sup>
        </Button>

        <div className="w-px h-8 bg-gray-300 mx-1" />

        {/* Code & Quote */}
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('code') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          {'</>'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('codeBlock') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          Code Block
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('blockquote') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          " Quote
        </Button>

        <div className="w-px h-8 bg-gray-300 mx-1" />

        {/* Image */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setShowImageInput(!showImageInput)}
        >
          🖼 Image
        </Button>

        {/* Math */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setShowMathInput(!showMathInput)}
        >
          ∑ Math
        </Button>

        <div className="w-px h-8 bg-gray-300 mx-1" />

        {/* Table */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}
        >
          📊 Table
        </Button>

        <div className="w-px h-8 bg-gray-300 mx-1" />

        {/* Clear */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
        >
          Clear Format
        </Button>
      </div>

      {/* Image Input */}
      {showImageInput && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900 border-b flex gap-2">
          <Input
            type="text"
            placeholder="Enter image URL or paste image (Ctrl+V)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addImage()}
          />
          <Button type="button" onClick={addImage} size="sm">Add</Button>
          <Button type="button" onClick={() => setShowImageInput(false)} size="sm" variant="outline">Cancel</Button>
        </div>
      )}

      {/* Math Input */}
      {showMathInput && (
        <div className="p-3 bg-purple-50 dark:bg-purple-900 border-b flex gap-2">
          <Input
            type="text"
            placeholder="Enter LaTeX formula (e.g., E = mc^2)"
            value={mathFormula}
            onChange={(e) => setMathFormula(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addMath()}
          />
          <Button type="button" onClick={addMath} size="sm">Add</Button>
          <Button type="button" onClick={() => setShowMathInput(false)} size="sm" variant="outline">Cancel</Button>
        </div>
      )}

      {/* Editor */}
      <EditorContent editor={editor} className="bg-white dark:bg-gray-900" />
    </div>
  );
}
