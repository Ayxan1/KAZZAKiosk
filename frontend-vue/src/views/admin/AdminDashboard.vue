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
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Kiosklar</h2>
          <button
            @click="showNewKioskForm = !showNewKioskForm"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
          >
            {{ showNewKioskForm ? "Bağla" : "+ Yeni Kiosk" }}
          </button>
        </div>

        <form
          v-if="showNewKioskForm"
          @submit.prevent="handleCreateKiosk"
          class="flex gap-2 mb-6 p-4 bg-gray-50 rounded-lg"
        >
          <input
            v-model="newKioskName"
            type="text"
            required
            placeholder="Kiosk adı"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            Yarat
          </button>
        </form>

        <div class="space-y-2">
          <div
            v-for="kiosk in kioskStore.kiosks"
            :key="kiosk.kiosk_id"
            class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div
              v-if="editingKioskId !== kiosk.kiosk_id"
              class="flex justify-between items-center"
            >
              <div>
                <h3 class="font-medium">{{ kiosk.kiosk_name }}</h3>
                <p class="text-sm text-gray-600">{{ kiosk.kiosk_id }}</p>
              </div>
              <div class="flex items-center gap-3">
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
                <button
                  @click="startEditKiosk(kiosk)"
                  class="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                >
                  Redaktə et
                </button>
              </div>
            </div>

            <form
              v-else
              @submit.prevent="handleUpdateKiosk(kiosk.kiosk_id)"
              class="flex flex-wrap items-center gap-3"
            >
              <input
                v-model="editKioskName"
                type="text"
                required
                class="flex-1 min-w-[150px] px-3 py-2 border border-gray-300 rounded-lg"
              />
              <label class="flex items-center gap-2 text-sm">
                <input type="checkbox" v-model="editKioskActive" />
                Aktiv
              </label>
              <button
                type="submit"
                class="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
              >
                Yadda saxla
              </button>
              <button
                type="button"
                @click="editingKioskId = null"
                class="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition"
              >
                Ləğv et
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Products Tab (cross-kiosk inventory) -->
      <div
        v-else-if="activeTab === 'products'"
        class="bg-white rounded-xl shadow-sm p-6"
      >
        <div class="flex justify-between items-center mb-4 flex-wrap gap-3">
          <h2 class="text-xl font-semibold">Bütün Kiosklarda Məhsullar</h2>
          <button
            @click="showNewProductForm = !showNewProductForm"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
          >
            {{ showNewProductForm ? "Bağla" : "+ Məhsul Əlavə Et" }}
          </button>
        </div>

        <form
          v-if="showNewProductForm"
          @submit.prevent="handleCreateProduct"
          class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 p-4 bg-gray-50 rounded-lg"
        >
          <select
            v-model="newProduct.kiosk_id"
            required
            class="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="" disabled>Kiosk seçin</option>
            <option
              v-for="kiosk in kioskStore.kiosks"
              :key="kiosk.kiosk_id"
              :value="kiosk.kiosk_id"
            >
              {{ kiosk.kiosk_name }}
            </option>
          </select>
          <input
            v-model="newProduct.product_name"
            type="text"
            required
            placeholder="Məhsul adı"
            class="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            v-model="newProduct.product_code"
            type="text"
            placeholder="Kod (opsional)"
            class="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            v-model="newProduct.barcode"
            type="text"
            placeholder="Barkod (opsional)"
            class="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            v-model.number="newProduct.price"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="Qiymət"
            class="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            v-model.number="newProduct.stock_quantity"
            type="number"
            min="0"
            required
            placeholder="Say"
            class="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <button
            type="submit"
            class="md:col-span-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            Əlavə et
          </button>
        </form>

        <div class="flex flex-wrap gap-3 mb-4">
          <select
            v-model="productFilterKiosk"
            @change="loadAllProducts"
            class="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Bütün kiosklar</option>
            <option
              v-for="kiosk in kioskStore.kiosks"
              :key="kiosk.kiosk_id"
              :value="kiosk.kiosk_id"
            >
              {{ kiosk.kiosk_name }}
            </option>
          </select>
          <input
            v-model="productFilterSearch"
            @input="loadAllProducts"
            type="text"
            placeholder="Ad, kod və ya barkod ilə axtar..."
            class="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div v-if="productStore.loading" class="text-gray-600">Yüklənir...</div>
        <div
          v-else-if="productStore.allProducts.length === 0"
          class="text-gray-600"
        >
          Məhsul tapılmadı.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-gray-600 border-b border-gray-200">
              <tr>
                <th class="py-2 pr-4">Kiosk</th>
                <th class="py-2 pr-4">Məhsul</th>
                <th class="py-2 pr-4">Kod</th>
                <th class="py-2 pr-4">Qiymət</th>
                <th class="py-2 pr-4">Say</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="p in productStore.allProducts"
                :key="p.kiosk_product_id"
                class="border-b border-gray-100"
              >
                <td class="py-2 pr-4">{{ p.kiosk_name }}</td>
                <td class="py-2 pr-4">{{ p.product_name }}</td>
                <td class="py-2 pr-4">{{ p.product_code || "-" }}</td>
                <td class="py-2 pr-4">{{ p.price.toFixed(2) }} ₼</td>
                <td class="py-2 pr-4">{{ p.stock_quantity }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Product History Tab -->
      <div
        v-else-if="activeTab === 'history'"
        class="bg-white rounded-xl shadow-sm p-6"
      >
        <h2 class="text-xl font-semibold mb-4">Məhsul Dəyişiklik Tarixçəsi</h2>
        <div v-if="reportStore.loading" class="text-gray-600">Yüklənir...</div>
        <div
          v-else-if="reportStore.productHistory.length === 0"
          class="text-gray-600"
        >
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
                  {{ new Date(entry.created_at).toLocaleString("az-AZ") }}
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

      <!-- Activity Log Tab -->
      <div
        v-else-if="activeTab === 'activity'"
        class="bg-white rounded-xl shadow-sm p-6"
      >
        <h2 class="text-xl font-semibold mb-4">Fəaliyyət Jurnalı</h2>

        <div
          class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4"
        >
          <div>
            <label class="block text-xs text-gray-500 mb-1">Tarixdən</label>
            <input
              v-model="activityFilters.startDate"
              type="date"
              class="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Tarixədək</label>
            <input
              v-model="activityFilters.endDate"
              type="date"
              class="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Kiosk</label>
            <select
              v-model="activityFilters.kioskId"
              class="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Hamısı</option>
              <option
                v-for="kiosk in kioskStore.kiosks"
                :key="kiosk.kiosk_id"
                :value="kiosk.kiosk_id"
              >
                {{ kiosk.kiosk_name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">İstifadəçi</label>
            <select
              v-model="activityFilters.userId"
              class="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Hamısı</option>
              <option
                v-for="user in userStore.users"
                :key="user.user_id"
                :value="user.user_id"
              >
                {{ user.full_name }} ({{ user.role }})
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Əməliyyat</label>
            <select
              v-model="activityFilters.action"
              class="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Hamısı</option>
              <option
                v-for="(label, key) in actionLabels"
                :key="key"
                :value="key"
              >
                {{ label }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Məhsul</label>
            <input
              v-model="activityFilters.product"
              list="activity-product-list"
              type="text"
              placeholder="Məhsul adı..."
              class="w-full px-3 py-2 border rounded-lg text-sm"
            />
            <datalist id="activity-product-list">
              <option
                v-for="name in uniqueProductNames"
                :key="name"
                :value="name"
              />
            </datalist>
          </div>
        </div>

        <div class="flex gap-2 mb-4">
          <button
            @click="applyActivityFilters"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition"
          >
            Filtrlə
          </button>
          <button
            @click="clearActivityFilters"
            class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm transition"
          >
            Təmizlə
          </button>
        </div>

        <div v-if="activityStore.loading" class="text-gray-600">
          Yüklənir...
        </div>
        <div v-else-if="activityStore.logs.length === 0" class="text-gray-600">
          Nəticə tapılmadı.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-gray-600 border-b border-gray-200">
              <tr>
                <th class="py-2 pr-4">Tarix</th>
                <th class="py-2 pr-4">İstifadəçi</th>
                <th class="py-2 pr-4">Kiosk</th>
                <th class="py-2 pr-4">Əməliyyat</th>
                <th class="py-2 pr-4">Təsvir</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="log in activityStore.logs"
                :key="log.log_id"
                class="border-b border-gray-100"
              >
                <td class="py-2 pr-4 whitespace-nowrap">
                  {{ new Date(log.created_at).toLocaleString("az-AZ") }}
                </td>
                <td class="py-2 pr-4">
                  {{ log.user?.full_name || "-" }}
                  <span v-if="log.user" class="text-gray-500"
                    >({{ log.user.username }})</span
                  >
                </td>
                <td class="py-2 pr-4">
                  {{ log.kiosk?.kiosk_name || "-" }}
                </td>
                <td class="py-2 pr-4">
                  <span
                    class="px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700"
                  >
                    {{ actionLabels[log.action_type] || log.action_type }}
                  </span>
                </td>
                <td class="py-2 pr-4">{{ log.description }}</td>
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
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">İstifadəçilər</h2>
          <button
            @click="showNewUserForm = !showNewUserForm"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
          >
            {{ showNewUserForm ? "Bağla" : "+ Yeni Satıcı" }}
          </button>
        </div>

        <form
          v-if="showNewUserForm"
          @submit.prevent="handleCreateUser"
          class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 p-4 bg-gray-50 rounded-lg"
        >
          <input
            v-model="newUser.full_name"
            type="text"
            required
            placeholder="Ad Soyad"
            class="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            v-model="newUser.username"
            type="text"
            required
            placeholder="İstifadəçi adı"
            class="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            v-model="newUser.password"
            type="password"
            required
            placeholder="Şifrə"
            class="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <select
            v-model="newUser.role"
            class="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="seller">Satıcı</option>
            <option value="admin">Admin</option>
          </select>
          <select
            v-if="newUser.role === 'seller'"
            v-model="newUser.assigned_kiosk_id"
            required
            class="px-3 py-2 border border-gray-300 rounded-lg md:col-span-2"
          >
            <option value="" disabled>Kiosk seçin</option>
            <option
              v-for="kiosk in kioskStore.kiosks"
              :key="kiosk.kiosk_id"
              :value="kiosk.kiosk_id"
            >
              {{ kiosk.kiosk_name }}
            </option>
          </select>
          <button
            type="submit"
            class="md:col-span-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            Yarat
          </button>
        </form>

        <div v-if="userStore.loading" class="text-gray-600">Yüklənir...</div>
        <div v-else class="space-y-2">
          <div
            v-for="user in userStore.users"
            :key="user.user_id"
            class="p-4 border border-gray-200 rounded-lg"
          >
            <div
              v-if="editingUserId !== user.user_id"
              class="flex justify-between items-center"
            >
              <div>
                <h3 class="font-medium">
                  {{ user.full_name }} ({{ user.username }})
                </h3>
                <p class="text-sm text-gray-600">
                  {{ user.role === "admin" ? "Admin" : "Satıcı" }}
                  <span v-if="user.assignedKiosk">
                    · {{ user.assignedKiosk.kiosk_name }}</span
                  >
                </p>
              </div>
              <div class="flex items-center gap-3">
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
                <button
                  @click="startEditUser(user)"
                  class="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                >
                  Redaktə et
                </button>
              </div>
            </div>

            <form
              v-else
              @submit.prevent="handleUpdateUser(user.user_id)"
              class="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              <input
                v-model="editUser.full_name"
                type="text"
                required
                placeholder="Ad Soyad"
                class="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                v-model="editUser.password"
                type="password"
                placeholder="Yeni şifrə (dəyişmək istəmirsinizsə boş buraxın)"
                class="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <select
                v-if="user.role === 'seller'"
                v-model="editUser.assigned_kiosk_id"
                class="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option
                  v-for="kiosk in kioskStore.kiosks"
                  :key="kiosk.kiosk_id"
                  :value="kiosk.kiosk_id"
                >
                  {{ kiosk.kiosk_name }}
                </option>
              </select>
              <label class="flex items-center gap-2 text-sm">
                <input type="checkbox" v-model="editUser.is_active" />
                Aktiv
              </label>
              <div class="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  class="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  Yadda saxla
                </button>
                <button
                  type="button"
                  @click="editingUserId = null"
                  class="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                >
                  Ləğv et
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useKioskStore } from "../../stores/kiosk";
import { useReportStore } from "../../stores/report";
import { useUserStore } from "../../stores/user";
import { useProductStore } from "../../stores/product";
import { useActivityStore } from "../../stores/activity";

const authStore = useAuthStore();
const kioskStore = useKioskStore();
const reportStore = useReportStore();
const userStore = useUserStore();
const productStore = useProductStore();
const activityStore = useActivityStore();

const activeTab = ref("dashboard");

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "kiosks", label: "Kiosklar" },
  { id: "products", label: "Məhsullar" },
  { id: "history", label: "Məhsul Tarixçəsi" },
  { id: "users", label: "İstifadəçilər" },
  { id: "activity", label: "Fəaliyyət Jurnalı" },
];

const actionLabels = {
  LOGIN: "Giriş",
  LOGOUT: "Çıxış",
  CREATE_PRODUCT: "Məhsul əlavə edildi",
  UPDATE_PRODUCT: "Məhsul yeniləndi",
  DELETE_PRODUCT: "Məhsul silindi",
  CREATE_SALE: "Satış",
  CREATE_KIOSK: "Kiosk yaradıldı",
  UPDATE_KIOSK: "Kiosk yeniləndi",
  CREATE_USER: "İstifadəçi yaradıldı",
  UPDATE_USER: "İstifadəçi yeniləndi",
  DELETE_USER: "İstifadəçi silindi",
};

// --- Activity Log filters ---
const activityFilters = ref({
  startDate: "",
  endDate: "",
  kioskId: "",
  userId: "",
  action: "",
  product: "",
});

const uniqueProductNames = computed(() => {
  const names = new Set(
    productStore.allProducts.map((p) => p.product_name).filter(Boolean),
  );
  return Array.from(names).sort();
});

function applyActivityFilters() {
  activityStore.fetchLogs({ ...activityFilters.value });
}

function clearActivityFilters() {
  activityFilters.value = {
    startDate: "",
    endDate: "",
    kioskId: "",
    userId: "",
    action: "",
    product: "",
  };
  activityStore.fetchLogs();
}

// --- Kiosks ---
const showNewKioskForm = ref(false);
const newKioskName = ref("");
const editingKioskId = ref(null);
const editKioskName = ref("");
const editKioskActive = ref(true);

async function handleCreateKiosk() {
  const ok = await kioskStore.createKiosk(newKioskName.value.trim());
  if (ok) {
    newKioskName.value = "";
    showNewKioskForm.value = false;
  }
}

function startEditKiosk(kiosk) {
  editingKioskId.value = kiosk.kiosk_id;
  editKioskName.value = kiosk.kiosk_name;
  editKioskActive.value = kiosk.is_active;
}

async function handleUpdateKiosk(kioskId) {
  const ok = await kioskStore.updateKiosk(kioskId, {
    kiosk_name: editKioskName.value.trim(),
    is_active: editKioskActive.value,
  });
  if (ok) editingKioskId.value = null;
}

// --- Products (cross-kiosk) ---
const showNewProductForm = ref(false);
const productFilterKiosk = ref("");
const productFilterSearch = ref("");
const newProduct = ref({
  kiosk_id: "",
  product_name: "",
  product_code: "",
  barcode: "",
  price: null,
  stock_quantity: null,
});

function loadAllProducts() {
  productStore.fetchAllProducts({
    kioskId: productFilterKiosk.value || undefined,
    search: productFilterSearch.value || undefined,
  });
}

async function handleCreateProduct() {
  const ok = await productStore.addProduct(
    newProduct.value.kiosk_id,
    newProduct.value,
  );
  if (ok) {
    newProduct.value = {
      kiosk_id: "",
      product_name: "",
      product_code: "",
      barcode: "",
      price: null,
      stock_quantity: null,
    };
    showNewProductForm.value = false;
    loadAllProducts();
  }
}

// --- Users ---
const showNewUserForm = ref(false);
const newUser = ref({
  full_name: "",
  username: "",
  password: "",
  role: "seller",
  assigned_kiosk_id: "",
});
const editingUserId = ref(null);
const editUser = ref({
  username: "",
  full_name: "",
  role: "seller",
  password: "",
  assigned_kiosk_id: "",
  is_active: true,
});

async function handleCreateUser() {
  const payload = { ...newUser.value };
  if (payload.role !== "seller") delete payload.assigned_kiosk_id;
  const ok = await userStore.createUser(payload);
  if (ok) {
    newUser.value = {
      full_name: "",
      username: "",
      password: "",
      role: "seller",
      assigned_kiosk_id: "",
    };
    showNewUserForm.value = false;
  }
}

function startEditUser(user) {
  editingUserId.value = user.user_id;
  editUser.value = {
    username: user.username,
    full_name: user.full_name,
    role: user.role,
    password: "",
    assigned_kiosk_id: user.assigned_kiosk_id || "",
    is_active: user.is_active,
  };
}

async function handleUpdateUser(userId) {
  const payload = {
    username: editUser.value.username,
    full_name: editUser.value.full_name,
    role: editUser.value.role,
    assigned_kiosk_id: editUser.value.assigned_kiosk_id || undefined,
    is_active: editUser.value.is_active,
  };
  if (editUser.value.password) payload.password = editUser.value.password;
  const ok = await userStore.updateUser(userId, payload);
  if (ok) editingUserId.value = null;
}

onMounted(() => {
  kioskStore.fetchKiosks();
  reportStore.fetchDashboardStats();
  reportStore.fetchProductHistory();
  userStore.fetchUsers();
  loadAllProducts();
  activityStore.fetchLogs();
});
</script>
