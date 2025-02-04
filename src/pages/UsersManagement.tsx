import React, { useState } from 'react';
import { useAuthStore } from '../lib/store';
import { UserPlus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import { mockUsers } from '../lib/mockData';

// ... (keep existing imports and interfaces)

export default function UsersManagement() {
  // ... (keep existing state and other code)
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleDelete = (user: User) => {
    setUserToDelete(user);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setUserToDelete(null);
    }
  };

  // ... (keep existing code until return statement)

  return (
    <div className="space-y-6">
      {/* ... (keep existing JSX) */}

      <ConfirmationModal
        isOpen={userToDelete !== null}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDelete}
        title="Supprimer l'utilisateur"
        message={`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userToDelete?.full_name}" ? Cette action est irréversible et supprimera également tous les accès associés.`}
      />
    </div>
  );
}