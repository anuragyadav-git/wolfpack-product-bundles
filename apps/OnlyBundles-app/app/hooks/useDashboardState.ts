import { useCallback, useState } from "react";

interface DeleteModalState {
  isOpen: boolean;
  bundleId: string | null;
}

export function useDashboardState() {
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    bundleId: null,
  });

  const openDeleteModal = useCallback((bundleId: string) => {
    setDeleteModal({ isOpen: true, bundleId });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModal({ isOpen: false, bundleId: null });
  }, []);

  return {
    deleteModalOpen: deleteModal.isOpen,
    bundleToDelete: deleteModal.bundleId,
    openDeleteModal,
    closeDeleteModal,
  };
}
