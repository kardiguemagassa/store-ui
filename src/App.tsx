import Footer from "./shared/components/Footer";

import { Outlet } from "react-router-dom";
import { useNavigation } from "react-router-dom";
import Header from "./shared/components/Header";

function App() {

  const navigation = useNavigation();

  return (
    <>
      <Header />
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