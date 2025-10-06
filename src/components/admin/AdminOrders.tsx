
import { useLoaderData, useRevalidator } from "react-router-dom";
import PageTitle from "../PageTitle";
import apiClient from "../../api/apiClient";
import { toast } from "react-toastify";
import type { OrderResponse, OrderItemResponse } from "../../types/orders";

export default function AdminOrders() {
  const loaderData = useLoaderData();
  const revalidator = useRevalidator();

  // ✅ Typage sécurisé des commandes
  const orders: OrderResponse[] = (() => {
    if (!loaderData || !Array.isArray(loaderData)) return [];
    return loaderData.filter((order): order is OrderResponse =>
      order && typeof order === 'object' && 'orderId' in order
    );
  })();

  function formatDate(isoDate: string | undefined | null): string {
    if (!isoDate) return "N/A";
    try {
      const date = new Date(isoDate);
      return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Date Error";
    }
  }

  function formatPrice(price: number | undefined | null): string {
    if (price == null || isNaN(price)) return "$0.00";
    return `$${price.toFixed(2)}`;
  }

  /**
   * Handle Order Confirm
   */
  const handleConfirm = async (orderId: number): Promise<void> => {
    try {
      await apiClient.patch(`/admin/orders/${orderId}/confirm`);
      toast.success("Order confirmed.");
      revalidator.revalidate(); // 🔁 Re-run loader
    } catch (error) {
      toast.error("Failed to confirm order.");
      console.error("Confirm order error:", error);
    }
  };

  /**
   * Handle Order Cancellation
   */
  const handleCancel = async (orderId: number): Promise<void> => {
    try {
      await apiClient.patch(`/admin/orders/${orderId}/cancel`);
      toast.success("Order cancelled.");
      revalidator.revalidate(); // 🔁 Re-run loader
    } catch (error) {
      toast.error("Failed to cancel order.");
      console.error("Cancel order error:", error);
    }
  };

  return (
    <div className="min-h-[852px] container mx-auto px-6 py-12 font-primary dark:bg-darkbg">
      {orders.length === 0 ? (
        <p className="text-center text-2xl text-primary dark:text-lighter">
          No orders found.
        </p>
      ) : (
        <div className="space-y-6 mt-4">
          <PageTitle title="Admin Orders Management" />
          {orders.map((order) => (
            <div
              key={order.orderId}
              className="bg-white dark:bg-gray-700 shadow-md rounded-md p-6"
            >
              {/* Top Row: Order Info + Buttons */}
              <div className="flex flex-wrap items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-primary dark:text-lighter">
                    Order #{order.orderNumber || order.orderId}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Status:{" "}
                    <span className="font-medium text-gray-800 dark:text-lighter">
                      {order.status}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Price:{" "}
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {formatPrice(order.totalPrice)}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Date:{" "}
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {formatDate(order.createdAt)}
                    </span>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 mt-4 lg:mt-0">
                  <button
                    onClick={() => handleConfirm(order.orderId)}
                    className="px-6 py-2 text-white dark:text-dark text-md rounded-md transition duration-200 bg-primary dark:bg-light hover:bg-dark dark:hover:bg-lighter"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleCancel(order.orderId)}
                    className="px-6 py-2 text-white text-md rounded-md transition duration-200 bg-red-500 hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4 border-t pt-4">
                {order.items?.map((item: OrderItemResponse, index: number) => (
                  <div
                    key={item.orderItemId || index}
                    className="flex items-center border-b pb-4 last:border-b-0"
                  >
                    <img
                      src={item.productImageUrl || item.productImageUrl || "https://via.placeholder.com/64?text=No+Image"}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-md mr-4"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/64?text=No+Image";
                      }}
                    />
                    <div>
                      <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Price: {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}