import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { logger } from '../../../shared/types/errors.types';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    logger.debug("Affichage de la page de succès de commande", "OrderSuccess", {
      orderId,
      hasOrderId: !!orderId
    });

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          logger.debug("Redirection automatique vers les commandes", "OrderSuccess", { orderId });
          window.location.href = '/orders';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      logger.debug("Nettoyage du timer de redirection", "OrderSuccess");
      clearInterval(timer);
    };
  }, [orderId]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 text-center">
        
        {/* Emoji au lieu d'image */}
        <div className="text-9xl mb-8">
          🎉
        </div>

        <h1 className="text-4xl font-bold text-green-600 dark:text-green-400 mb-4">
          Commande confirmée !
        </h1>

        <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
          Merci pour votre achat
        </p>

        {orderId && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-8">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Numéro de commande
            </p>
            <p className="text-2xl font-mono font-bold text-green-700 dark:text-green-400">
              #{orderId}
            </p>
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8 text-left">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            📧 Confirmation envoyée
          </h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Un email de confirmation a été envoyé à votre adresse</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Vous pouvez suivre votre commande dans votre espace client</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Livraison estimée sous 3-5 jours ouvrables</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/orders"
            className="px-8 py-3 bg-primary dark:bg-light text-white dark:text-black rounded-lg font-semibold hover:bg-dark dark:hover:bg-lighter transition"
            onClick={() => logger.debug("Clic sur 'Voir mes commandes'", "OrderSuccess", { orderId })}
          >
            Voir mes commandes
          </Link>
          <Link
            to="/home"
            className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            onClick={() => logger.debug("Clic sur 'Continuer mes achats'", "OrderSuccess", { orderId })}
          >
            Continuer mes achats
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          Redirection automatique vers vos commandes dans {countdown}s...
        </p>
      </div>
    </div>
  );
}