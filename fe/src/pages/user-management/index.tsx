// src/pages/user-management/index.tsx

import { NextPage } from 'next';
import { ReactElement } from 'react';
import UserManagementModule from '@modules/user-management/module'; // Corrected import path

const UserManagementPage: NextPage = (): ReactElement => {
  return <UserManagementModule />;
};

export default UserManagementPage;