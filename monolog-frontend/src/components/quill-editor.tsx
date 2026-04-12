"use client";

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill-new');
    const { default: Quill } = await import('quill');
    const { default: QuillResizeImage } = await import('quill-resize-image');

    // Register the resize module globally (once)
    if (!Quill.imports['modules/resize']) {
      Quill.register('modules/resize', QuillResizeImage);
    }

    return RQ;
  },
  {
    ssr: false,
    loading: () => <div className="h-[400px] w-full animate-pulse bg-white/5 rounded-2xl" />,
  }
);

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function QuillEditor({ value, onChange, placeholder }: QuillEditorProps) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'blockquote', 'code-block', 'image'],
      ['clean'],
    ],
    clipboard: {
      matchVisual: false,
    },
    resize: {
      locale: {},
    },
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'blockquote', 'code-block', 'image',
    'width', 'height', 'style',
  ];

  return (
    <div className="quill-editor-wrapper relative h-full flex flex-col">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}
