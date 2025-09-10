// src/pages/add-user/index.tsx

import { NextPage } from 'next';
import { ReactElement } from 'react';
import AddUserModule from '@modules/adduser/module'; // Corrected import path

const AddUserPage: NextPage = (): ReactElement => {
  return <AddUserModule />;
};

export default AddUserPage;
