import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/RichTextEditor";

interface FormFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  excerpt: string;
  setExcerpt: (excerpt: string) => void;
  tags: string;
  setTags: (tags: string) => void;
  content: string;
  setContent: (content: string) => void;
  saving: boolean;
}

export function FormFields({
  title,
  setTitle,
  excerpt,
  setExcerpt,
  tags,
  setTags,
  content,
  setContent,
  saving,
}: FormFieldsProps) {
  return (
    <>
      {/* Title */}
      <div>
        <label className="text-sm font-semibold mb-2 block">
          Title <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="Enter blog title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg"
          maxLength={200}
          disabled={saving}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {title.length}/200 characters
        </p>
      </div>

      {/* Excerpt */}
      <div>
        <label className="text-sm font-semibold mb-2 block">
          Excerpt (Optional)
        </label>
        <Textarea
          placeholder="Brief summary of your blog..."
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          maxLength={500}
          disabled={saving}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {excerpt.length}/500 characters
        </p>
      </div>

      {/* Tags */}
      <div>
        <label className="text-sm font-semibold mb-2 block">Tags</label>
        <Input
          placeholder="Add tags separated by commas"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          disabled={saving}
        />
      </div>

      {/* Content Editor */}
      <div>
        <label className="text-sm font-semibold mb-2 block">
          Content <span className="text-red-500">*</span>
        </label>
        <RichTextEditor
          content={content}
          onChange={setContent}
          disabled={saving}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {content.length} characters (minimum 50 required)
        </p>
      </div>
    </>
  );
}
