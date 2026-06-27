/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AdminPortalModal.tsx - Delegate wrapper for AdminPanel
 */

import React from "react";
import AdminPanel from "./AdminPanel";

interface AdminPortalModalProps {
  currentLang: "en" | "ar";
  onClose: () => void;
}

export default function AdminPortalModal({ currentLang, onClose }: AdminPortalModalProps) {
  return (
    <AdminPanel currentLang={currentLang} onClose={onClose} isModal={true} />
  );
}
