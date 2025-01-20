import React, { useCallback, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

const RoboCheck: React.FC = () => {
  const [isComplete, setIsComplete] = useState(false);
  const secretPassword = "ReCAPTCHA_MASTER_2024";

  const handleCaptchaChange = useCallback((token: string | null) => {
    if (token) {
      setIsComplete(true);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Prove You're Human</h1>
      <p className="mb-8 text-center">
        Complete the CAPTCHA challenge to prove you're not a robot.
      </p>

      <ReCAPTCHA
        sitekey="6LdS4b0qAAAAAI3v27drnWbyQ21sMFoewqyF8UMQ"
        onChange={handleCaptchaChange}
      />

      {isComplete && (
        <div className="mt-8 p-4 bg-green-100 text-green-700 rounded-lg">
          <h2 className="text-lg font-bold">🎉 Congratulations!</h2>
          <p>You've successfully proven you're human.</p>
          <p className="mt-2">
            The secret password is: <strong>{secretPassword}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default RoboCheck;
