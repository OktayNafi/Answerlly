interface TopbarProps {
  title: string;
  aiActive?: boolean;
}

export default function Topbar({ title, aiActive = true }: TopbarProps) {
  return (
    <header className="h-14 border-b border-[var(--border)] flex items-center px-6 gap-4 flex-shrink-0 bg-[rgba(9,9,11,0.8)] backdrop-blur-xl">
      <h1 className="text-[15px] font-semibold tracking-tight">{title}</h1>
      <div className="flex-1" />
      {aiActive && (
        <div className="flex items-center gap-1.5 text-xs text-[var(--green)] bg-[var(--green-soft)] px-2.5 py-1 rounded-full font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
          AI Active
        </div>
      )}
    </header>
  );
}
