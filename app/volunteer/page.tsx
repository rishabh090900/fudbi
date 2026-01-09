"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Clock, Users, CheckCircle, LogOut, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FoodPost {
  id: string;
  hostName: string;
  foodType: string;
  quantity: string;
  servings: number;
  location: {
    address: string;
    city: string;
    landmark?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  expiresAt: string;
  status: string;
  imageUrl?: string;
  createdAt: string;
  pickupId?: string;
}

export default function VolunteerDashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"available" | "my-pickups">("available");

  useEffect(() => {
    if (user?.role !== "volunteer") {
      router.push("/dashboard");
      return;
    }

    fetchPosts();
  }, [user, filter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const endpoint =
        filter === "available"
          ? `/api/posts/list?city=${user?.city}&status=POSTED`
          : `/api/pickups/my-pickups`;

      const response = await fetch(endpoint);
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptPickup = async (postId: string) => {
    try {
      const response = await fetch("/api/pickups/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        fetchPosts();
        alert("Pickup accepted successfully!");
      }
    } catch (error) {
      console.error("Error accepting pickup:", error);
      alert("Failed to accept pickup");
    }
  };

  const handleUpdateStatus = async (
    postId: string,
    pickupId: string,
    status: string
  ) => {
    console.log("Updating status:", { postId, pickupId, status });

    if (!pickupId) {
      alert("Pickup ID is missing. Please try refreshing the page.");
      return;
    }

    try {
      const response = await fetch("/api/pickups/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, pickupId, status }),
      });

      if (response.ok) {
        fetchPosts();
        alert(`Status updated to ${status}!`);
      } else {
        const data = await response.json();
        console.error("Update failed:", data);
        alert(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Please sign in to continue</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Volunteer Dashboard
            </h1>
            <p className="text-gray-600">Welcome back, {user.name}!</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="btn-secondary flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
            <button
              onClick={async () => {
                await signOut();
                router.push("/");
              }}
              className="btn-secondary flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter("available")}
              className={`py-4 px-6 border-b-2 font-medium transition-colors ${
                filter === "available"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Available Food
            </button>
            <button
              onClick={() => setFilter("my-pickups")}
              className={`py-4 px-6 border-b-2 font-medium transition-colors ${
                filter === "my-pickups"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              My Pickups
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              {filter === "available"
                ? "No available food posts in your city"
                : "You have no active pickups"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="card hover:shadow-lg transition-shadow"
              >
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.foodType}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}

                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {post.foodType}
                    </h3>
                    <p className="text-sm text-gray-600">by {post.hostName}</p>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">
                      {post.servings} servings ({post.quantity})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">
                      {post.location.address}, {post.location.city}
                    </span>
                  </div>

                  <a
                    href={
                      post.location.coordinates
                        ? `https://www.google.com/maps/search/?api=1&query=${post.location.coordinates.lat},${post.location.coordinates.lng}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            post.location.address + ", " + post.location.city
                          )}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                  >
                    <MapPin className="w-4 h-4" />
                    View on Map
                  </a>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {new Date(post.expiresAt) < new Date() ? (
                      <span className="text-sm font-semibold text-red-600">
                        Expired
                      </span>
                    ) : (
                      <span className="text-sm text-gray-700">
                        Expires{" "}
                        {formatDistanceToNow(new Date(post.expiresAt), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                  </div>

                  {post.status === "POSTED" &&
                    filter === "available" &&
                    new Date(post.expiresAt) >= new Date() && (
                      <button
                        onClick={() => handleAcceptPickup(post.id)}
                        className="w-full btn-primary mt-4"
                      >
                        Accept Pickup
                      </button>
                    )}

                  {post.status === "POSTED" &&
                    filter === "available" &&
                    new Date(post.expiresAt) < new Date() && (
                      <div className="w-full mt-4 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-center">
                        <span className="text-red-600 font-medium text-sm">
                          This food has expired
                        </span>
                      </div>
                    )}

                  {post.status === "ACCEPTED" && filter === "my-pickups" && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(
                          post.id,
                          post.pickupId || "",
                          "PICKED"
                        )
                      }
                      className="w-full btn-primary mt-4"
                    >
                      Mark as Picked Up
                    </button>
                  )}

                  {post.status === "PICKED" && filter === "my-pickups" && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(
                          post.id,
                          post.pickupId || "",
                          "COMPLETED"
                        )
                      }
                      className="w-full btn-primary mt-4 bg-green-600 hover:bg-green-700"
                    >
                      Mark as Completed
                    </button>
                  )}

                  {post.status === "COMPLETED" && filter === "my-pickups" && (
                    <div className="flex items-center gap-2 text-green-600 mt-4">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Completed</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
