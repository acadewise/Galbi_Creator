import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthProps {
  onSuccess?: () => void;
}

export default function Auth({ onSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="w-full max-w-md mx-auto py-10">
      {isLogin ? (
        <LoginForm 
          onSuccess={onSuccess}
          onRegisterClick={() => setIsLogin(false)}
        />
      ) : (
        <RegisterForm 
          onSuccess={onSuccess}
          onLoginClick={() => setIsLogin(true)}
        />
      )}
    </div>
  );
}