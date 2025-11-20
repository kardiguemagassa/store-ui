import { Link } from 'react-router-dom';

interface EmptyCartProps {
  message?: string;
  buttonText?: string;
  buttonLink?: string;
}

export default function EmptyCart({
  message = "Oups... Votre panier est vide. Continuer vos achats",
  buttonText = "Retour aux produits",
  buttonLink = "/home"
}: EmptyCartProps) {
  
  const buttonClass = `
    py-2 
    px-4 
    text-xl 
    font-semibold 
    rounded-sm 
    flex 
    justify-center 
    items-center 
    transition 
    bg-primary 
    dark:bg-light 
    text-white 
    dark:text-black 
    hover:bg-dark 
    dark:hover:bg-lighter
  `.trim();

  return (
    <div className="text-center text-gray-600 dark:text-lighter flex flex-col items-center py-12">
      
      
      <div className="text-9xl mb-8">🛒</div>
      
        {/* MESSAGE */}
        <p className="max-w-[576px] px-2 mx-auto text-lg mb-6">{message}</p>
        
        {/* BOUTON RETOUR */}
        <Link to={buttonLink} className={buttonClass}>{buttonText}</Link>
    </div>
  );
}