
import orderSuccessImg from "../assets/util/order-confirmed.png";
import { useEffect, useState } from "react";
import PageTitle from "./PageTitle";
import { Link } from "react-router-dom";

//  afficher le numéro de commande
export default function OrderSuccess() {
  const [orderId, setOrderId] = useState<number | null>(null);
  
  useEffect(() => {
    // Récupérer l'orderId depuis l'URL ou le contexte
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('orderId');
    if (id) setOrderId(parseInt(id));
  }, []);
  
  return (
    <div className="min-h-[852px] py-12 sm:pt-20 font-primary bg-normalbg dark:bg-darkbg">
      <div className="max-w-4xl mx-auto px-4">
        <PageTitle title="Super! Commande passée avec succès" />
      </div>
      <div className="text-center text-lg text-gray-600 dark:text-lighter flex flex-col items-center">
        <p className="max-w-[576px] text-center px-4 mx-auto leading-6 mb-6">
          Votre commande a été passée avec succès. Les articles commandés seront livrés sous 48 heures.
        </p>
        
        {/* Afficher le numéro de commande */}
        {orderId && (
          <p className="text-lg font-semibold text-primary dark:text-light mb-4">
            Commande #: {orderId}
          </p>
        )}
        
        <img
          src={orderSuccessImg}
          alt="Order Success"
          className="w-full max-w-[450px] mx-auto mb-8"
        />
        
        <Link
          to="/home"
          className="px-6 py-3 text-white dark:text-black text-xl rounded-md transition duration-200 bg-primary dark:bg-light hover:bg-dark dark:hover:bg-lighter"
        >
          Continuer vos achats
        </Link>
      </div>
    </div>
  );
}