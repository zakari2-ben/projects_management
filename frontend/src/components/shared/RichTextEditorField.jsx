import { EditorContent } from '@tiptap/react'

const fontOptions = ['Segoe UI', 'Arial', 'Georgia', 'Times New Roman', 'Courier New']

export default function RichTextEditorField({
  classNamePrefix,
  editor,
  editorFontFamily,
  onFontFamilyChange,
  onApplyLink,
  onImageUpload,
}) {
  return (
    <div className={`${classNamePrefix}__editor`}>
      <div className={`${classNamePrefix}__editor-toolbar`}>
        <select
          value={editorFontFamily}
          onChange={(event) => onFontFamilyChange?.(event.target.value)}
          className={`${classNamePrefix}__toolbar-select`}
        >
          {fontOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={`${classNamePrefix}__toolbar-button`}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          B
        </button>
        <button
          type="button"
          className={`${classNamePrefix}__toolbar-button`}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          I
        </button>
        <button
          type="button"
          className={`${classNamePrefix}__toolbar-button`}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          U
        </button>
        <button
          type="button"
          className={`${classNamePrefix}__toolbar-button`}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          List
        </button>
        <button
          type="button"
          className={`${classNamePrefix}__toolbar-button`}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          Quote
        </button>
        <button
          type="button"
          className={`${classNamePrefix}__toolbar-button`}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        >
          Code
        </button>
        <button type="button" className={`${classNamePrefix}__toolbar-button`} onClick={onApplyLink}>
          Link
        </button>
        <label className={`${classNamePrefix}__toolbar-button ${classNamePrefix}__toolbar-upload`}>
          Image
          <input
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className={`${classNamePrefix}__file-input`}
          />
        </label>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
