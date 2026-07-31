export function ErrorCard({
  title = "This page didn't load",
  description = "Something went wrong on our end. You can try refreshing or head back home.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#fafafa] p-6 text-[#111]">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-2 text-xl font-semibold">{title}</h1>
        <p className="mb-6 text-[#4b5563]">{description}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="rounded-md border border-transparent bg-[#111] px-4 py-2 text-white"
            >
              Try again
            </button>
          )}
          <a href="/" className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-[#111]">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}