import React, { useState } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useSchemeStore } from './store/useSchemeStore';
import { useScriptLibraryStore } from './store/useScriptLibraryStore';
import { TopBar } from './components/layout/TopBar';
import { LeftNarrowBar } from './components/layout/LeftNarrowBar';
import { LeftWidePanel } from './components/layout/LeftWidePanel';
import { SchemeCanvas } from './components/canvas/SchemeCanvas';
import { AdminPanelModal } from './components/modals/AdminPanelModal';
import { AuthModal } from './components/modals/AuthModal';
import { UploadScriptModal } from './components/modals/UploadScriptModal';

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { isLeftPanelOpen } = useSchemeStore();
  const { isUploadModalOpen, setUploadModalOpen } = useScriptLibraryStore();

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top Header Navigation */}
      <TopBar onOpenAdmin={() => setIsAdminModalOpen(true)} />

      {/* Main Workspace Layout */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Left Narrow Icon Sidebar */}
        <LeftNarrowBar onOpenAdmin={() => setIsAdminModalOpen(true)} />

        {/* Left Expandable Wide Panel for Schemes & Script Library */}
        {isLeftPanelOpen && <LeftWidePanel />}

        {/* Main Central Interactive Canvas / Pipeline Editor */}
        <SchemeCanvas />
      </div>

      {/* Admin Panel Modal for User Management */}
      <AdminPanelModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} />

      {/* Upload Script Modal */}
      <UploadScriptModal isOpen={isUploadModalOpen} onClose={() => setUploadModalOpen(false)} />
    </div>
  );
}
