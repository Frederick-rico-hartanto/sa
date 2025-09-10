// src/pages/History/index.tsx

import { NextPage } from 'next';
import { ReactElement } from 'react';
import HistoryModule from '@modules/history/module'; // Corrected import path

const HistoryPage: NextPage = (): ReactElement => {
  return <HistoryModule />;
};

export default HistoryPage;
