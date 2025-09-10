// src/pages/dashboard/index.tsx

import { NextPage } from 'next';
import { ReactElement } from 'react';
import DashboardModule from '@modules/dashbaord/module'; // Corrected import path

const DashboardPage: NextPage = (): ReactElement => {
  return <DashboardModule />;
};

export default DashboardPage;
