import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Mail,
  MapPin,
  Phone,
  Calendar,
  Heart,
  Star,
  Settings,
  Bell,
  Shield,
} from "lucide-react";

export default function Profile() {
  const { user, updateUser, deleteAccount } = useAuth();
  const [activeSection, setActiveSection] = useState("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [formData, setFormData] = useState({
    name: user?.name || "John Doe",
    email: user?.email || "john@example.com",
    phone: user?.phone || "(555) 123-4567",
    location: user?.location || "New York, NY",
  });
  const [preferences, setPreferences] = useState({
    cuisineTypes:
      user?.preferences?.cuisineTypes || "Italian, Japanese, Mexican",
    priceRange: user?.preferences?.priceRange || "$$ - $$$",
    dietaryRestrictions: user?.preferences?.dietaryRestrictions || "None",
    preferredDiningTime:
      user?.preferences?.preferredDiningTime || "7:00 PM - 9:00 PM",
  });
  const [notifications, setNotifications] = useState({
    newRestaurantAlerts: user?.notifications?.newRestaurantAlerts ?? true,
    reservationReminders: user?.notifications?.reservationReminders ?? true,
    specialOffers: user?.notifications?.specialOffers ?? false,
    reviewRequests: user?.notifications?.reviewRequests ?? true,
  });
  const [privacySettings, setPrivacySettings] = useState({
    twoFactorEnabled: user?.twoFactorEnabled ?? false,
    passwordLastChanged:
      user?.passwordLastChanged ||
      `Changed ${new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })}`,
  });

  useEffect(() => {
    setFormData({
      name: user?.name || "John Doe",
      email: user?.email || "john@example.com",
      phone: user?.phone || "(555) 123-4567",
      location: user?.location || "New York, NY",
    });
    setPreferences({
      cuisineTypes:
        user?.preferences?.cuisineTypes || "Italian, Japanese, Mexican",
      priceRange: user?.preferences?.priceRange || "$$ - $$$",
      dietaryRestrictions: user?.preferences?.dietaryRestrictions || "None",
      preferredDiningTime:
        user?.preferences?.preferredDiningTime || "7:00 PM - 9:00 PM",
    });
    setNotifications({
      newRestaurantAlerts: user?.notifications?.newRestaurantAlerts ?? true,
      reservationReminders: user?.notifications?.reservationReminders ?? true,
      specialOffers: user?.notifications?.specialOffers ?? false,
      reviewRequests: user?.notifications?.reviewRequests ?? true,
    });
    setPrivacySettings({
      twoFactorEnabled: user?.twoFactorEnabled ?? false,
      passwordLastChanged:
        user?.passwordLastChanged ||
        `Changed ${new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}`,
    });
  }, [user]);

  useEffect(() => {
    setIsEditingProfile(false);
    setIsEditingPreferences(false);
  }, [activeSection]);

  const saveUser = (updates) => {
    const updatedUser = {
      ...(user || {}),
      ...updates,
    };
    updateUser(updatedUser);
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handlePreferencesChange = (field, value) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNotificationToggle = (field) => {
    setNotifications((prev) => {
      const next = { ...prev, [field]: !prev[field] };
      saveUser({ notifications: next });
      setStatusMessage("Notification settings updated.");
      window.setTimeout(() => setStatusMessage(""), 3000);
      return next;
    });
  };

  const handleSaveProfile = () => {
    saveUser({ ...formData });
    setStatusMessage("Profile saved successfully.");
    window.setTimeout(() => setStatusMessage(""), 3000);
    setIsEditingProfile(false);
  };

  const handleCancelProfile = () => {
    setIsEditingProfile(false);
    setFormData({
      name: user?.name || "John Doe",
      email: user?.email || "john@example.com",
      phone: user?.phone || "(555) 123-4567",
      location: user?.location || "New York, NY",
    });
  };

  const handleSavePreferences = () => {
    saveUser({ preferences });
    setStatusMessage("Preferences saved successfully.");
    window.setTimeout(() => setStatusMessage(""), 3000);
    setIsEditingPreferences(false);
  };

  const handleCancelPreferences = () => {
    setIsEditingPreferences(false);
    setPreferences({
      cuisineTypes:
        user?.preferences?.cuisineTypes || "Italian, Japanese, Mexican",
      priceRange: user?.preferences?.priceRange || "$$ - $$$",
      dietaryRestrictions: user?.preferences?.dietaryRestrictions || "None",
      preferredDiningTime:
        user?.preferences?.preferredDiningTime || "7:00 PM - 9:00 PM",
    });
  };

  const handleToggle2FA = () => {
    const next = !privacySettings.twoFactorEnabled;
    setPrivacySettings((prev) => ({ ...prev, twoFactorEnabled: next }));
    saveUser({ twoFactorEnabled: next });
    setStatusMessage(
      next
        ? "Two-factor authentication enabled."
        : "Two-factor authentication disabled.",
    );
    window.setTimeout(() => setStatusMessage(""), 3000);
  };

  const handleChangePassword = () => {
    setIsChangingPassword(true);
    setPasswordError("");
  };

  const handleSavePassword = () => {
    if (!passwordForm.newPassword) {
      setPasswordError("Enter a new password");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    const now = new Date();
    const updatedDate = `Changed ${now.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })}`;
    updateUser({
      password: passwordForm.newPassword,
      passwordLastChanged: updatedDate,
    });
    setPrivacySettings((prev) => ({
      ...prev,
      passwordLastChanged: updatedDate,
    }));
    setStatusMessage("Password updated successfully.");
    setPasswordForm({ newPassword: "", confirmPassword: "" });
    setPasswordError("");
    setIsChangingPassword(false);
    window.setTimeout(() => setStatusMessage(""), 3000);
  };

  const handleCancelPassword = () => {
    setPasswordForm({ newPassword: "", confirmPassword: "" });
    setPasswordError("");
    setIsChangingPassword(false);
  };

  const handleDeleteAccount = () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This cannot be undone.",
      )
    ) {
      return;
    }
    localStorage.removeItem("savedRestaurants");
    deleteAccount();
    window.location.href = "/login";
  };

  const savedCount = (() => {
    const saved = localStorage.getItem("savedRestaurants");
    return saved ? JSON.parse(saved).length : 0;
  })();

  const menuItems = [
    { id: "profile", label: "Profile Info", icon: User },
    { id: "preferences", label: "Preferences", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-3xl font-bold text-orange-600">
              {user?.name?.charAt(0) || formData.name?.charAt(0) || "U"}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {user?.name || formData.name || "User"}
              </h1>
              <p className="text-gray-500 mb-3">
                {user?.email || formData.email || "user@example.com"}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-lg">
                  <Heart className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-700">
                    {savedCount} Saved
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium text-yellow-700">
                    4.5 Avg Rating
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">
                    Joined 2024
                  </span>
                </div>
              </div>
              {user?.role === "admin" && (
                <div className="mt-4">
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3.5 text-sm font-medium transition-colors ${
                    activeSection === item.id
                      ? "bg-orange-50 text-orange-700 border-r-2 border-orange-500"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              {activeSection === "profile" && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Profile Information
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                          <User className="w-4 h-4" />
                          <span className="text-xs uppercase tracking-[0.18em]">
                            Full Name
                          </span>
                        </div>
                        {isEditingProfile ? (
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                              handleFieldChange("name", e.target.value)
                            }
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">
                            {formData.name}
                          </p>
                        )}
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                          <Mail className="w-4 h-4" />
                          <span className="text-xs uppercase tracking-[0.18em]">
                            Email
                          </span>
                        </div>
                        {isEditingProfile ? (
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              handleFieldChange("email", e.target.value)
                            }
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">
                            {formData.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                          <Phone className="w-4 h-4" />
                          <span className="text-xs uppercase tracking-[0.18em]">
                            Phone
                          </span>
                        </div>
                        {isEditingProfile ? (
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                              handleFieldChange("phone", e.target.value)
                            }
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">
                            {formData.phone}
                          </p>
                        )}
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span className="text-xs uppercase tracking-[0.18em]">
                            Location
                          </span>
                        </div>
                        {isEditingProfile ? (
                          <input
                            type="text"
                            value={formData.location}
                            onChange={(e) =>
                              handleFieldChange("location", e.target.value)
                            }
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">
                            {formData.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-6">
                      <div className="flex gap-3">
                        {isEditingProfile ? (
                          <>
                            <button
                              type="button"
                              onClick={handleSaveProfile}
                              className="px-5 py-3 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors"
                            >
                              Save Changes
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelProfile}
                              className="px-5 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsEditingProfile(true)}
                            className="px-5 py-3 bg-orange-50 text-orange-700 text-sm font-medium rounded-xl hover:bg-orange-100 transition-colors"
                          >
                            Edit Profile
                          </button>
                        )}
                      </div>
                      {statusMessage && (
                        <p className="text-sm text-green-600">
                          {statusMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "preferences" && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Dining Preferences
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        {
                          label: "Cuisine Types",
                          value: preferences.cuisineTypes,
                          field: "cuisineTypes",
                        },
                        {
                          label: "Price Range",
                          value: preferences.priceRange,
                          field: "priceRange",
                        },
                        {
                          label: "Dietary Restrictions",
                          value: preferences.dietaryRestrictions,
                          field: "dietaryRestrictions",
                        },
                        {
                          label: "Preferred Dining Time",
                          value: preferences.preferredDiningTime,
                          field: "preferredDiningTime",
                        },
                      ].map((item) => (
                        <div
                          key={item.field}
                          className="bg-gray-50 rounded-2xl p-4"
                        >
                          <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <span className="text-xs uppercase tracking-[0.18em]">
                              {item.label}
                            </span>
                          </div>
                          {isEditingPreferences ? (
                            <input
                              type="text"
                              value={item.value}
                              onChange={(e) =>
                                handlePreferencesChange(
                                  item.field,
                                  e.target.value,
                                )
                              }
                              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none"
                            />
                          ) : (
                            <p className="text-sm text-gray-900">
                              {item.value}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
                      <div className="flex gap-3">
                        {isEditingPreferences ? (
                          <>
                            <button
                              type="button"
                              onClick={handleSavePreferences}
                              className="px-5 py-3 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors"
                            >
                              Save Preferences
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelPreferences}
                              className="px-5 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsEditingPreferences(true)}
                            className="px-5 py-3 bg-orange-50 text-orange-700 text-sm font-medium rounded-xl hover:bg-orange-100 transition-colors"
                          >
                            Edit Preferences
                          </button>
                        )}
                      </div>
                      {statusMessage && (
                        <p className="text-sm text-green-600">
                          {statusMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "notifications" && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Notification Settings
                  </h2>
                  <div className="space-y-4">
                    {[
                      {
                        key: "newRestaurantAlerts",
                        label: "New restaurant alerts",
                      },
                      {
                        key: "reservationReminders",
                        label: "Reservation reminders",
                      },
                      { key: "specialOffers", label: "Special offers" },
                      { key: "reviewRequests", label: "Review requests" },
                    ].map((notif) => (
                      <div
                        key={notif.key}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm text-gray-700">
                          {notif.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleNotificationToggle(notif.key)}
                          className={`w-10 h-6 rounded-full p-1 transition-colors ${
                            notifications[notif.key]
                              ? "bg-orange-500"
                              : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`block w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                              notifications[notif.key]
                                ? "translate-x-4"
                                : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                    {statusMessage && (
                      <p className="text-sm text-green-600">{statusMessage}</p>
                    )}
                  </div>
                </div>
              )}

              {activeSection === "privacy" && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Privacy & Security
                  </h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        Password
                      </h3>
                      <p className="text-xs text-gray-500 mb-3">
                        {privacySettings.passwordLastChanged}
                      </p>
                      {isChangingPassword ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              New Password
                            </label>
                            <input
                              type="password"
                              value={passwordForm.newPassword}
                              onChange={(e) =>
                                setPasswordForm((prev) => ({
                                  ...prev,
                                  newPassword: e.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Confirm Password
                            </label>
                            <input
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) =>
                                setPasswordForm((prev) => ({
                                  ...prev,
                                  confirmPassword: e.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none"
                            />
                          </div>
                          {passwordError && (
                            <p className="text-sm text-red-600">
                              {passwordError}
                            </p>
                          )}
                          <div className="flex gap-3">
                            <button
                              onClick={handleSavePassword}
                              className="px-5 py-3 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors"
                            >
                              Update Password
                            </button>
                            <button
                              onClick={handleCancelPassword}
                              className="px-5 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={handleChangePassword}
                          className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                        >
                          Change Password
                        </button>
                      )}
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        Two-Factor Authentication
                      </h3>
                      <p className="text-xs text-gray-500 mb-3">
                        Add an extra layer of security to your account
                      </p>
                      <div
                        onClick={handleToggle2FA}
                        className={`flex items-center justify-between p-3 bg-gray-100 rounded-lg cursor-pointer ${
                          privacySettings.twoFactorEnabled ? "bg-green-50" : ""
                        }`}
                      >
                        <span className="text-sm text-gray-700">
                          {privacySettings.twoFactorEnabled
                            ? "Enabled"
                            : "Disabled"}
                        </span>
                        <div
                          className={`w-10 h-6 rounded-full p-1 transition-colors ${
                            privacySettings.twoFactorEnabled
                              ? "bg-orange-500"
                              : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                              privacySettings.twoFactorEnabled
                                ? "translate-x-4"
                                : "translate-x-0"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                    {statusMessage && (
                      <p className="text-sm text-green-600">{statusMessage}</p>
                    )}
                    <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                      <h3 className="text-sm font-medium text-red-700 mb-1">
                        Delete Account
                      </h3>
                      <p className="text-xs text-red-500 mb-3">
                        This action cannot be undone
                      </p>
                      <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
