import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader'; // Make sure this import is correct

const Test = (props) => {
  const [data, setData] = useState('No result');
  const [error, setError] = useState(null);

  const handleResult = (result, error) => {
    if (result) {
      setData(result?.text || 'No text data'); // Safely handle result
    }

    if (error) {
      console.error(error); // Log error for debugging
      setError(error.message || 'An error occurred');
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <QrReader
        onResult={handleResult}
        style={{ width: '100%' }}
        constraints={{ facingMode: 'environment' }} // Use back camera by default
      />
      <p>{data}</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Test;
