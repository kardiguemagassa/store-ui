import apiClient from "../api/apiClient";
import type { OrderResponse, BackendOrderResponse, BackendOrderItem } from "../types/orders";
import { handleError, type ApiError } from "../types/errors";

export async function ordersLoader() {
  try {
    console.log("[LOADER] Fetching orders...");
    
    const response = await apiClient.get<BackendOrderResponse[]>("/orders");
    
    console.log("[LOADER] Raw orders data:", response.data);

    const orders: OrderResponse[] = response.data.map((order: BackendOrderResponse, orderIndex: number) => ({
      orderId: order.orderId,
      orderNumber: `ORD-${order.orderId}`,
      totalPrice: order.totalPrice,
      status: order.status,
      paymentStatus: "",
      paymentId: "",
      createdAt: order.createdAt,
      updatedAt: order.createdAt,
      items: order.items.map((item: BackendOrderItem, itemIndex: number) => ({
        orderItemId: Date.now() + orderIndex * 1000 + itemIndex,
        productId: item.productId || 0,
        productName: item.productName || "Unknown Product",
        productImageUrl: item.productImageUrl || item.imageUrl || "https://via.placeholder.com/64?text=No+Image",
        quantity: item.quantity || 0,
        price: item.price || 0,
        subtotal: item.subtotal || (item.price || 0) * (item.quantity || 0)
      })),
      customer: {
        customerId: 0,
        name: "Customer",
        email: "customer@example.com",
        mobileNumber: ""
      },
      shippingAddress: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: ""
      }
    }));

    console.log("[LOADER] Transformed orders:", orders);
    return orders;
    
  } catch (error: unknown) {
    console.error("[LOADER] Failed to fetch orders:", error);
    
    const errorMessage = handleError(error);
    const status = (error as ApiError)?.response?.status || 500;
    
    throw new Response(errorMessage, { status });
  }
}