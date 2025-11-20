/**
 * Hook React : useImageExists
 * 
 * Permet de savoir si une image existe ou non.
 * Retourne :
 *  - `null` : en cours de vérification
 *  - `true` : l'image existe
 *  - `false` : l'image est introuvable → affichage fallback possible
 * 
 * @location src/shared/hooks/useImageExists.ts
 */

import { useEffect, useState } from "react";
import { preloadImage } from "../constants/images";

export const useImageExists = (src: string | null | undefined): boolean | null => {
  const [exists, setExists] = useState<boolean | null>(null);

  useEffect(() => {
    if (!src) {
      setExists(false);
      return;
    }

    const controller = new AbortController();

    preloadImage(src, controller.signal)
      .then(() => setExists(true))
      .catch(() => setExists(false));

    return () => controller.abort(); // évite les fuites mémoire
  }, [src]);

  return exists;
};
