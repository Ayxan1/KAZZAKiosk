<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center"
      >
        <div>
          <h1 class="text-2xl font-bold text-gray-800">KAZZAKIOSK</h1>
          <p class="text-sm text-gray-600">Admin Panel</p>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-gray-700">{{ authStore.user?.full_name }}</span>
          <button
            @click="authStore.logout"
            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
          >
            Çıxış
          </button>
        </div>
      </div>
    </header>

    <!-- Tabs -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex gap-2 mb-6 border-b border-gray-200">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-6 py-3 font-medium transition',
            activeTab === tab.id
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-800',
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Dashboard Tab -->
      <div
        v-if="activeTab === 'dashboard'"
        class="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div class="bg-white p-6 rounded-xl shadow-sm">
          <div class="text-3xl font-bold text-indigo-600 mb-2">12</div>
          <div class="text-gray-600">Ümumi Kiosks</div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm">
          <div class="text-3xl font-bold text-green-600 mb-2">246</div>
          <div class="text-gray-600">Ümumi Məhsullar</div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm">
          <div class="text-3xl font-bold text-purple-600 mb-2">1,543</div>
          <div class="text-gray-600">Ümumi Satışlar</div>
        </div>
      </div>

      <!-- Kiosks Tab -->
      <div
        v-else-if="activeTab === 'kiosks'"
        class="bg-white rounded-xl shadow-sm p-6"
      >
        <h2 class="text-xl font-semibold mb-4">Kiosklar</h2>
        <div class="space-y-2">
          <div
            v-for="kiosk in kioskStore.kiosks"
            :key="kiosk.kiosk_id"
            class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-medium">{{ kiosk.kiosk_name }}</h3>
                <p class="text-sm text-gray-600">{{ kiosk.kiosk_id }}</p>
              </div>
              <span
                :class="[
                  'px-3 py-1 rounded-full text-sm',
                  kiosk.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700',
                ]"
              >
                {{ kiosk.is_active ? "Aktiv" : "Deaktiv" }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Product History Tab -->
      <div
        v-else-if="activeTab === 'history'"
        class="bg-white rounded-xl shadow-sm p-6"
      >
        <h2 class="text-xl font-semibold mb-4">Məhsul Dəyişiklik Tarixçəsi</h2>
        <p class="text-gray-600">
          Məhsul dəyişikliklərinin tarixçəsi burada görünəcək...
        </p>
      </div>

      <!-- Users Tab -->
      <div
        v-else-if="activeTab === 'users'"
        class="bg-white rounded-xl shadow-sm p-6"
      >
        <h2 class="text-xl font-semibold mb-4">İstifadəçilər</h2>
        <p class="text-gray-600">İstifadəçi siyahısı burada görünəcək...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useKioskStore } from "../../stores/kiosk";

const authStore = useAuthStore();
const kioskStore = useKioskStore();

const activeTab = ref("dashboard");

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "kiosks", label: "Kiosklar" },
  { id: "history", label: "Məhsul Tarixçəsi" },
  { id: "users", label: "İstifadəçilər" },
];

onMounted(() => {
  kioskStore.fetchKiosks();
});
</script>
