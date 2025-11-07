import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Category } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";

interface FormFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  excerpt: string;
  setExcerpt: (excerpt: string) => void;
  content: string;
  setContent: (content: string) => void;
  saving: boolean;
  allCategories: Category[];
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
}

export function FormFields({
  title,
  setTitle,
  excerpt,
  setExcerpt,
  content,
  setContent,
  saving,
  allCategories,
  selectedCategories,
  setSelectedCategories,
}: FormFieldsProps) {
  const handleCategoryChange = (categoryId: string) => {
    const newSelectedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    setSelectedCategories(newSelectedCategories);
  };

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

      {/* Categories */}
      <div>
        <label className="text-sm font-semibold mb-2 block">Categories</label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allCategories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => handleCategoryChange(category.id)}
                disabled={saving}
              />
              <label
                htmlFor={category.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {category.name}
              </label>
            </div>
          ))}
        </div>
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
