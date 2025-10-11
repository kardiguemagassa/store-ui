import { useEffect, useRef } from "react";
import PageTitle from "./PageTitle";
import {
  Link,
  Form,
  useActionData,
  useNavigation,
  useNavigate,
} from "react-router-dom";
import { toast } from "react-toastify";
import { useAppDispatch } from "../hooks/redux"; 
import { loginSuccess } from "../store/authSlice";
import type { LoginResponse } from "../types/auth";

export default function Login() {
  const actionData = useActionData() as LoginResponse | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // useRef pour éviter de traiter actionData plusieurs fois
  const hasProcessedLogin = useRef(false);

  useEffect(() => {
    if (!actionData || hasProcessedLogin.current) return;

    if (actionData.success) {
      if (actionData.jwtToken && actionData.user) {
        hasProcessedLogin.current = true;
        
        //REDUX envoyer des actions pour modifier l’état
        dispatch(loginSuccess({ 
          jwtToken: actionData.jwtToken, 
          user: actionData.user 
        }));
        
        const from = sessionStorage.getItem("redirectPath") || "/home";
        sessionStorage.removeItem("redirectPath");
        
        toast.success("Connexion réussie!");
        navigate(from, { replace: true });
      }
    } else if (actionData.errors) {
      hasProcessedLogin.current = true;
      toast.error(actionData.errors.message || "La connexion a échoué.");
    }
  }, [actionData, dispatch, navigate]);

  useEffect(() => {
    if (isSubmitting) {
      hasProcessedLogin.current = false;
    }
  }, [isSubmitting]);

  const labelStyle =
    "block text-lg font-semibold text-primary dark:text-light mb-2";
  const textFieldStyle =
    "w-full px-4 py-2 text-base border rounded-md transition border-primary dark:border-light focus:ring focus:ring-dark dark:focus:ring-lighter focus:outline-none text-gray-800 dark:text-lighter bg-white dark:bg-gray-600 placeholder-gray-400 dark:placeholder-gray-300";

  return (
    <div className="min-h-[852px] flex items-center justify-center font-primary dark:bg-darkbg">
      <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg max-w-md w-full px-8 py-6">
        <PageTitle title="Se connecter" />
        
        <Form method="POST" className="space-y-6">
          <div>
            <label htmlFor="username" className={labelStyle}>
              Nom d'utilisateur
            </label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="Votre nom d'utilisateur"
              autoComplete="username"
              required
              className={textFieldStyle}
            />
          </div>
          <div>
            <label htmlFor="password" className={labelStyle}>
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Votre mot de passe"
              autoComplete="current-password"
              required
              minLength={4}
              maxLength={20}
              className={textFieldStyle}
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-2 text-white dark:text-black text-xl rounded-md transition duration-200 bg-primary dark:bg-light hover:bg-dark dark:hover:bg-lighter disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Authenticating..." : "Se connecter"}
            </button>
          </div>
        </Form>

        {/* Register Link */}
        <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
          Vous n'avez pas de compte ?{" "}
          <Link
            to="/register"
            className="text-primary dark:text-light hover:text-dark dark:hover:text-primary transition duration-200"
          >
            Inscrivez-vous ici
          </Link>
        </p>
      </div>
    </div>
  );
}