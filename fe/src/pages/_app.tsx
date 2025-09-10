// src/pages/_app.tsx
"use client";

import "../styles/global.css"; // Adjust the import path to match your file structure
import type { AppProps } from "next/app";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";
import { RecoilEnv, RecoilRoot } from "recoil";
import { useState } from "react";
import dynamic from 'next/dynamic';

RecoilEnv.RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED = false; // This should be outside of the component

const NoSSRBrowserRouter = dynamic(
  () => import('react-router-dom').then(mod => mod.BrowserRouter),
  { ssr: false }
);

function App({ Component, pageProps }: AppProps) {
  // Initialize QueryClient with state to avoid re-instantiation on each render
  const [queryClient] = useState(() => new QueryClient());

  return (
    <NoSSRBrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <RecoilRoot>
            <Component {...pageProps} />
          </RecoilRoot>
        </Hydrate>
      </QueryClientProvider>
    </NoSSRBrowserRouter>
  );
}

export default App;
