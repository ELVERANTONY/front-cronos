import React from 'react';
import AdminSidebar from './AdminSidebar';
import CreationToast from './CreationToast';
import { useCharacterCreation } from '../../hooks/useCharacterCreation';

const AdminLayout = ({ children }) => {
    const { isCreating, isSuccess, progress, statusMessage, characterName } = useCharacterCreation();

    return (
        <div className="flex h-screen bg-[#0B0E1E] text-white overflow-hidden">
            {/* Sidebar - Flex Item */}
            <AdminSidebar />

            {/* Main Content Area - Flex Grow */}
            <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative">
                {children}
            </main>

            {/* Global Creation Toast */}
            <CreationToast
                isVisible={isCreating}
                isSuccess={isSuccess}
                progress={progress}
                statusMessage={statusMessage}
                characterName={characterName}
            />
        </div>
    );
};

export default AdminLayout;
