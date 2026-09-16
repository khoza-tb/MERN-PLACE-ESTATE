
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { FaGoogle } from "react-icons/fa";
import { auth } from "../Firebase";

import { useDispatch } from "react-redux";

import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";

import { useNavigate } from "react-router-dom";

function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    try {
      dispatch(signInStart());

      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      console.log("Starting Google sign-in...");

      const result = await signInWithPopup(auth, provider);

      console.log("Firebase Google user:", result.user);

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

      const data = await res.json();

      console.log("Backend Google response:", data);

      if (!res.ok || data.success === false) {
        dispatch(
          signInFailure(
            data.message || "Google sign-in failed"
          )
        );
        return;
      }

      dispatch(signInSuccess(data));

      navigate("/");
    } catch (error) {
      console.error("Google sign-in error:", error);

      dispatch(
        signInFailure(
          error.message || "Could not sign in with Google"
        )
      );
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

export default OAuth;
