import { Upload, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface CoverImageSectionProps {
  coverImage: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeCoverImage: () => void;
  saving: boolean;
}

export function CoverImageSection({
  coverImage,
  handleImageUpload,
  removeCoverImage,
  saving,
}: CoverImageSectionProps) {
  if (coverImage) {
    return (
      <div className="relative rounded-lg overflow-hidden border border-border">
        <Image
          src={coverImage}
          alt="Cover"
          width={1200}
          height={630}
          className="w-full h-64 object-cover"
        />
        <button
          onClick={removeCoverImage}
          className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"
          disabled={saving}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <label className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition cursor-pointer block">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
        disabled={saving}
      />
      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
      <p className="font-semibold">Upload cover image</p>
      <p className="text-sm text-muted-foreground">
        or drag and drop (Max 5MB)
      </p>
    </label>
  );
}

export function CoverImageSectionSkeleton() {
  return (
    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
      <Skeleton className="h-8 w-8 mx-auto" />
      <Skeleton className="h-5 w-40 mt-2" />
      <Skeleton className="h-4 w-48 mt-1" />
    </div>
  );
}
