import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ActionButtonsProps {
  handleSaveDraft: () => void;
  handleUpdate: () => void;
  saving: boolean;
}

export function ActionButtons({
  handleSaveDraft,
  handleUpdate,
  saving,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-3 justify-end pt-6 border-t border-border">
      <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
        {saving ? (
          <>
            <Skeleton className="w-4 h-4 mr-2" />
            Saving...
          </>
        ) : (
          "Save Draft"
        )}
      </Button>
      <Button onClick={handleUpdate} disabled={saving}>
        {saving ? (
          <>
            <Skeleton className="w-4 h-4 mr-2" />
            Publishing...
          </>
        ) : (
          "Update Blog"
        )}
      </Button>
    </div>
  );
}
