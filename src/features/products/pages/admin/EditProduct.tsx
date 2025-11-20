import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../../../../shared/api/apiClient";
import { 
  type ProductFormState, 
  type Category, 
  type Product,
  type ProductUpdateData,
  formStateToUpdateData
} from "../../types/product.types";
import { getErrorMessage, logger } from "../../../../shared/types/errors.types";

export default function EditProduct() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // État formulaire avec ProductFormState
  const [formData, setFormData] = useState<ProductFormState>({
    name: "",
    description: "",
    price: 0,
    stockQuantity: 0,
    categoryId: 0,
    sku: "",
    imageUrl: "",
    galleryImages: [],
    isActive: true
  });

  // VALIDATION PROFESSIONNELLE
  const isValidUrl = (urlString: string): boolean => {
    if (!urlString.trim()) return true; // Champ vide = valide
    
    try {
      // Accepte les URLs absolues et relatives
      if (urlString.startsWith('/') || urlString.startsWith('./')) {
        return true;
      }
      
      // Validation des URLs complètes
      const url = new URL(urlString);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  // Type spécifique pour validateField
  const validateField = (name: keyof ProductFormState, value: unknown): string => {
    switch (name) {
      case 'name':
        if (typeof value !== 'string' || !value.trim()) return "Le nom du produit est obligatoire";
        if (value.trim().length < 2) return "Le nom doit contenir au moins 2 caractères";
        return '';
      
      case 'categoryId':
        if (typeof value !== 'number' || !value || value === 0) return "Veuillez sélectionner une catégorie";
        return '';
      
      case 'price':
        if (typeof value !== 'number' || !value || value <= 0) return "Le prix doit être supérieur à 0";
        if (value > 10000) return "Le prix ne peut pas dépasser 10 000€";
        return '';
      
      case 'stockQuantity':
        if (typeof value !== 'number' || value < 0) return "La quantité en stock ne peut pas être négative";
        if (value > 1000000) return "La quantité en stock est trop élevée";
        return '';
      
      case 'imageUrl':
        if (typeof value === 'string' && value && !isValidUrl(value)) return "L'URL de l'image semble invalide";
        return '';
      
      default:
        return '';
    }
  };

  // GESTION PROFESSIONNELLE DES CHANGEMENTS
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    // Effacer l'erreur du champ quand l'utilisateur tape
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    
    let processedValue: string | number | boolean = value;
    
    // Gestion professionnelle des nombres
    if (type === "number") {
      processedValue = value === "" ? 0 : parseFloat(value);
      if (isNaN(processedValue as number)) {
        processedValue = 0;
      }
    }
    
    // Gestion des checkboxes
    if (type === "checkbox") {
      processedValue = (e.target as HTMLInputElement).checked;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  // CHARGEMENT DES DONNÉES
  const loadProduct = useCallback(async () => {
    if (!productId) {
      logger.error("ID produit manquant dans l'URL", "EditProduct");
      navigate("/admin/products");
      return;
    }

    try {
      logger.debug("Chargement du produit", "EditProduct", { productId });
      
      const response = await apiClient.get<Product>(`/products/${productId}`);
      const productData = response.data;
      
      logger.info("Produit chargé avec succès", "EditProduct", {
        productId: productData.productId,
        productName: productData.name,
        hasCategory: !!productData.categoryId,
        hasImage: !!productData.imageUrl
      });
      
      setProduct(productData);
      
      // Initialisation du formulaire
      setFormData({
        name: productData.name,
        description: productData.description || "",
        price: productData.price,
        stockQuantity: productData.stockQuantity,
        categoryId: productData.categoryId || 0,
        sku: productData.sku || "",
        imageUrl: productData.imageUrl || "",
        galleryImages: productData.galleryImages || [],
        isActive: productData.isActive ?? true
      });
      
    } catch (error: unknown) {
      logger.error("Erreur chargement produit", "EditProduct", error, { productId });
      toast.error(getErrorMessage(error));
      navigate("/admin/products");
    } finally {
      setLoading(false);
    }
  }, [productId, navigate]);

  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      logger.debug("Chargement des catégories", "EditProduct");
      
      const response = await apiClient.get<Category[]>("/categories");
      
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
        logger.debug("Catégories chargées avec succès", "EditProduct", {
          count: response.data.length
        });
      } else {
        logger.error("Format de réponse catégories invalide", "EditProduct", undefined, {
          isArray: Array.isArray(response.data),
          dataType: typeof response.data
        });
        setCategories([]);
      }
      
    } catch (error: unknown) {
      logger.error("Erreur chargement catégories", "EditProduct", error);
      toast.error("Erreur lors du chargement des catégories");
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await loadProduct();
      await loadCategories();
    };
    loadData();
  }, [loadCategories, loadProduct]);

  // SOUMISSION PROFESSIONNELLE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    logger.info("Soumission formulaire modification produit", "EditProduct", {
      productId,
      hasChanges: true // On vérifiera plus tard
    });
    
    // Validation complète avant soumission
    const errors: Record<string, string> = {};
    
    // Type-safe validation
    (Object.keys(formData) as Array<keyof ProductFormState>).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        errors[key] = error;
      }
    });
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      logger.warn("Erreurs validation formulaire", "EditProduct", {
        errorFields: Object.keys(errors)
      });
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    // Vérification des changements
    const hasChanges = product && (
      formData.name !== product.name ||
      formData.description !== product.description ||
      formData.price !== product.price ||
      formData.stockQuantity !== product.stockQuantity ||
      formData.categoryId !== product.categoryId ||
      formData.sku !== product.sku ||
      formData.imageUrl !== product.imageUrl ||
      formData.isActive !== product.isActive
    );
    
    if (!hasChanges) {
      logger.debug("Aucune modification détectée", "EditProduct", { productId });
      toast.info("Aucune modification détectée");
      return;
    }

    setSaving(true);

    try {
      const updateData: ProductUpdateData = formStateToUpdateData(formData, parseInt(productId!));
      
      logger.debug("Envoi données mise à jour", "EditProduct", {
        productId,
        fieldsUpdated: Object.keys(updateData).filter(key => key !== 'productId')
      });

      await apiClient.put(`/products/${productId}`, updateData);
      
      logger.info("Produit modifié avec succès", "EditProduct", { productId });
      toast.success("Produit modifié avec succès");
      
      // Rechargement pour avoir les données fraîches
      await loadProduct();
      
    } catch (error: unknown) {
      logger.error("Erreur modification produit", "EditProduct", error, { productId });
      toast.error(`Erreur: ${getErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  // ÉTATS DE CHARGEMENT
  if (loading || categoriesLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          {loading ? "Chargement du produit..." : "Chargement des catégories..."}
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">Produit non trouvé</p>
        <Link to="/admin/products" className="text-primary hover:underline mt-4 inline-block">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* En-tête */}
      <div className="mb-6">
        <Link 
          to="/admin/products" 
          className="text-primary hover:underline mb-4 inline-block"
        >
          ← Retour à la liste des produits
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Modifier le produit
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          ID: {product.productId} | {product.categoryName && `Catégorie: ${product.categoryName}`}
        </p>
      </div>

      {/* Alerte catégories */}
      {categories.length === 0 && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200 font-medium">
            ⚠️ Aucune catégorie disponible
          </p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
            Impossible de modifier la catégorie du produit.
          </p>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom du produit */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom du produit *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white ${
                fieldErrors.name 
                  ? "border-red-300 dark:border-red-600" 
                  : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.name}</p>
            )}
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SKU
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Catégorie *
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              disabled={categories.length === 0}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white ${
                fieldErrors.categoryId 
                  ? "border-red-300 dark:border-red-600" 
                  : "border-gray-300 dark:border-gray-600"
              } ${categories.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <option value="0">Sélectionnez une catégorie</option>
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.name} ({category.code})
                </option>
              ))}
            </select>
            {fieldErrors.categoryId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.categoryId}</p>
            )}
            {categories.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {categories.length} catégorie{categories.length > 1 ? "s" : ""} disponible{categories.length > 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Prix */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prix (€) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price || ''}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white ${
                fieldErrors.price 
                  ? "border-red-300 dark:border-red-600" 
                  : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {fieldErrors.price && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.price}</p>
            )}
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quantité en stock *
            </label>
            <input
              type="number"
              name="stockQuantity"
              value={formData.stockQuantity || ''}
              onChange={handleChange}
              min="0"
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white ${
                fieldErrors.stockQuantity 
                  ? "border-red-300 dark:border-red-600" 
                  : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {fieldErrors.stockQuantity && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.stockQuantity}</p>
            )}
          </div>

          {/* Statut actif */}
          <div className="md:col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Produit actif
              </span>
            </label>
          </div>

          {/* URL image */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL de l'image principale
            </label>
            <input
              type="text"
              inputMode="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg ou /uploads/products/image.jpg"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white ${
                fieldErrors.imageUrl 
                  ? "border-red-300 dark:border-red-600" 
                  : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {fieldErrors.imageUrl && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.imageUrl}</p>
            )}
            
            {/* Aperçu et feedback professionnel */}
            {formData.imageUrl && (
              <div className="mt-3">
                {isValidUrl(formData.imageUrl) ? (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                      ✅ URL valide - Aperçu :
                    </p>
                    <img 
                      src={formData.imageUrl} 
                      alt="Aperçu du produit" 
                      className="h-24 w-24 object-cover rounded-lg border shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      ⚠️ Cette URL semble invalide. Vérifiez le format.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Informations supplémentaires
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {product.createdAt && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Créé le:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {new Date(product.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}
            {product.updatedAt && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Modifié le:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {new Date(product.updatedAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}
            {product.popularity !== undefined && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Popularité:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {product.popularity}
                </span>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Statut:</span>
              <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                product.isActive !== false 
                  ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                  : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
              }`}>
                {product.isActive !== false ? "Actif" : "Inactif"}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/admin/products"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving || categories.length === 0}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-dark disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}