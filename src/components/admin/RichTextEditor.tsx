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
import { Button } from '@/components/admin/Button'
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
  /** Nom accessible de la zone de texte : « Contenu de l'article » */
  label?: string
  /** Transmis par `Field` : relie l'aide et l'erreur à la zone de texte */
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  'aria-required'?: boolean
}

interface ToolButtonProps {
  label: string
  onClick: () => void
  /** Format actif à l'endroit du curseur */
  pressed?: boolean
  disabled?: boolean
  children: React.ReactNode
}

function ToolButton({ label, onClick, pressed, disabled, children }: ToolButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
    >
      {children}
    </Button>
  )
}

function ToolSeparator() {
  return <span aria-hidden="true" className="mx-1 h-6 w-px self-center bg-border" />
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Commencez à écrire...',
  className,
  label = 'Contenu',
  id,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
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
          // Orange encre : l'orange du logo est illisible en corps de texte sur blanc
          class: 'text-[color:var(--adm-orange-ink)] underline',
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
        ...(id ? { id } : {}),
        ...(describedBy ? { 'aria-describedby': describedBy } : {}),
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': label,
        class:
          'tiptap article-content prose prose-sm max-w-none focus:outline-none min-h-[24rem] px-4 py-3 [&_img]:max-w-full [&_img]:h-auto',
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

  if (!editor) {
    // Réserve la place de l'éditeur le temps qu'il se monte
    return <div aria-hidden="true" className={cn('h-[28rem] rounded-[3px] border border-border', className)} />
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

  return (
    <div
      className={cn(
        'adm-editor overflow-hidden rounded-[3px] border bg-background transition-colors duration-150 ease-out hover:border-foreground',
        invalid ? 'border-destructive' : 'border-input',
        className
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_MIME_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        tabIndex={-1}
      />

      <div role="toolbar" aria-label="Mise en forme" className="flex flex-wrap gap-0.5 border-b border-border p-1">
        <ToolButton
          label="Gras"
          onClick={() => editor.chain().focus().toggleBold().run()}
          pressed={editor.isActive('bold')}
        >
          <Bold />
        </ToolButton>
        <ToolButton
          label="Italique"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          pressed={editor.isActive('italic')}
        >
          <Italic />
        </ToolButton>
        <ToolButton
          label="Intertitre"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          pressed={editor.isActive('heading', { level: 2 })}
        >
          <Heading2 />
        </ToolButton>
        <ToolSeparator />
        <ToolButton
          label="Liste à puces"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          pressed={editor.isActive('bulletList')}
        >
          <List />
        </ToolButton>
        <ToolButton
          label="Liste numérotée"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          pressed={editor.isActive('orderedList')}
        >
          <ListOrdered />
        </ToolButton>
        <ToolButton
          label="Citation"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          pressed={editor.isActive('blockquote')}
        >
          <Quote />
        </ToolButton>
        <ToolSeparator />
        <ToolButton label="Lien" onClick={addLink} pressed={editor.isActive('link')}>
          <LinkIcon />
        </ToolButton>
        <ToolButton
          label={isUploading ? "Envoi de l'image…" : 'Insérer une image'}
          onClick={triggerImageUpload}
          disabled={isUploading}
        >
          {isUploading ? <Loader2 className="animate-spin" /> : <ImageIcon />}
        </ToolButton>
        <ToolSeparator />
        <ToolButton
          label="Annuler la dernière action"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo />
        </ToolButton>
        <ToolButton
          label="Rétablir"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo />
        </ToolButton>
      </div>
      <div className="max-h-[800px] overflow-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
