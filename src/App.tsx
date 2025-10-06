import Footer from "./components/footer/Footer";
import Header from "./components/Header";
import { Outlet } from "react-router-dom";
import { useNavigation } from "react-router-dom";

function App() {
  // 🚦 Hook useNavigation : surveille l'état de navigation de React Router
  // États possibles : "idle" (repos), "loading" (chargement), "submitting" (soumission de formulaire)
  // Très utile pour afficher des indicateurs de chargement lors des transitions entre routes
  const navigation = useNavigation();

  return (
    <>
      {/* 🎯 Header : barre de navigation fixe, toujours visible */}
      <Header />

      {/* 🔄 Chargement conditionnel basé sur l'état de navigation */}
      {navigation.state === "loading" ? (
        // 📦 Écran de chargement : affiché pendant que React Router charge une nouvelle route
        // min-h-[852px] : hauteur minimale pour éviter le "jump" visuel pendant le chargement
        // Ce chiffre devrait correspondre approximativement à la hauteur moyenne de vos pages
        <div className="flex items-center justify-center min-h-[852px]">
          <span className="text-4xl font-semibold text-primary dark:text-light">
            Loading...
          </span>
        </div>
      ) : (
        // 🎪 Outlet : point d'insertion pour les composants enfants (routes imbriquées)
        // C'est ici que Home, About, Contact, Login, etc. seront rendus
        // React Router remplace automatiquement le contenu de <Outlet /> selon la route active
        <Outlet />
      )}

      {/* 🦶 Footer : pied de page, toujours visible */}
      <Footer />
    </>
  );
}

export default App;