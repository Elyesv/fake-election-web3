<script setup lang="ts">
import { Pie } from "vue-chartjs";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps<{
  results: { candidate: string; votes: number }[];
}>();

const labels = props.results.map((r) => r.candidate);
const data = {
  labels,
  datasets: [
    {
      label: "Votes",
      data: props.results.map((r) => r.votes),
      backgroundColor: [
        "#3b82f6",
        "#f97316",
        "#22c55e",
        "#eab308",
        "#8b5cf6",
        "#ec4899",
        "#06b6d4",
      ],
      borderWidth: 1,
    },
  ],
};
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
    },
  },
};
</script>

<template>
  <div style="height: 300px; max-width: 400px">
    <Pie :data="data" :options="options" />
  </div>
</template>
