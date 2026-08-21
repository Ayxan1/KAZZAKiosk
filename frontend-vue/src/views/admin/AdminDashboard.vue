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
        class="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div class="bg-white p-6 rounded-xl shadow-sm">
          <div class="text-3xl font-bold text-indigo-600 mb-2">
            {{ kioskStore.kiosks.length }}
          </div>
          <div class="text-gray-600">Ümumi Kiosklar</div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm">
          <div class="text-3xl font-bold text-blue-600 mb-2">
            {{ userStore.users.length }}
          </div>
          <div class="text-gray-600">Ümumi İstifadəçilər</div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm">
          <div class="text-3xl font-bold text-purple-600 mb-2">
            {{ reportStore.stats?.totalSales ?? 0 }}
          </div>
          <div class="text-gray-600">Ümumi Satışlar</div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm">
          <div class="text-3xl font-bold text-green-600 mb-2">
            {{ (reportStore.stats?.totalRevenue ?? 0).toFixed(2) }} ₼
          </div>
          <div class="text-gray-600">Ümumi Gəlir</div>
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
        <div v-if="reportStore.loading" class="text-gray-600">Yüklənir...</div>
        <div v-else-if="reportStore.productHistory.length === 0" class="text-gray-600">
          Hələ heç bir dəyişiklik qeydə alınmayıb.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-gray-600 border-b border-gray-200">
              <tr>
                <th class="py-2 pr-4">Tarix</th>
                <th class="py-2 pr-4">Kiosk</th>
                <th class="py-2 pr-4">Məhsul</th>
                <th class="py-2 pr-4">İstifadəçi</th>
                <th class="py-2 pr-4">Dəyişiklik</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="entry in reportStore.productHistory"
                :key="entry.history_id"
                class="border-b border-gray-100"
              >
                <td class="py-2 pr-4 whitespace-nowrap">
                  {{ new Date(entry.created_at).toLocaleString('az-AZ') }}
                </td>
                <td class="py-2 pr-4">{{ entry.kiosk?.kiosk_name }}</td>
                <td class="py-2 pr-4">{{ entry.product?.name }}</td>
                <td class="py-2 pr-4">{{ entry.user?.full_name }}</td>
                <td class="py-2 pr-4">{{ entry.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Users Tab -->
      <div
        v-else-if="activeTab === 'users'"
        class="bg-white rounded-xl shadow-sm p-6"
      >
        <h2 class="text-xl font-semibold mb-4">İstifadəçilər</h2>
        <div v-if="userStore.loading" class="text-gray-600">Yüklənir...</div>
        <div v-else class="space-y-2">
          <div
            v-for="user in userStore.users"
            :key="user.user_id"
            class="p-4 border border-gray-200 rounded-lg flex justify-between items-center"
          >
            <div>
              <h3 class="font-medium">{{ user.full_name }} ({{ user.username }})</h3>
              <p class="text-sm text-gray-600">
                {{ user.role === 'admin' ? 'Admin' : 'Satıcı' }}
                <span v-if="user.assignedKiosk"> · {{ user.assignedKiosk.kiosk_name }}</span>
              </p>
            </div>
            <span
              :class="[
                'px-3 py-1 rounded-full text-sm',
                user.is_active
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700',
              ]"
            >
              {{ user.is_active ? "Aktiv" : "Deaktiv" }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useKioskStore } from "../../stores/kiosk";
import { useReportStore } from "../../stores/report";
import { useUserStore } from "../../stores/user";

const authStore = useAuthStore();
const kioskStore = useKioskStore();
const reportStore = useReportStore();
const userStore = useUserStore();

const activeTab = ref("dashboard");

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "kiosks", label: "Kiosklar" },
  { id: "history", label: "Məhsul Tarixçəsi" },
  { id: "users", label: "İstifadəçilər" },
];

onMounted(() => {
  kioskStore.fetchKiosks();
  reportStore.fetchDashboardStats();
  reportStore.fetchProductHistory();
  userStore.fetchUsers();
});
</script>
