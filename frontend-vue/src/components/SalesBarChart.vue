<template>
  <div>
    <h3 class="font-medium mb-3">{{ title }}</h3>
    <p v-if="!rows.length" class="text-gray-500 text-sm">
      Seçilmiş tarix aralığında satış tapılmadı.
    </p>
    <div
      v-else
      class="bg-gray-50 border border-gray-100 rounded-lg p-4 overflow-x-auto"
    >
      <div class="flex items-end gap-2 min-h-[16rem] min-w-max">
        <div
          v-for="row in rows"
          :key="row.period"
          class="flex flex-col items-center justify-end w-14 shrink-0"
        >
          <span class="text-[11px] font-semibold text-gray-700 mb-1 text-center leading-tight">
            {{ formatAmount(row.total_revenue) }}
          </span>
          <div
            class="w-9 rounded-t-md bg-indigo-500 hover:bg-indigo-600 transition-colors"
            :style="{ height: barHeight(row.total_revenue) }"
            :title="`${formatDate(row.period)}: ${formatAmount(row.total_revenue)} ₼`"
          ></div>
          <span class="text-[10px] text-gray-500 mt-2 text-center leading-tight">
            {{ formatDate(row.period) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  groupBy: {
    type: String,
    default: "day",
  },
});

const title = computed(() => {
  if (props.groupBy === "week") return "Həftəlik satışlar (₼)";
  if (props.groupBy === "month") return "Aylıq satışlar (₼)";
  return "Günlük satışlar (₼)";
});

const maxRevenue = computed(() => {
  const values = props.rows.map((row) => parseFloat(row.total_revenue) || 0);
  return Math.max(0, ...values);
});

function formatAmount(value) {
  return (parseFloat(value) || 0).toFixed(2);
}

function formatDate(period) {
  if (!period) return "";
  const date = new Date(period);
  if (Number.isNaN(date.getTime())) return String(period);
  if (props.groupBy === "month") {
    return date.toLocaleDateString("az-AZ", { year: "numeric", month: "short" });
  }
  return date.toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit" });
}

function barHeight(value) {
  const amount = parseFloat(value) || 0;
  if (maxRevenue.value <= 0) return "8px";
  const pct = Math.max(8, (amount / maxRevenue.value) * 200);
  return `${pct}px`;
}
</script>
