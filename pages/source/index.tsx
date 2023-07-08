import { useState, useEffect } from 'react';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import UploadCSV from './csvupload';
import { useSession } from 'next-auth/react';

const Source = () => {
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { data: session, status } = useSession(); // Move useSession hook inside the component

  useEffect(() => {
    // You can perform any session-related logic here
    // For example, check if the user is authenticated or redirect if not
    if (status === 'loading') {
      // Session status is loading, you can show a loading spinner or skeleton UI
    } else if (!session) {
      // User is not authenticated, handle the logic accordingly
    } else {
      // User is authenticated, continue with the component logic
    }
  }, [status, session]);

  const handleFileUpload = async (file: File) => {
    setUploadStatus('uploading');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json(); // Extract error data from response body, if any
        const errorMessage = errorData?.error || 'Failed to upload feedback'; // Use error from server or fallback to default
        throw new Error(errorMessage);
      }

      setUploadStatus('success');
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="flex gap-7">
      <UploadCSV onFileUpload={handleFileUpload} />
      {uploadStatus === 'uploading' && <p>Uploading feedback...</p>}
      {uploadStatus === 'success' && <p>Feedback uploaded successfully!</p>}
      {uploadStatus === 'error' && <p>Error: {errorMessage}</p>}
    </div>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const { locale }: GetServerSidePropsContext = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

export default Source;








