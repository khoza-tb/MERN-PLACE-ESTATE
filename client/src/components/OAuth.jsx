import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
} from "firebase/auth";

import { FaGoogle } from "react-icons/fa";
import { app } from "../Firebase";

import { useDispatch } from "react-redux";

import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";

import { useNavigate } from "react-router-dom";

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    try {
      dispatch(signInStart());

      // Firebase Google authentication
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      const result = await signInWithPopup(auth, provider);

      console.log("Firebase Google user:", result.user);

      // Send Google user information to backend
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        }),
      });

      // Read response as text first
      const responseText = await res.text();

      console.log("Backend status:", res.status);
      console.log("Backend response:", responseText);

      // Handle failed request
      if (!res.ok) {
        dispatch(
          signInFailure(
            responseText || `Google login failed (${res.status})`
          )
        );

        return;
      }

      // Make sure backend actually returned something
      if (!responseText) {
        dispatch(
          signInFailure("Backend returned an empty response")
        );

        return;
      }

      // Convert response to JSON
      const data = JSON.parse(responseText);

      console.log("Google login data:", data);

      dispatch(signInSuccess(data));

      navigate("/");
    } catch (error) {
      console.error(
        "Could not sign in with Google:",
        error
      );

      dispatch(signInFailure(error.message));
    }
  };

  return (
    <button
      onClick={handleGoogleClick}
      type="button"
      className="bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-95 w-full transition-opacity"
    >
      <FaGoogle className="inline mr-2" />
      Continue with Google
    </button>
  );
}