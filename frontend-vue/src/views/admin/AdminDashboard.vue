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
          @click="setActiveTab(tab.id)"
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

      <!-- Statistics Tab -->
      <div
        v-else-if="activeTab === 'statistics'"
        class="bg-white rounded-xl shadow-sm p-6"
      >
        <h2 class="text-xl font-semibold mb-4">Statistika</h2>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div>
            <label class="block text-xs text-gray-500 mb-1">Kiosk</label>
            <select
              v-model="statsFilters.kioskId"
              class="w-full px-3 py-2 border rounded-lg text-sm"
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
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Tarixdən</label>
            <input
              v-model="statsFilters.startDate"
              type="date"
              class="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Tarixədək</label>
            <input
              v-model="statsFilters.endDate"
              type="date"
              class="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Qruplaşdır</label>
            <select
              v-model="statsFilters.groupBy"
              class="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="day">Gün</option>
              <option value="week">Həftə</option>
              <option value="month">Ay</option>
            </select>
          </div>
        </div>

        <button
          @click="applyStatsFilters"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition mb-6"
        >
          Göstər
        </button>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-purple-600">
              {{ reportStore.stats?.totalSales ?? 0 }}
            </div>
            <div class="text-gray-600 text-sm">Satış sayı</div>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-green-600">
              {{ (reportStore.stats?.totalRevenue ?? 0).toFixed(2) }} ₼
            </div>
            <div class="text-gray-600 text-sm">Ümumi gəlir</div>
          </div>
        </div>

        <div v-if="reportStore.stats?.kioskStats?.length" class="mb-6">
          <h3 class="font-medium mb-2">Kiosklar üzrə bölgü</h3>
          <div
            class="overflow-x-auto max-h-80 overflow-y-auto border border-gray-100 rounded-lg"
          >
            <table class="w-full text-sm text-left">
              <thead
                class="text-gray-600 border-b border-gray-200 bg-gray-50 sticky top-0"
              >
                <tr>
                  <th class="py-2 px-4">Kiosk</th>
                  <th class="py-2 px-4">Satış sayı</th>
                  <th class="py-2 px-4">Cəmi</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in reportStore.stats.kioskStats"
                  :key="row.kiosk_id"
                  class="border-b border-gray-100"
                >
                  <td class="py-2 px-4">{{ row.kiosk?.kiosk_name }}</td>
                  <td class="py-2 px-4">{{ row.total_sales }}</td>
                  <td class="py-2 px-4">
                    {{ parseFloat(row.total_revenue).toFixed(2) }} ₼
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <template v-if="reportStore.salesReport.length">
          <div class="mb-6">
            <SalesBarChart
              :rows="reportStore.salesReport"
              :group-by="statsFilters.groupBy"
            />
          </div>

          <div>
            <h3 class="font-medium mb-2">Tarix üzrə bölgü</h3>
            <div
              class="overflow-x-auto max-h-80 overflow-y-auto border border-gray-100 rounded-lg"
            >
              <table class="w-full text-sm text-left">
                <thead
                  class="text-gray-600 border-b border-gray-200 bg-gray-50 sticky top-0"
                >
                  <tr>
                    <th class="py-2 px-4">Dövr</th>
                    <th class="py-2 px-4">Satış sayı</th>
                    <th class="py-2 px-4">Cəmi</th>
                    <th class="py-2 px-4">Orta</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in reportStore.salesReport"
                    :key="row.period"
                    class="border-b border-gray-100"
                  >
                    <td class="py-2 px-4 whitespace-nowrap">
                      {{ new Date(row.period).toLocaleDateString("az-AZ") }}
                    </td>
                    <td class="py-2 px-4">{{ row.total_sales }}</td>
                    <td class="py-2 px-4">
                      {{ parseFloat(row.total_revenue).toFixed(2) }} ₼
                    </td>
                    <td class="py-2 px-4">
                      {{ parseFloat(row.avg_sale).toFixed(2) }} ₼
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>

        <p v-else class="text-gray-500 text-sm">
          Tarix üzrə bölgünü görmək üçün tarix aralığı seçib "Göstər" düyməsini
          basın.
        </p>
      </div>

      <!-- Kiosks Tab -->
      <div
        v-else-if="activeTab === 'kiosks'"
        class="bg-white rounded-xl shadow-sm p-6"
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Kiosklar</h2>
          <button
            @click="toggleNewKioskForm"
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
          <p v-if="kioskStore.error" class="w-full text-red-600 text-sm">
            {{ kioskStore.error }}
          </p>
        </form>

        <div class="space-y-2 max-h-[32rem] overflow-y-auto pr-1">
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
                <p class="text-sm mt-1">
                  <span
                    v-if="activeShiftsByKiosk[kiosk.kiosk_id]?.length"
                    class="text-green-700"
                  >
                    Növbə açıq:
                    {{
                      activeShiftsByKiosk[kiosk.kiosk_id]
                        .map((s) => s.user?.full_name)
                        .join(", ")
                    }}
                  </span>
                  <span v-else class="text-gray-400"
                    >Növbə bağlıdır (heç kim təhvil almayıb)</span
                  >
                </p>
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
                  @click="openShiftHistory(kiosk)"
                  class="px-3 py-1 text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition"
                >
                  Növbə tarixçəsi
                </button>
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
            @click="toggleNewProductForm"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
          >
            {{ showNewProductForm ? "Bağla" : "+ Məhsul Əlavə Et" }}
          </button>
        </div>
        <p v-if="productFormSuccess" class="text-green-600 text-sm mb-4">
          {{ productFormSuccess }}
        </p>

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
          <p
            v-if="barcodeMatchHint"
            class="md:col-span-3 text-sm text-indigo-700"
          >
            {{ barcodeMatchHint }}
          </p>
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
          <p v-if="productStore.error" class="md:col-span-3 text-red-600 text-sm">
            {{ productStore.error }}
          </p>
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
        <div v-else class="overflow-x-auto max-h-[32rem] overflow-y-auto">
          <table class="w-full text-sm text-left">
            <thead
              class="text-gray-600 border-b border-gray-200 bg-white sticky top-0"
            >
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
        <div v-else class="overflow-x-auto max-h-[32rem] overflow-y-auto">
          <table class="w-full text-sm text-left">
            <thead
              class="text-gray-600 border-b border-gray-200 bg-white sticky top-0"
            >
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

        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
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
        <div v-else class="overflow-x-auto max-h-[32rem] overflow-y-auto">
          <table class="w-full text-sm text-left">
            <thead
              class="text-gray-600 border-b border-gray-200 bg-white sticky top-0"
            >
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
            @click="toggleNewUserForm"
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
          <p v-if="userStore.error" class="md:col-span-2 text-red-600 text-sm">
            {{ userStore.error }}
          </p>
        </form>

        <div v-if="userStore.loading" class="text-gray-600">Yüklənir...</div>
        <div v-else class="space-y-2 max-h-[32rem] overflow-y-auto pr-1">
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

    <!-- Shift History Modal -->
    <div
      v-if="showShiftHistoryModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div
        class="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col"
      >
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold">
            Növbə tarixçəsi · {{ shiftHistoryKioskName }}
          </h3>
          <button
            @click="closeShiftHistory"
            class="text-gray-500 hover:text-gray-700 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div v-if="shiftStore.historyLoading" class="text-gray-600">
          Yüklənir...
        </div>
        <div
          v-else-if="shiftStore.shiftHistory.length === 0"
          class="text-gray-600"
        >
          Bu kiosk üçün növbə qeydi tapılmadı.
        </div>
        <div v-else class="overflow-y-auto flex-1 space-y-2">
          <div
            v-for="s in shiftStore.shiftHistory"
            :key="s.shift_id"
            class="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-indigo-50"
            @click="viewShiftSales(s)"
          >
            <div class="flex justify-between items-center">
              <div>
                <p class="font-medium">{{ s.user?.full_name }}</p>
                <p class="text-xs text-gray-500">
                  Alındı:
                  {{ new Date(s.taken_over_at).toLocaleString("az-AZ") }}
                  <template v-if="s.handed_over_at">
                    · Verildi:
                    {{ new Date(s.handed_over_at).toLocaleString("az-AZ") }}
                  </template>
                </p>
              </div>
              <div class="text-right">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs',
                    s.handed_over_at
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-green-100 text-green-700',
                  ]"
                >
                  {{ s.handed_over_at ? "Bağlı" : "Açıq" }}
                </span>
                <p class="text-sm font-semibold text-indigo-600 mt-1">
                  {{ s.summary.salesCount }} satış ·
                  {{ s.summary.totalAmount.toFixed(2) }} ₼
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          @click="closeShiftHistory"
          class="w-full mt-4 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg transition"
        >
          Bağla
        </button>
      </div>
    </div>

    <!-- Shift Sales Drilldown Modal -->
    <div
      v-if="shiftStore.selectedShiftSales || shiftStore.selectedShiftLoading"
      class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4"
    >
      <div
        class="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col"
      >
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold">Növbənin satışları</h3>
          <button
            @click="shiftStore.clearSelectedShiftSales()"
            class="text-gray-500 hover:text-gray-700 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div v-if="shiftStore.selectedShiftLoading" class="text-gray-600">
          Yüklənir...
        </div>
        <template v-else-if="shiftStore.selectedShiftSales">
          <p class="text-sm text-gray-600 mb-3">
            {{ shiftStore.selectedShiftSales.count }} satış ·
            {{ shiftStore.selectedShiftSales.totalAmount.toFixed(2) }} ₼
          </p>
          <div
            v-if="shiftStore.selectedShiftSales.sales.length === 0"
            class="text-gray-600"
          >
            Bu növbədə satış edilməyib.
          </div>
          <div v-else class="overflow-y-auto flex-1 space-y-2">
            <div
              v-for="sale in shiftStore.selectedShiftSales.sales"
              :key="sale.sale_id"
              class="p-3 border border-gray-200 rounded-lg"
            >
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm text-gray-600">{{
                  new Date(sale.sale_date).toLocaleString("az-AZ")
                }}</span>
                <span class="font-semibold text-indigo-600"
                  >{{ parseFloat(sale.total_amount).toFixed(2) }} ₼ ({{
                    sale.payment_method === "CASH" ? "Nağd" : "Kart"
                  }})</span
                >
              </div>
              <ul class="text-sm text-gray-700 list-disc list-inside">
                <li v-for="item in sale.items" :key="item.sale_item_id">
                  {{ item.product?.name }} × {{ item.quantity }} =
                  {{ parseFloat(item.subtotal).toFixed(2) }} ₼
                </li>
              </ul>
            </div>
          </div>
        </template>

        <button
          @click="shiftStore.clearSelectedShiftSales()"
          class="w-full mt-4 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg transition"
        >
          Bağla
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useKioskStore } from "../../stores/kiosk";
import { useReportStore } from "../../stores/report";
import { useUserStore } from "../../stores/user";
import { useProductStore } from "../../stores/product";
import { useActivityStore } from "../../stores/activity";
import { useShiftStore } from "../../stores/shift";
import SalesBarChart from "../../components/SalesBarChart.vue";

