"use client"

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import UnderlineExtension from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { all, createLowlight } from 'lowlight'
import {
    Bold,
    Heading1,
    Heading2,
    Image as ImageIcon,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Quote,
    Redo,
    Terminal,
    Underline as UnderlineIcon,
    Undo
} from 'lucide-react'
import { useCallback } from 'react'

const lowlight = createLowlight(all)

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

const MenuButton = ({
  onClick,
  isActive = false,
  disabled = false,
  children,
  title
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
  title?: string
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-lg transition-all ${
      isActive
        ? 'bg-primary text-white shadow-sm'
        : 'text-text-muted hover:bg-surface-muted hover:text-surface-on'
    } disabled:opacity-30 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
)

export default function RichTextEditor({ content, onChange, placeholder = 'Write something amazing...' }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'rounded-xl bg-slate-900 text-slate-100 p-4 font-mono text-sm my-6 overflow-x-auto shadow-inner',
        },
      }),
      UnderlineExtension,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary transition-all',
        },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-2xl border border-border max-w-full h-auto my-8 mx-auto block shadow-level-2',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm md:prose-base max-w-none focus:outline-none min-h-[400px] p-6',
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || [])
        for (const item of items) {
          if (item.type.startsWith('image')) {
            const file = item.getAsFile()
            if (file) {
              const reader = new FileReader()
              reader.onload = (e) => {
                const result = e.target?.result as string
                if (result) {
                  const { schema } = view.state
                  const node = schema.nodes.image.create({ src: result })
                  const transaction = view.state.tr.replaceSelectionWith(node)
                  view.dispatch(transaction)
                }
              }
              reader.readAsDataURL(file)
              return true
            }
          }
        }
        return false
      },
      handleDrop: (view, event) => {
        const files = Array.from(event.dataTransfer?.files || [])
        if (files.length > 0 && files[0].type.startsWith('image')) {
          const file = files[0]
          const reader = new FileReader()
          reader.onload = (e) => {
            const result = e.target?.result as string
            if (result) {
              const { schema } = view.state
              const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
              const node = schema.nodes.image.create({ src: result })
              const transaction = view.state.tr.insert(coordinates?.pos || view.state.selection.from, node)
              view.dispatch(transaction)
            }
          }
          reader.readAsDataURL(file)
          return true
        }
        return false
      }
    },
  })

  const addImage = useCallback(() => {
    const url = window.prompt('URL')
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) return
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className="w-full border border-border rounded-2xl overflow-hidden bg-surface shadow-soft transition-all focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-surface-muted sticky top-0 z-10">
        <div className="flex items-center gap-1 pr-2 border-r border-border">
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
          >
            <Heading1 size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
          >
            <Heading2 size={18} />
          </MenuButton>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-border">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
          >
            <Bold size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
          >
            <Italic size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
          >
            <UnderlineIcon size={18} />
          </MenuButton>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-border">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
          >
            <List size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
          >
            <ListOrdered size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
          >
            <Quote size={18} />
          </MenuButton>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-border">
          <MenuButton onClick={setLink} isActive={editor.isActive('link')}>
            <LinkIcon size={18} />
          </MenuButton>
          <MenuButton onClick={addImage}>
            <ImageIcon size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
          >
            <Terminal size={18} />
          </MenuButton>
        </div>

        <div className="flex items-center gap-1 pl-2 ml-auto">
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo size={18} />
          </MenuButton>
        </div>
      </div>

      {/* Removed BubbleMenu due to build issue */}

      {/* Editor Surface */}
      <div className="relative">
        <EditorContent editor={editor} />
      </div>

      {/* Counter/Stats */}
      <div className="px-4 py-2 border-t border-border bg-surface-muted flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-text-faint">
        <span>Rich Text Editor</span>
        <span>{editor.getText().split(/\s+/).filter(Boolean).length} words</span>
      </div>
    </div>
  )
}
