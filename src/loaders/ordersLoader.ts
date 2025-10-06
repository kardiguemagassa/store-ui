import apiClient from "../api/apiClient";
import type { OrderResponse, BackendOrderResponse } from "../types/orders";

export async function ordersLoader() {
  try {
    console.log("🔄 [LOADER] Fetching orders...");
    
    // ✅ Utilisez l'interface backend
    const response = await apiClient.get<BackendOrderResponse[]>("/orders");
    
    console.log("✅ [LOADER] Raw orders data:", response.data);

    // ✅ Transformation backend → frontend
    const orders: OrderResponse[] = response.data.map((order, orderIndex) => ({
      orderId: order.orderId,
      orderNumber: `ORD-${order.orderId}`,
      totalPrice: order.totalPrice,
      status: order.status,
      paymentStatus: "PENDING", // Valeur par défaut
      paymentId: "", // Valeur par défaut
      createdAt: order.createdAt,
      updatedAt: order.createdAt, // Utilise createdAt comme fallback
      items: order.items.map((item, itemIndex) => ({
        orderItemId: Date.now() + orderIndex * 1000 + itemIndex,
        productId: item.productId || 0,
        productName: item.productName || "Unknown Product",
        productImageUrl: item.productImageUrl || item.imageUrl || "https://via.placeholder.com/64?text=No+Image",
        quantity: item.quantity || 0,
        price: item.price || 0,
        subtotal: item.subtotal || (item.price || 0) * (item.quantity || 0)
      })),
      customer: { // Valeurs par défaut
        customerId: 0,
        name: "Customer",
        email: "customer@example.com",
        mobileNumber: ""
      },
      shippingAddress: { // Valeurs par défaut
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: ""
      }
    }));

    console.log("✅ [LOADER] Transformed orders:", orders);
    return orders;
    
  } catch (error: unknown) {
    console.error("❌ [LOADER] Failed to fetch orders:", error);
    return [];
  }
}