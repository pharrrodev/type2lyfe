import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import axios from 'axios';

interface GoogleOAuthButtonProps {
  onSuccess: (token: string, user: any) => void;
  onError: (error: string) => void;
  buttonText?: string;
}

const GoogleOAuthButton: React.FC<GoogleOAuthButtonProps> = ({
  onSuccess,
  onError,
  buttonText = 'Sign in with Google',
}) => {
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        onError('No credential received from Google');
        return;
      }

      // Send the Google credential to our backend
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await axios.post(`${apiUrl}/auth/google`, {
        credential: credentialResponse.credential,
      });

      // Extract token and user from response
      const { token, user } = response.data;

      // Call the success callback
      onSuccess(token, user);
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      const errorMessage = error.response?.data?.error || 'Google authentication failed. Please try again.';
      onError(errorMessage);
    }
  };

  const handleGoogleError = () => {
    onError('Google authentication was cancelled or failed. Please try again.');
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={false}
        theme="outline"
        size="large"
        text="signin_with"
        shape="rectangular"
        logo_alignment="left"
        width="100%"
      />
    </div>
  );
};

export default GoogleOAuthButton;