const authStore = useAuthStore();
const kioskStore = useKioskStore();
const reportStore = useReportStore();
const userStore = useUserStore();
const productStore = useProductStore();
const activityStore = useActivityStore();
const shiftStore = useShiftStore();

const activeTab = ref("dashboard");

function toLocalDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function emptyNewProduct() {
  return {
    kiosk_id: "",
    product_name: "",
    product_code: "",
    barcode: "",
    price: null,
    stock_quantity: null,
  };
}

function emptyNewUser() {
  return {
    full_name: "",
    username: "",
    password: "",
    role: "seller",
    assigned_kiosk_id: "",
  };
}

function setActiveTab(tabId) {
  if (activeTab.value !== tabId) {
    resetTransientForms();
  }
  activeTab.value = tabId;
}

function resetTransientForms() {
  if (showNewProductForm.value) closeNewProductForm();
  if (showNewKioskForm.value) closeNewKioskForm();
  if (showNewUserForm.value) closeNewUserForm();
}

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "statistics", label: "Statistika" },
  { id: "kiosks", label: "Kiosklar" },
  { id: "products", label: "Məhsullar" },
  { id: "history", label: "Məhsul Tarixçəsi" },
  { id: "users", label: "İstifadəçilər" },
  { id: "activity", label: "Fəaliyyət Jurnalı" },
];

