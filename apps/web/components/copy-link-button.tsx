'use client';

import { Copy } from 'lucide-react';
import { toast } from 'sonner';

export function CopyLinkButton({ url }: { url: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(url);
        toast.success('Link copied');
      }}
      className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border px-3 text-[12px] text-fg hover:border-border-strong"
    >
      <Copy size={13} /> Copy link
    </button>
  );
}
