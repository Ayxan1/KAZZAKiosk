<template>
  <div
    class="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4"
  >
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800">KAZZAKIOSK</h1>
        <p class="text-gray-600 mt-2">Kiosk İdarəetmə Sistemi</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >İstifadəçi adı</label
          >
          <input
            v-model="username"
            type="text"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="admin"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Şifrə</label
          >
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <div v-if="showKioskSelect">
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Kiosk</label
          >
          <select
            v-model="selectedKiosk"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Kiosk seçin...</option>
            <option
              v-for="kiosk in kioskStore.kiosks"
              :key="kiosk.kiosk_id"
              :value="kiosk.kiosk_id"
            >
              {{ kiosk.kiosk_name }}
            </option>
          </select>
        </div>

        <div
          v-if="authStore.error"
          class="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm"
        >
          {{ authStore.error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50"
        >
          {{ authStore.loading ? "Giriş edilir..." : "Daxil ol" }}
        </button>
      </form>

      <div
        class="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600"
      >
        <p><strong>Admin:</strong> admin / admin123</p>
        <p class="mt-1"><strong>Seller:</strong> seller / seller123</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { useKioskStore } from "../stores/kiosk";

const authStore = useAuthStore();
const kioskStore = useKioskStore();

const username = ref("");
const password = ref("");
const selectedKiosk = ref("");

const showKioskSelect = computed(() => username.value === "seller");

onMounted(() => {
  kioskStore.fetchKiosks();
});

async function handleLogin() {
  await authStore.login(
    username.value,
    password.value,
    showKioskSelect.value ? selectedKiosk.value : null,
  );
}
</script>
