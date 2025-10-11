import Footer from "./components/footer/Footer";
import Header from "./components/Header";
import { Outlet } from "react-router-dom";
import { useNavigation } from "react-router-dom";

function App() {

  /*
    Hook useNavigation : surveille l'état de navigation de React Router
    États possibles : "idle" (repos), "loading" (chargement), "submitting" (soumission de formulaire)
    Très utile pour afficher des indicateurs de chargement lors des transitions entre routes
  */ 
  const navigation = useNavigation();

  return (
    <>
      <Header />

      {/* Chargement conditionnel basé sur l'état de navigation */}
      {navigation.state === "loading" ? (
        <div className="flex items-center justify-center min-h-[852px]">
          <span className="text-4xl font-semibold text-primary dark:text-light">
            Loading...
          </span>
        </div>
      ) : (
        <Outlet />
      )}

      <Footer />
    </>
  );
}

export default App;