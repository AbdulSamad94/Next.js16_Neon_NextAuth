interface ErrorDisplayProps {
  title: string;
  message: string;
  onGoHome: () => void;
}

export function ErrorDisplay({ title, message, onGoHome }: ErrorDisplayProps) {
  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-muted-foreground mt-2">{message}</p>
      <button
        onClick={onGoHome}
        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
      >
        Go Home
      </button>
    </div>
  );
}
