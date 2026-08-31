export default function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-brand-900">{title}</h1>
        {description && <p className="text-sm text-brand-400 mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}
