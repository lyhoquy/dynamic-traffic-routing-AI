import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { ChatPanel } from '../chat/ChatPanel';

/**
 * Layout chính:
 * ┌──────────┬─────────────────────────────┬──────────┐
 * │          │                             │          │
 * │ Sidebar  │       Map / Content         │   Chat   │
 * │  (nav)   │       (children)            │  Panel   │
 * │          │                             │          │
 * └──────────┴─────────────────────────────┴──────────┘
 */
export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
      <ChatPanel />
    </div>
  );
}
