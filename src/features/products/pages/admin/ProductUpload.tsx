import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { Category, Product } from "../../types/product.types";
import apiClient from "../../../../shared/api/apiClient";
import { getErrorMessage, logger } from "../../../../shared/types/errors.types";

// Interface locale pour le formulaire
interface ProductFormState {
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
  categoryId: string; 
  sku: string;
}

export default function ProductUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ProductFormState>({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    categoryId: "", 
    sku: ""
  });
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Chargement des catégories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        logger.debug("Chargement des catégories", "ProductUpload");
        
        const response = await apiClient.get<Category[]>("/categories");
        
        if (response.data && Array.isArray(response.data)) {
          setCategories(response.data);
          logger.debug("Catégories chargées avec succès", "ProductUpload", {
            count: response.data.length
          });
        } else {
          logger.error("Format de réponse catégories invalide", "ProductUpload", undefined, {
            responseType: typeof response.data,
            isArray: Array.isArray(response.data)
          });
          toast.error("Format de réponse catégories invalide");
          setCategories([]);
        }
      } catch (error) {
        logger.error("Erreur chargement catégories", "ProductUpload", error);
        toast.error("Erreur lors du chargement des catégories");
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    
    loadCategories();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Format non supporté. Utilisez JPG, PNG, WebP ou GIF.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5MB.");
      return;
    }

    setSelectedImage(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    logger.debug("Image sélectionnée", "ProductUpload", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    logger.debug("Image supprimée", "ProductUpload");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    logger.info("Soumission formulaire création produit", "ProductUpload", {
      hasImage: !!selectedImage,
      categorySelected: !!formData.categoryId,
      formFields: Object.keys(formData).filter(key => formData[key as keyof ProductFormState])
    });

    if (!selectedImage) {
      toast.error("Veuillez sélectionner une image pour le produit.");
      return;
    }

    if (!formData.categoryId || formData.categoryId === "" || formData.categoryId === "0") {
      toast.error("Veuillez sélectionner une catégorie valide");
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Ajouter les données du produit
      formDataToSend.append("product", new Blob([JSON.stringify({
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
        categoryId: parseInt(formData.categoryId),
        sku: formData.sku.trim(),
        isActive: true
      })], { type: "application/json" }));

      // Ajouter l'image
      formDataToSend.append("image", selectedImage);

      logger.debug("Envoi données produit", "ProductUpload", {
        productName: formData.name,
        categoryId: formData.categoryId,
        imageName: selectedImage.name
      });

      const response = await apiClient.post<Product>("/products/create-with-image", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const newProduct = response.data;
      
      logger.info("Produit créé avec succès", "ProductUpload", {
        productId: newProduct.productId,
        productName: newProduct.name,
        hasImageUrl: !!newProduct.imageUrl
      });

      toast.success("Produit créé avec succès!");
      navigate("/admin/products");

    } catch (error: unknown) {
      logger.error("Erreur création produit", "ProductUpload", error, {
        productName: formData.name,
        categoryId: formData.categoryId
      });
      const errorMessage = getErrorMessage(error);
      toast.error(`Erreur: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // État de chargement des catégories
  if (categoriesLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des catégories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Ajouter un nouveau produit
        </h1>

        {/* Alerte si pas de catégories */}
        {categories.length === 0 && !categoriesLoading && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200 font-medium">
              ⚠️ Aucune catégorie disponible
            </p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
              Vous devez créer des catégories avant d'ajouter des produits.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom du produit *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                placeholder="Nom du sticker"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SKU *
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                placeholder="SKU-001"
              />
            </div>
          </div>

          {/* Catégorie et Prix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Catégorie *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white ${
                  !formData.categoryId || formData.categoryId === ""
                    ? "border-red-300 dark:border-red-600"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map(category => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.name} ({category.code})
                  </option>
                ))}
              </select>
              {categories.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {categories.length} catégorie{categories.length > 1 ? "s" : ""} disponible{categories.length > 1 ? "s" : ""}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prix (€) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0.01"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                placeholder="9.99"
              />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quantité en stock *
            </label>
            <input
              type="number"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleInputChange}
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              placeholder="100"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              placeholder="Description détaillée du produit..."
            />
          </div>

          {/* Upload d'image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image du produit *
            </label>
            
            {imagePreview ? (
              <div className="mt-4">
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Aperçu"
                    className="h-32 w-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer block"
                >
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Cliquez pour uploader une image
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      JPG, PNG, WebP, GIF - Max 5MB
                    </span>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Boutons */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedImage || categories.length === 0}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Création..." : "Créer le produit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}