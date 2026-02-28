import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";

import { DetailModal } from "@/components/profile/tabs/skill/components/DetailModal";

type Props = {
  children: React.ReactNode;
  modalData: any;
  active: boolean;
  onToggle: (next: boolean) => void;
  isTripodOrRune?: boolean;
};

// Wrap an icon and show a tooltip modal on hover/click.
export function IconWithModal({
  children,
  modalData,
  active,
  onToggle,
  isTripodOrRune = false,
}: Props) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    setRect(e.currentTarget.getBoundingClientRect());
    onToggle(!active);
  };

  return (
    <div
      className="relative flex items-center justify-center cursor-help"
      onMouseEnter={(e) => {
        setRect(e.currentTarget.getBoundingClientRect());
        onToggle(true);
      }}
      onMouseLeave={() => onToggle(false)}
      onClick={handleInteraction}
    >
      <div className="transition-transform hover:scale-110 active:scale-95 flex items-center justify-center">
        {children}
      </div>
      <AnimatePresence>
        {active && modalData && (
          <DetailModal {...modalData} anchorRect={rect} isTripodOrRune={isTripodOrRune} />
        )}
      </AnimatePresence>
    </div>
  );
}

