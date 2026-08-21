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
        <button
          @click="authStore.logout"
          class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
        >
          Çıxış
        </button>
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

            <button
              @click="completeSale"
              :disabled="salesStore.cart.length === 0"
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
        <p class="text-gray-600">Satış tarixçəsi burada görünəcək...</p>
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
            v-model="newProduct.price"
            type="number"
            step="0.01"
            placeholder="Qiymət"
            required
            class="w-full px-4 py-2 border rounded-lg"
          />
          <input
            v-model="newProduct.stock"
            type="number"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useProductStore } from "../../stores/product";
import { useSalesStore } from "../../stores/sales";

const authStore = useAuthStore();
const productStore = useProductStore();
const salesStore = useSalesStore();

const activeTab = ref("sales");
const searchQuery = ref("");
const paymentMethod = ref("CASH");
const showAddProduct = ref(false);
const newProduct = ref({ name: "", price: 0, stock: 0 });

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

onMounted(() => {
  const kioskId = authStore.user?.assigned_kiosk_id;
  if (kioskId) {
    productStore.fetchProducts(kioskId);
  }
});

async function completeSale() {
  const kioskId = authStore.user?.assigned_kiosk_id;
  const success = await salesStore.completeSale(kioskId, paymentMethod.value);
  if (success) {
    alert("Satış uğurla tamamlandı!");
    productStore.fetchProducts(kioskId);
  }
}

async function addProduct() {
  const kioskId = authStore.user?.assigned_kiosk_id;
  const success = await productStore.addProduct(kioskId, {
    product_name: newProduct.value.name,
    price: newProduct.value.price,
    stock_quantity: newProduct.value.stock,
  });

  if (success) {
    showAddProduct.value = false;
    newProduct.value = { name: "", price: 0, stock: 0 };
  }
}
</script>
