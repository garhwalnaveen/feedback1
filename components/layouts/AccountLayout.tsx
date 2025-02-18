import { Error, Loading, Navbar, Sidebar } from '@/components/ui';
import useTeams from 'hooks/useTeams';
import React from 'react';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isError, teams } = useTeams();

  if (isLoading || !teams) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  return (
    <>
      <Navbar />
      <div className="flex overflow-hidden pt-16">
        <Sidebar />
        <div className="relative w-full overflow-y-auto lg:ml-64">
          <main>
            <div className="flex justify-center">
              <div className="w-4/4 px-6 py-6" style={{ marginTop: "-40px" }}>
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}


