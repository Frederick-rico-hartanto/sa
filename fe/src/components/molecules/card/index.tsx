import React from 'react';
import { useRouter } from 'next/router';

interface UserCardProps {
  user: { _id: string; username: string; role: string };
  onEdit?: (updatedUserData: Partial<UserCardProps['user']>) => void; // Make onEdit optional
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const router = useRouter();

  const handleEditClick = () => {
    // Navigate to the edit user page with the user ID as a query parameter
    router.push(`/edit-user/${user._id}`);
  };
  

  return (
    <div className="border p-4 rounded-lg bg-white shadow-lg flex flex-col items-center">
      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-4">
        <span className="text-3xl text-gray-500">👤</span>
      </div>
      <h2 className="text-lg font-bold mb-1 font-roboto">{user.username}</h2>
      <p className="text-gray-600 mb-4 font-roboto">Role: {user.role}</p>
      <button
        onClick={handleEditClick}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded transition font-roboto"
      >
        Edit
      </button>
    </div>
  );
};

export default UserCard;