// --- Statistics ---
const statsFilters = ref({
  kioskId: "",
  startDate: "",
  endDate: "",
  groupBy: "day",
});

function applyStatsFilters() {
  const params = {};
  if (statsFilters.value.kioskId) params.kioskId = statsFilters.value.kioskId;
  if (statsFilters.value.startDate)
    params.startDate = statsFilters.value.startDate;
  if (statsFilters.value.endDate) params.endDate = statsFilters.value.endDate;

  reportStore.fetchDashboardStats(params);

  if (statsFilters.value.startDate && statsFilters.value.endDate) {
    reportStore.fetchSalesReport({
      ...params,
      groupBy: statsFilters.value.groupBy,
    });
  }
}

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
  SHIFT_TAKEOVER: "Növbə təhvil alındı",
  SHIFT_HANDOVER: "Növbə təhvil verildi",
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

function closeNewKioskForm() {
  showNewKioskForm.value = false;
  newKioskName.value = "";
  kioskStore.error = null;
}

function toggleNewKioskForm() {
  if (showNewKioskForm.value) {
    closeNewKioskForm();
    return;
  }
  kioskStore.error = null;
  newKioskName.value = "";
  showNewKioskForm.value = true;
}

const activeShiftsByKiosk = computed(() => {
  const map = {};
  for (const s of shiftStore.activeShifts) {
    if (!map[s.kiosk_id]) map[s.kiosk_id] = [];
    map[s.kiosk_id].push(s);
  }
  return map;
});

const showShiftHistoryModal = ref(false);
const shiftHistoryKioskName = ref("");

