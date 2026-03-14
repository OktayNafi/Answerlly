import Topbar from "@/components/layout/topbar";

export default function HelpPage() {
  return (
    <>
      <Topbar title="Help & Docs" />
      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-3xl">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 mb-4">
          <h3 className="font-semibold mb-2">Getting Started</h3>
          <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed">
            Answerly works by forwarding your existing business phone calls to
            an AI-powered number. The AI answers on your behalf, collects caller
            information, and logs everything to your dashboard.
          </p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 mb-4">
          <h3 className="font-semibold mb-2">Setting Up Call Forwarding</h3>
          <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed">
            Contact your phone provider and request unconditional call forwarding
            (or busy/no-answer forwarding) to your Answerly number. Most
            providers allow you to set this up by dialling a code from your
            handset.
          </p>
          <code className="block mt-3 text-xs font-mono text-[var(--accent-text)] bg-[var(--bg-tertiary)] px-3.5 py-2.5 rounded-md border border-[var(--border)]">
            *21*[your-answerly-number]#
          </code>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 mb-4">
          <h3 className="font-semibold mb-2">Understanding Call Statuses</h3>
          <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed">
            <strong>Completed</strong> — The AI answered and had a conversation
            with the caller.
            <br />
            <strong>Missed</strong> — The call could not be answered.
            <br />
            <strong>In Progress</strong> — A call is currently active.
            <br />
            Urgency levels (low, medium, high) are determined by the AI based on
            the caller&apos;s language and intent.
          </p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="font-semibold mb-2">Need Help?</h3>
          <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed">
            Email us at{" "}
            <span className="text-[var(--accent-text)]">
              support@answerly.com
            </span>{" "}
            or use the in-app chat. We typically respond within an hour during
            business hours.
          </p>
        </div>
      </div>
    </>
  );
}
