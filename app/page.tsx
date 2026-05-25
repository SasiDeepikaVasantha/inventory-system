"use client";

import { useEffect, useState } from "react";
import { Package, Warehouse, ShoppingCart } from "lucide-react";

type Product = {
  inventoryId: string;
  productId: string;
  warehouseId: string;
  product: string;
  warehouse: string;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
};

export default function HomePage() {

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function fetchProducts() {

    try {

      const res = await fetch("/api/products");

      const data = await res.json();

      setProducts(data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function reserveProduct(item: Product) {

    try {

      setMessage("");

      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: item.productId,
          warehouseId: item.warehouseId,
          quantity: 1,
        }),
      });

      const data = await res.json();
      console.log("Reservation response:", data);

      if (!res.ok || !data.id) {

        setMessage(data.error || "Reservation failed");

        return;
      }

      window.location.href =
        `/reservation/${data.id}`;

      fetchProducts();

    } catch (error) {

      setMessage("Something went wrong");
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Inventory Dashboard
          </h1>

          <p className="text-gray-600 mt-2">
            Multi-Warehouse Inventory Reservation System
          </p>
        </div>

        {message && (
          <div className="mb-6 bg-white border rounded-lg p-4 shadow-sm">
            <p className="text-sm font-medium">
              {message}
            </p>
          </div>
        )}

        {loading ? (

          <div className="text-center py-20">
            <p className="text-gray-600">
              Loading products...
            </p>
          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {products.map((item) => (

              <div
                key={item.inventoryId}
                className="bg-white rounded-2xl shadow-md border p-6 hover:shadow-lg transition"
              >

                <div className="flex items-center justify-between mb-4">

                  <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center">
                    <Package size={24} />
                  </div>

                  <span
                    className={`text-sm font-semibold px-3 py-1 rounded-full ${
                      item.availableStock > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.availableStock > 0
                      ? "In Stock"
                      : "Out of Stock"}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {item.product}
                </h2>

                <div className="space-y-3 mt-4">

                  <div className="flex items-center gap-2 text-gray-700">
                    <Warehouse size={18} />
                    <span>{item.warehouse}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Total Stock
                    </span>

                    <span className="font-semibold">
                      {item.totalStock}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Reserved
                    </span>

                    <span className="font-semibold">
                      {item.reservedStock}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Available
                    </span>

                    <span className="font-semibold text-green-700">
                      {item.availableStock}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => reserveProduct(item)}
                  disabled={item.availableStock <= 0}
                  className={`w-full mt-6 flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition ${
                    item.availableStock > 0
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart size={18} />

                  Reserve Product
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}