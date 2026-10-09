'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import { useState, useRef } from 'react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import FileHandler from '@tiptap/extension-file-handler'
import ResizableImageExtension from 'tiptap-extension-resize-image'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Undo,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading2,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  looksLikePlainList,
  normalizePastedHtml,
  persistEmptyParagraphs,
  plainTextToHtml,
} from '@/lib/editor-paste'
import { toast } from 'sonner'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

interface ToolbarItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  active?: boolean
  disabled?: boolean
  spin?: boolean
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Commencez à écrire...',
  className,
}: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<Editor | null>(null)

  const uploadImage = async (file: File): Promise<string> => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error('Format non supporté. Utilisez JPEG, PNG, GIF ou WebP.')
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error('L\'image ne doit pas dépasser 10MB.')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'articles')

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Échec de l\'upload')
    }

    const { url } = await response.json()
    return url
  }

  const handleImageUpload = async (file: File, editor: any, pos?: number) => {
    setIsUploading(true)

    try {
      const url = await uploadImage(file)

      if (pos !== undefined) {
        editor.chain().insertContentAt(pos, {
          type: 'image',
          attrs: { src: url },
        }).focus().run()
      } else {
        editor.chain().focus().setImage({ src: url }).run()
      }

      toast.success('Image ajoutée avec succès !')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Échec de l\'upload'
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      ResizableImageExtension.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto mx-auto block',
        },
      }),
      FileHandler.configure({
        allowedMimeTypes: ALLOWED_MIME_TYPES,
        onDrop: (currentEditor, files, pos) => {
          files.forEach((file) => {
            handleImageUpload(file, currentEditor, pos)
          })
        },
        onPaste: (currentEditor, files) => {
          files.forEach((file) => {
            handleImageUpload(file, currentEditor)
          })
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(persistEmptyParagraphs(editor.getHTML()))
    },
    editorProps: {
      attributes: {
        class:
          'tiptap article-content prose prose-sm max-w-none min-h-[500px] px-4 py-3 text-foreground focus:outline-none sm:px-6 sm:py-4 [&_img]:h-auto [&_img]:max-w-full [&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:text-muted-foreground [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]',
      },
      transformPastedHTML: (html) => normalizePastedHtml(html),
      handlePaste: (_view, event) => {
        const html = event.clipboardData?.getData('text/html')?.trim() ?? ''
        const text = event.clipboardData?.getData('text/plain') ?? ''
        const currentEditor = editorRef.current

        if (html || !currentEditor || !looksLikePlainList(text)) return false

        currentEditor.chain().focus().insertContent(plainTextToHtml(text)).run()
        return true
      },
    },
  })

  editorRef.current = editor

  // Réserve la place de l'éditeur pendant son initialisation (évite un saut de mise en page)
  if (!editor) {
    return <div aria-hidden className={cn('min-h-[548px] rounded-lg border border-input bg-card shadow-xs', className)} />
  }

  const addLink = () => {
    const url = window.prompt('URL du lien:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const triggerImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleImageUpload(file, editor)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const tools: ToolbarItem[][] = [
    [
      { label: 'Gras', icon: Bold, onClick: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
      { label: 'Italique', icon: Italic, onClick: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
      {
        label: 'Intertitre',
        icon: Heading2,
        onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        active: editor.isActive('heading', { level: 2 }),
      },
    ],
    [
      { label: 'Liste à puces', icon: List, onClick: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
      {
        label: 'Liste numérotée',
        icon: ListOrdered,
        onClick: () => editor.chain().focus().toggleOrderedList().run(),
        active: editor.isActive('orderedList'),
      },
      { label: 'Citation', icon: Quote, onClick: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
    ],
    [
      { label: 'Lien', icon: LinkIcon, onClick: addLink, active: editor.isActive('link') },
      { label: 'Insérer une image', icon: isUploading ? Loader2 : ImageIcon, onClick: triggerImageUpload, disabled: isUploading, spin: isUploading },
    ],
    [
      { label: 'Annuler la dernière modification', icon: Undo, onClick: () => editor.chain().focus().undo().run(), disabled: !editor.can().undo() },
      { label: 'Rétablir', icon: Redo, onClick: () => editor.chain().focus().redo().run(), disabled: !editor.can().redo() },
    ],
  ]

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-input bg-card shadow-xs transition-colors focus-within:border-primary-500/60',
        className
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_MIME_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Barre d'outils */}
      <div
        role="toolbar"
        aria-label="Mise en forme"
        className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 px-1.5 py-1.5"
      >
        {tools.map((group, groupIndex) => (
          <div key={groupIndex} className="flex items-center gap-0.5">
            {groupIndex > 0 && <span aria-hidden className="mx-1 h-5 w-px bg-border" />}
            {group.map((tool) => {
              const Icon = tool.icon
              return (
                <button
                  key={tool.label}
                  type="button"
                  onClick={tool.onClick}
                  disabled={tool.disabled}
                  title={tool.label}
                  aria-label={tool.label}
                  aria-pressed={tool.active === undefined ? undefined : tool.active}
                  className={cn(
                    'inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 sm:size-8',
                    tool.active && 'bg-primary-50 text-primary-800 hover:bg-primary-100 hover:text-primary-800'
                  )}
                >
                  <Icon className={cn('size-4', tool.spin && 'animate-spin')} />
                </button>
              )
            })}
          </div>
        ))}
      </div>
      <div className="max-h-[800px] overflow-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
