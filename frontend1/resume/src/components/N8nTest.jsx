import { useState, useRef, useEffect } from 'react';
import { getUserId } from '../lib/userIdManager';

// Direct webhook URLs (n8n cloud instance)
const WEBHOOK_PROD = 'https://identityforgestudio.app.n8n.cloud/webhook/a38ed656-03ad-43a5-ad5a-a9a4b6e9b7d9';

const DEFAULT_WEBHOOK = WEBHOOK_PROD;

export default function N8nTest() {
  const [resumeFile, setResumeFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [userId, setUserId] = useState('');
  
  const fileInputRef = useRef(null);
  const isUploadingRef = useRef(false);

  // Initialize userId on component mount
  useEffect(() => {
    const id = getUserId();
    setUserId(id);
  }, []);

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
      setResult(null);
      setError('');
    } else if (file) {
      setError('Please select a PDF file');
    }
    e.target.value = '';
  };

  const removeFile = () => {
    setResumeFile(null);
    setResult(null);
    setError('');
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSendToN8n = async () => {
    // Prevent double-clicks using ref
    if (isUploadingRef.current || isUploading) {
      console.log('Already uploading, ignoring duplicate click');
      return;
    }

    if (!resumeFile) {
      setError('Please upload a resume PDF');
      return;
    }

    // Set both ref and state to prevent double execution
    isUploadingRef.current = true;
    setIsUploading(true);
    setError('');
    console.log('=== STARTING N8N RESUME UPLOAD ===');

    let uploadSuccessful = false;

    try {
      const base64 = await fileToBase64(resumeFile);

      // Prepare payload
      const payload = {
        userId: userId,
        filename: resumeFile.name,
        mimetype: resumeFile.type || 'application/pdf',
        content_base64: base64.split(',')[1],
        timestamp: new Date().toISOString()
      };

      console.log('Sending request to n8n webhook directly...');

      const response = await fetch(WEBHOOK_PROD, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();
      console.log('Raw response text:', text);
      console.log('Content-Type:', contentType);
      
      let responseData;

      // Try to parse as JSON if content-type suggests it or if text looks like JSON
      if (text && text.trim().length > 0) {
        try {
          responseData = JSON.parse(text);
        } catch {
          // Not JSON, treat as plain text
          responseData = { raw: text, status: response.status };
        }
      } else {
        // Empty response - n8n workflow completed but returned nothing
        responseData = { 
          _synthetic: true,
          success: true, 
          message: 'n8n returned empty response (webhook executed successfully but no data returned)',
          status: response.status,
          note: 'This is a placeholder response created by the UI because n8n did not return any body'
        };
      }

      console.log('Parsed response data:', responseData);

      if (!response.ok) {
        console.error('Webhook error response:', responseData);
        const errorMsg = responseData.message || responseData.error || responseData.raw || `HTTP ${response.status}`;
        throw new Error(`Request failed: ${errorMsg}`);
      }

      uploadSuccessful = true;
      setResult(responseData);
      console.log('✅ Upload successful');
    } catch (error) {
      if (!uploadSuccessful) {
        console.error('Error uploading to n8n:', error);

        let errorMessage = 'Failed to upload resume. Please try again.';

        if (error instanceof Error && error.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again.';
        } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Unable to connect to the server.';
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        setError(errorMessage);
      }
    } finally {
      isUploadingRef.current = false;
      setIsUploading(false);
      console.log('=== N8N RESUME UPLOAD COMPLETE ===');
    }
  };

  return (
    <div className="upload-container">
      <h2>🧪 n8n Resume Webhook Test</h2>
      <p>Upload a resume PDF and send it to your n8n webhook to view the returned JSON.</p>

      {/* File Preview */}
      {resumeFile && (
        <div className="result" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4>📄 {resumeFile.name}</h4>
              <p style={{ fontSize: '12px', color: '#666' }}>
                {(resumeFile.size / 1024).toFixed(2)} KB • PDF
              </p>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="error"
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Control Panel */}
      <div className="upload-form" style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>Resume Upload</p>
            <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
              {!resumeFile && 'Upload a PDF to start'}
              {resumeFile && !isUploading && 'Ready to send to n8n webhook'}
              {isUploading && 'Uploading your resume...'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleAttachmentClick}
              disabled={isUploading}
              className="upload-button"
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                backgroundColor: resumeFile ? '#10b981' : '#1a1f27',
                opacity: isUploading ? 0.5 : 1
              }}
            >
              {resumeFile ? '✓ File Selected' : '📎 Choose PDF'}
            </button>
            <button
              type="button"
              onClick={handleSendToN8n}
              disabled={!resumeFile || isUploading}
              className="upload-button"
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                opacity: !resumeFile || isUploading ? 0.5 : 1
              }}
            >
              {isUploading ? 'Uploading...' : 'Send to n8n'}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Error Display */}
      {error && (
        <div className="error" style={{ marginTop: '16px' }}>
          {error}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="result" style={{ marginTop: '16px' }}>
          <h3>✅ Response from n8n</h3>
          <pre style={{ overflowX: 'auto', backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* Debug Info */}
      <div className="result" style={{ marginTop: '16px', fontSize: '11px', color: '#666' }}>
        <p><strong>Webhook:</strong> {WEBHOOK_PROD}</p>
        <p><strong>Mode:</strong> Production (webhook must be activated)</p>
        <p><strong>User ID:</strong> {userId}</p>
        <p><strong>Method:</strong> Direct CORS request</p>
      </div>
    </div>
  );
}
