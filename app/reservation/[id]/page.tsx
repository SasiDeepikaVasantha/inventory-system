"use client";

import { useEffect, useState } from "react";

export default function ReservationPage({ params }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/reservations/${params.id}`);

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to fetch");
        }

        const result = await res.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  async function confirm() {
    const res = await fetch(`/api/reservations/${params.id}/confirm`, {
      method: "POST",
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.error);
      return;
    }

    alert("✅ Reservation Confirmed");
    window.location.href = "/";
  }

  async function cancel() {
    const res = await fetch(`/api/reservations/${params.id}/release`, {
      method: "POST",
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.error);
      return;
    }

    alert("❌ Reservation Cancelled");
    window.location.href = "/";
  }

  // Loading state
  if (loading) {
    return <p className="p-10 text-lg">Loading reservation...</p>;
  }

  // Error state
  if (error) {
    return (
      <div className="p-10 text-red-600">
        <h1 className="text-xl font-bold">Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  // No data
  if (!data) {
    return <p className="p-10">Reservation not found</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        
        <h1 className="text-2xl font-bold mb-6 text-center">
          Reservation Details
        </h1>

        <div className="space-y-3 text-gray-700">
          <p><strong>ID:</strong> {data.id}</p>
          <p><strong>Status:</strong> {data.status}</p>
          <p><strong>Quantity:</strong> {data.quantity}</p>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={confirm}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            Confirm
          </button>

          <button
            onClick={cancel}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}