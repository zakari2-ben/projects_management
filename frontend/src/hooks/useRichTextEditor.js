import { useState } from 'react'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'

export function useRichTextEditor({ contentClassName, onChange, initialFontFamily = 'Segoe UI' }) {
  const [editorFontFamily, setEditorFontFamily] = useState(initialFontFamily)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
    ],
    content: '',
    onUpdate: ({ editor: currentEditor }) => {
      onChange?.(currentEditor.getHTML())
    },
    editorProps: {
      attributes: {
        class: contentClassName,
      },
    },
  })

  const applyLink = () => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href || ''
    const url = window.prompt('Enter link URL', previousUrl)
    if (url === null) return
    if (url.trim() === '') {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().setLink({ href: url.trim() }).run()
  }

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file || !editor) return

    const reader = new FileReader()
    reader.onload = () => {
      const src = typeof reader.result === 'string' ? reader.result : ''
      if (src) {
        editor.chain().focus().setImage({ src, alt: file.name }).run()
      }
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const resetEditor = () => {
    editor?.commands.clearContent()
    editor?.commands.setFontFamily(initialFontFamily)
    setEditorFontFamily(initialFontFamily)
  }

  return {
    editor,
    editorFontFamily,
    setEditorFontFamily,
    applyLink,
    handleImageUpload,
    resetEditor,
  }
}
