import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface EditBlogHeaderProps {
  title: string;
  preview: boolean;
  setPreview: (preview: boolean) => void;
  saving: boolean;
}

export function EditBlogHeader({
  title,
  preview,
  setPreview,
  saving,
}: EditBlogHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-2">Update your blog post</p>
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setPreview(!preview)}
          className="gap-2"
          disabled={saving}
        >
          {preview ? (
            <>
              <EyeOff className="w-4 h-4" />
              Edit
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Preview
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
