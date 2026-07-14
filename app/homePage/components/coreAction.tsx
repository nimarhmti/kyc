const actions = ["Send", "Receive", "Swap", "More"];

export default function CoreActions() {
  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      {actions.map((action) => (
        <button key={action} className="flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            💳
          </div>

          <span className="text-sm font-medium">{action}</span>
        </button>
      ))}
    </div>
  );
}
