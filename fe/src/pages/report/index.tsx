// src/pages/report/index.tsx

import { NextPage } from 'next';
import { ReactElement } from 'react';
import ReportModule from '@modules/report/module'; // Corrected import path

const ReportPage: NextPage = (): ReactElement => {
  return <ReportModule />;
};

export default ReportPage;