/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AdminPortalModal.tsx - Delegate wrapper for AdminPanel
 */

import React, { Suspense } from "react";
import { lazyWithRetry } from "../lib/lazyWithRetry";

const AdminPanel = lazyWithRetry(() => import("./AdminPanel"));

interface AdminPortalModalProps {
  currentLang: "en" | "ar";
  onClose: () => void;
}

export default function AdminPortalModal({ currentLang, onClose }: AdminPortalModalProps) {
  return (
    <Suspense fallback={null}>
      <AdminPanel currentLang={currentLang} onClose={onClose} isModal={true} />
    </Suspense>
  );
}
