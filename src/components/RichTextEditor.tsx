import { Editor } from '@tinymce/tinymce-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: number;
}

async function uploadEditorImage(file: Blob) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.url) {
    throw new Error(data.error || 'Image upload failed');
  }

  return data.url as string;
}

export function RichTextEditor({ value, onChange, height = 620 }: RichTextEditorProps) {
  return (
    <Editor
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      licenseKey="gpl"
      value={value}
      onEditorChange={onChange}
      init={{
        height,
        menubar: 'file edit view insert format tools table help',
        plugins: [
          'advlist',
          'anchor',
          'autolink',
          'autosave',
          'charmap',
          'code',
          'codesample',
          'directionality',
          'emoticons',
          'fullscreen',
          'help',
          'image',
          'insertdatetime',
          'link',
          'lists',
          'media',
          'nonbreaking',
          'pagebreak',
          'preview',
          'quickbars',
          'searchreplace',
          'table',
          'visualblocks',
          'visualchars',
          'wordcount',
          'autoresize',
        ],
        toolbar: [
          'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify',
          'bullist numlist outdent indent | blockquote table link image media codesample emoticons charmap | removeformat searchreplace',
          'preview fullscreen code visualblocks pagebreak | ltr rtl',
        ],
        toolbar_sticky: true,
        toolbar_sticky_offset: 72,
        autosave_ask_before_unload: true,
        autosave_interval: '30s',
        autosave_restore_when_empty: true,
        image_advtab: true,
        image_caption: true,
        image_title: true,
        link_assume_external_targets: true,
        link_default_protocol: 'https',
        paste_data_images: true,
        automatic_uploads: true,
        file_picker_types: 'image',
        images_upload_handler: async (blobInfo) => uploadEditorImage(blobInfo.blob()),
        file_picker_callback: (callback, _value, meta) => {
          if (meta.filetype !== 'image') {
            return;
          }

          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';

          input.addEventListener('change', async () => {
            const file = input.files?.[0];
            if (!file) {
              return;
            }

            try {
              const imageUrl = await uploadEditorImage(file);
              callback(imageUrl, { title: file.name });
            } catch (error) {
              console.error(error);
            }
          });

          input.click();
        },
        contextmenu: 'link image table',
        quickbars_selection_toolbar: 'bold italic underline | blocks | forecolor backcolor | quicklink blockquote',
        quickbars_insert_toolbar: 'image media table codesample hr',
        branding: false,
        promotion: false,
        browser_spellcheck: true,
        convert_urls: false,
        content_style:
          'body { font-family: Georgia, Cambria, "Times New Roman", Times, serif; font-size: 16px; line-height: 1.7; color: #111827; max-width: 900px; margin: 0 auto; padding: 1rem; } img { max-width: 100%; height: auto; border-radius: 0.5rem; } blockquote { border-left: 4px solid #2563eb; margin: 1.5rem 0; padding: 0.75rem 1rem; color: #374151; background: #eff6ff; } pre { background: #111827; color: #f9fafb; padding: 1rem; border-radius: 0.75rem; overflow: auto; } table { border-collapse: collapse; width: 100%; } table td, table th { border: 1px solid #d1d5db; padding: 0.75rem; }',
      }}
    />
  );
}
