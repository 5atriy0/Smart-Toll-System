import { Inbox } from 'lucide-react';

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 text-muted-foreground">
        {icon || <Inbox className="w-8 h-8" />}
      </div>
      <h3 className="text-base font-medium text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-xs">{description}</p>}
    </div>
  );
}