function openShiftHistory(kiosk) {
  shiftHistoryKioskName.value = kiosk.kiosk_name;
  showShiftHistoryModal.value = true;
  shiftStore.fetchShiftHistory(kiosk.kiosk_id);
}

function closeShiftHistory() {
  showShiftHistoryModal.value = false;
  shiftStore.clearSelectedShiftSales();
}

function viewShiftSales(shift) {
  shiftStore.fetchShiftSales(shift.shift_id);
}

async function handleCreateKiosk() {
  const ok = await kioskStore.createKiosk(newKioskName.value.trim());
  if (ok) closeNewKioskForm();
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
const newProduct = ref(emptyNewProduct());
const barcodeMatchHint = ref("");
const productFormSuccess = ref("");
const autoFilledFromBarcode = ref(null);
let barcodeLookupTimer = null;

function closeNewProductForm() {
  showNewProductForm.value = false;
  newProduct.value = emptyNewProduct();
  barcodeMatchHint.value = "";
  productFormSuccess.value = "";
  autoFilledFromBarcode.value = null;
  productStore.error = null;
}

function toggleNewProductForm() {
  if (showNewProductForm.value) {
    closeNewProductForm();
    return;
  }
  productStore.error = null;
  productFormSuccess.value = "";
  newProduct.value = emptyNewProduct();
  barcodeMatchHint.value = "";
  autoFilledFromBarcode.value = null;
  showNewProductForm.value = true;
}

async function lookupExistingProduct() {
  const barcode = (newProduct.value.barcode || "").trim();
  const productCode = (newProduct.value.product_code || "").trim();

  if (!barcode && !productCode) {
    if (autoFilledFromBarcode.value) {
      newProduct.value.product_name = "";
      autoFilledFromBarcode.value = null;
    }
    barcodeMatchHint.value = "";
    return;
  }

  const data = await productStore.lookupProduct({
    barcode: barcode || undefined,
    product_code: barcode ? undefined : productCode || undefined,
    kioskId: newProduct.value.kiosk_id || undefined,
  });

  if (data?.found && data.product) {
    newProduct.value.product_name = data.product.name || "";
    if (data.product.product_code && !newProduct.value.product_code) {
      newProduct.value.product_code = data.product.product_code;
    }
    if (data.product.price != null && newProduct.value.price == null) {
      newProduct.value.price = data.product.price;
    }
    autoFilledFromBarcode.value = barcode || productCode;
    barcodeMatchHint.value = data.product.existsInKiosk
      ? `"${data.product.name}" artıq bu kioskdadır (stok: ${data.product.stock_quantity}). Əlavə etdikdə say artırılacaq.`
      : `"${data.product.name}" tapıldı. Ad avtomatik dolduruldu.`;
    return;
  }

  if (autoFilledFromBarcode.value) {
    newProduct.value.product_name = "";
    autoFilledFromBarcode.value = null;
  }
  barcodeMatchHint.value = "";
}

watch(
  () => [
    newProduct.value.barcode,
    newProduct.value.product_code,
    newProduct.value.kiosk_id,
  ],
  () => {
    clearTimeout(barcodeLookupTimer);
    barcodeLookupTimer = setTimeout(lookupExistingProduct, 300);
  },
);

function loadAllProducts() {
  productStore.fetchAllProducts({
    kioskId: productFilterKiosk.value || undefined,
    search: productFilterSearch.value || undefined,
  });
}

async function handleCreateProduct() {
  productFormSuccess.value = "";
  const result = await productStore.addProduct(
    newProduct.value.kiosk_id,
    newProduct.value,
  );
  if (result?.ok) {
    productFormSuccess.value =
      result.message || "Məhsul uğurla əlavə edildi.";
    newProduct.value = emptyNewProduct();
    barcodeMatchHint.value = "";
    autoFilledFromBarcode.value = null;
    showNewProductForm.value = false;
    loadAllProducts();
    setTimeout(() => {
      productFormSuccess.value = "";
    }, 4000);
  }
}

// --- Users ---
const showNewUserForm = ref(false);
const newUser = ref(emptyNewUser());

function closeNewUserForm() {
  showNewUserForm.value = false;
  newUser.value = emptyNewUser();
  userStore.error = null;
}

function toggleNewUserForm() {
  if (showNewUserForm.value) {
    closeNewUserForm();
    return;
  }
  userStore.error = null;
  newUser.value = emptyNewUser();
  showNewUserForm.value = true;
}
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
  if (ok) closeNewUserForm();
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
  shiftStore.fetchActiveShifts();

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  statsFilters.value.startDate = toLocalDateInput(start);
  statsFilters.value.endDate = toLocalDateInput(end);
  reportStore.fetchSalesReport({
    startDate: statsFilters.value.startDate,
    endDate: statsFilters.value.endDate,
    groupBy: statsFilters.value.groupBy,
  });
});
</script>
