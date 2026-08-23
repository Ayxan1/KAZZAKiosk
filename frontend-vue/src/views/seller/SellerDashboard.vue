<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center"
      >
        <div>
          <h1 class="text-2xl font-bold text-gray-800">KAZZAKIOSK</h1>
          <p class="text-sm text-gray-600">
            Seller Panel - {{ authStore.user?.full_name }}
          </p>
        </div>
        <div class="flex gap-2">
          <button
            @click="openShiftModal"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
          >
            Gündəlik
          </button>
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

      <!-- Sales Tab -->
      <div
        v-if="activeTab === 'sales'"
        class="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <!-- Products List -->
        <div class="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <input
            ref="barcodeInputEl"
            v-model="barcodeInput"
            @keyup.enter="handleBarcodeScan"
            type="text"
            placeholder="Barkodu skan edin (avtomatik səbətə əlavə olunur)..."
            class="w-full px-4 py-2 border-2 border-indigo-400 rounded-lg mb-2 focus:ring-2 focus:ring-indigo-500"
          />
          <p
            v-if="barcodeMessage"
            :class="[
              'text-sm mb-2',
              barcodeMessageOk ? 'text-green-600' : 'text-red-600',
            ]"
          >
            {{ barcodeMessage }}
          </p>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Məhsul axtar..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
          />
          <div class="space-y-2 max-h-96 overflow-y-auto">
            <div
              v-for="product in filteredProducts"
              :key="product.product_id"
              @click="salesStore.addToCart(product)"
              class="p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 cursor-pointer transition"
            >
              <div class="flex justify-between">
                <div>
                  <h3 class="font-medium">{{ product.product_name }}</h3>
                  <p class="text-sm text-gray-600">
                    Stok: {{ product.stock_quantity }}
                  </p>
                </div>
                <span class="text-lg font-semibold text-indigo-600"
                  >{{ product.price }} ₼</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Cart -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h2 class="text-xl font-semibold mb-4">Səbət</h2>

          <div
            v-if="!shiftStore.isOpen"
            class="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg p-3 mb-4 text-sm"
          >
            <p class="font-medium mb-2">
              ⚠️ Növbəni təhvil almamısınız. Satış edə bilməzsiniz.
            </p>
            <button
              @click="handleTakeOver"
              class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition"
            >
              Təhvil Al
            </button>
          </div>

          <div class="space-y-3 mb-4">
            <div
              v-for="item in salesStore.cart"
              :key="item.product_id"
              class="flex justify-between items-center"
            >
              <div class="flex-1">
                <p class="font-medium text-sm">{{ item.product_name }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <button
                    @click="
                      salesStore.updateQuantity(
                        item.product_id,
                        item.quantity - 1,
                      )
                    "
                    class="w-6 h-6 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span class="text-sm">{{ item.quantity }}</span>
                  <button
                    @click="
                      salesStore.updateQuantity(
                        item.product_id,
                        item.quantity + 1,
                      )
                    "
                    class="w-6 h-6 bg-gray-200 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
              <div class="text-right">
                <p class="font-semibold">
                  {{ (item.price * item.quantity).toFixed(2) }} ₼
                </p>
                <button
                  @click="salesStore.removeFromCart(item.product_id)"
                  class="text-red-500 text-sm"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>

          <div class="border-t pt-4">
            <div class="flex justify-between text-xl font-bold mb-4">
              <span>Cəmi:</span>
              <span class="text-indigo-600"
                >{{ salesStore.cartTotal.toFixed(2) }} ₼</span
              >
            </div>

            <select
              v-model="paymentMethod"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            >
              <option value="CASH">Nağd</option>
              <option value="CARD">Kart</option>
            </select>

            <p
              v-if="salesStore.error"
              class="text-red-600 text-sm mb-3 font-medium"
            >
              {{ salesStore.error }}
            </p>

            <button
              @click="completeSale"
              :disabled="salesStore.cart.length === 0 || !shiftStore.isOpen"
              class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              Satışı Tamamla
            </button>
          </div>
        </div>
      </div>

      <!-- Inventory Tab -->
      <div
        v-else-if="activeTab === 'inventory'"
        class="bg-white rounded-xl shadow-sm p-6"
      >
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold">İnventar</h2>
          <button
            @click="showAddProduct = true"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
          >
            + Məhsul Əlavə Et
          </button>
        </div>

        <div class="space-y-2">
          <div
            v-for="product in productStore.products"
            :key="product.product_id"
            class="p-4 border border-gray-200 rounded-lg"
          >
            <div class="flex justify-between">
              <div>
                <h3 class="font-medium">{{ product.product_name }}</h3>
                <p class="text-sm text-gray-600">
                  Qiymət: {{ product.price }} ₼ | Stok:
                  {{ product.stock_quantity }}
                </p>
              </div>
              <button class="text-indigo-600 hover:text-indigo-700">
                Redaktə
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- History Tab -->
      <div
        v-else-if="activeTab === 'history'"
        class="bg-white rounded-xl shadow-sm p-6"
      >
        <h2 class="text-xl font-semibold mb-4">Satış Tarixçəsi</h2>
        <div v-if="salesStore.loading" class="text-gray-600">Yüklənir...</div>
        <div v-else-if="salesStore.history.length === 0" class="text-gray-600">
          Hələ heç bir satış edilməyib.
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="sale in salesStore.history"
            :key="sale.sale_id"
            class="p-4 border border-gray-200 rounded-lg"
          >
            <div class="flex justify-between items-center mb-2">
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
      </div>
    </div>

    <!-- Add Product Modal -->
    <div
      v-if="showAddProduct"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 class="text-xl font-semibold mb-4">Yeni Məhsul</h3>
        <form @submit.prevent="addProduct" class="space-y-4">
          <input
            v-model="newProduct.name"
            type="text"
            placeholder="Məhsul adı"
            required
            class="w-full px-4 py-2 border rounded-lg"
          />
          <input
            v-model="newProduct.product_code"
            type="text"
            placeholder="Kod (opsional)"
            class="w-full px-4 py-2 border rounded-lg"
          />
          <input
            v-model="newProduct.barcode"
            type="text"
            placeholder="Barkod (opsional)"
            class="w-full px-4 py-2 border rounded-lg"
          />
          <input
            v-model.number="newProduct.price"
            type="number"
            step="0.01"
            min="0"
            placeholder="Qiymət"
            required
            class="w-full px-4 py-2 border rounded-lg"
          />
          <input
            v-model.number="newProduct.stock"
            type="number"
            min="0"
            placeholder="Stok"
            required
            class="w-full px-4 py-2 border rounded-lg"
          />
          <div class="flex gap-2">
            <button
              type="submit"
              class="flex-1 bg-indigo-600 text-white py-2 rounded-lg"
            >
              Əlavə Et
            </button>
            <button
              type="button"
              @click="showAddProduct = false"
              class="flex-1 bg-gray-200 py-2 rounded-lg"
            >
              Ləğv et
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Shift (Gündəlik) Modal -->
    <div
      v-if="showShiftModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 class="text-xl font-semibold mb-4">Gündəlik</h3>

        <div v-if="shiftStore.loading" class="text-gray-600 text-sm mb-4">
          Yüklənir...
        </div>

        <template v-else>
          <p class="text-sm text-gray-600 mb-1">
            Növbə statusu:
            <span
              :class="
                shiftStore.isOpen
                  ? 'text-green-600 font-semibold'
                  : 'text-red-600 font-semibold'
              "
              >{{ shiftStore.isOpen ? "Açıq" : "Bağlı" }}</span
            >
          </p>
          <p v-if="shiftStore.shift" class="text-xs text-gray-500 mb-4">
            Təhvil alındı:
            {{
              new Date(shiftStore.shift.taken_over_at).toLocaleString("az-AZ")
            }}
            <template v-if="shiftStore.shift.handed_over_at">
              · Təhvil verildi:
              {{
                new Date(shiftStore.shift.handed_over_at).toLocaleString(
                  "az-AZ",
                )
              }}
            </template>
          </p>

          <div class="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Satış sayı:</span>
              <span class="font-medium">{{
                shiftStore.summary.salesCount
              }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Satış cəmi:</span>
              <span class="font-medium"
                >{{ shiftStore.summary.totalAmount.toFixed(2) }} ₼</span
              >
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Mənfəət:</span>
              <span class="font-medium"
                >{{ shiftStore.summary.profit.toFixed(2) }} ₼</span
              >
            </div>
          </div>

          <p
            v-if="shiftStore.error"
            class="text-red-600 text-sm mb-3 font-medium"
          >
            {{ shiftStore.error }}
          </p>

          <div class="flex gap-2">
            <button
              @click="handleTakeOver"
              :disabled="shiftStore.isOpen"
              class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition disabled:opacity-50"
            >
              Təhvil Al
            </button>
            <button
              @click="handleHandOver"
              :disabled="!shiftStore.isOpen"
              class="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition disabled:opacity-50"
            >
              Təhvil Ver
            </button>
          </div>
        </template>

        <button
          @click="showShiftModal = false"
          class="w-full mt-3 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg transition"
        >
          Bağla
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useProductStore } from "../../stores/product";
import { useSalesStore } from "../../stores/sales";
import { useShiftStore } from "../../stores/shift";

const authStore = useAuthStore();
const productStore = useProductStore();
const salesStore = useSalesStore();
const shiftStore = useShiftStore();

const showShiftModal = ref(false);

const activeTab = ref("sales");
const searchQuery = ref("");
const paymentMethod = ref("CASH");
const showAddProduct = ref(false);
const newProduct = ref({
  name: "",
  product_code: "",
  barcode: "",
  price: null,
  stock: null,
});

const barcodeInput = ref("");
const barcodeInputEl = ref(null);
const barcodeMessage = ref("");
const barcodeMessageOk = ref(false);

const tabs = [
  { id: "sales", label: "Satış (POS)" },
  { id: "inventory", label: "İnventar" },
  { id: "history", label: "Tarixçə" },
];

const filteredProducts = computed(() => {
  if (!searchQuery.value) return productStore.products;
  return productStore.products.filter((p) =>
    p.product_name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

function focusBarcodeInput() {
  nextTick(() => barcodeInputEl.value?.focus());
}

function handleBarcodeScan() {
  const code = barcodeInput.value.trim();
  barcodeInput.value = "";
  if (!code) return;

  const match = productStore.products.find(
    (p) =>
      (p.barcode && p.barcode.toLowerCase() === code.toLowerCase()) ||
      (p.product_code && p.product_code.toLowerCase() === code.toLowerCase()),
  );

  if (match) {
    const added = salesStore.addToCart(match);
    if (added) {
      barcodeMessageOk.value = true;
      barcodeMessage.value = `${match.product_name} səbətə əlavə olundu.`;
    } else {
      barcodeMessageOk.value = false;
      barcodeMessage.value =
        salesStore.error ||
        `${match.product_name} üçün kifayət qədər stok yoxdur.`;
    }
  } else {
    barcodeMessageOk.value = false;
    barcodeMessage.value = `"${code}" kodlu məhsul tapılmadı.`;
  }

  focusBarcodeInput();
}

onMounted(() => {
  const kioskId = authStore.user?.assigned_kiosk_id;
  if (kioskId) {
    productStore.fetchProducts(kioskId);
    salesStore.fetchHistory(kioskId);
  }
  shiftStore.fetchSummary();
  focusBarcodeInput();
});

function openShiftModal() {
  showShiftModal.value = true;
  shiftStore.fetchSummary();
}

async function handleTakeOver() {
  await shiftStore.takeOver();
}

async function handleHandOver() {
  await shiftStore.handOver();
}

async function completeSale() {
  if (!shiftStore.isOpen) {
    alert("Növbəni təhvil almadan satış edə bilməzsiniz.");
    return;
  }

  const kioskId = authStore.user?.assigned_kiosk_id;
  const success = await salesStore.completeSale(kioskId, paymentMethod.value);
  if (success) {
    alert("Satış uğurla tamamlandı!");
    productStore.fetchProducts(kioskId);
  } else {
    // Shift may have been handed over from elsewhere (or expired) between
    // page load and checkout - refresh status so the warning/button show up.
    shiftStore.fetchSummary();
  }
}

async function addProduct() {
  const kioskId = authStore.user?.assigned_kiosk_id;
  const success = await productStore.addProduct(kioskId, {
    product_name: newProduct.value.name,
    product_code: newProduct.value.product_code,
    barcode: newProduct.value.barcode,
    price: Number(newProduct.value.price) || 0,
    stock_quantity: Number(newProduct.value.stock) || 0,
  });

  if (success) {
    showAddProduct.value = false;
    newProduct.value = {
      name: "",
      product_code: "",
      barcode: "",
      price: null,
      stock: null,
    };
  }
}
</script>
