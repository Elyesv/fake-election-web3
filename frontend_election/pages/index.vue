<script setup lang="ts">
import { ethers } from "ethers";
import { ref } from "vue";
import VoteAbi from "@/abis/Vote.json";

const contractAddress = "0x536B5604191f22A7a6fb5f068f6077c4AAD0B2cC";

const candidates = ref<{ id: number; name: string }[]>([]);
const isConnecting = ref(false);
const contract = ref(null);
const metaMaskLogged = ref(false);
const isElectionActive = ref(true);
const winner = ref(null);

const results = ref<{ candidate: string; votes: number }[]>([]);
const formattedResults = ref<{ candidate: string; votes: number }[]>([]);

const connectMetaMask = async () => {
  if (typeof window.ethereum === "undefined") {
    console.error("MetaMask is not installed");
    return;
  }

  if (isConnecting.value) {
    return;
  }

  isConnecting.value = true;

  // return early if already connected
  const accounts = await window.ethereum.request({ method: "eth_accounts" });
  if (accounts.length > 0) {
    isConnecting.value = true;

    const provider = new ethers.BrowserProvider(window.ethereum);
    contract.value = new ethers.Contract(
      contractAddress,
      VoteAbi.abi,
      await provider.getSigner()
    );
    metaMaskLogged.value = true;
    isElectionActive.value = await contract.value.isElectionActive();
    if (!isElectionActive.value) {
      winner.value = await contract.value.getWinner();
      seeResults();
    } else fetchCandidates();
    return;
  }
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });

    const provider = new ethers.BrowserProvider(window.ethereum);
    contract.value = new ethers.Contract(
      contractAddress,
      VoteAbi.abi,
      await provider.getSigner()
    );
    metaMaskLogged.value = false;
    isElectionActive.value = await contract.value.isElectionActive();
    if (!isElectionActive.value) {
      winner.value = await contract.value.getWinner();

      seeResults();
    } else fetchCandidates();
  } catch (err) {
    console.error("Error connecting to MetaMask:", err);
  } finally {
    isConnecting.value = false;
  }
};

async function fetchCandidates() {
  if (typeof window.ethereum === "undefined") return;

  try {
    const result = await contract.value.getAllCandidates();

    candidates.value = result.map((candidate: any, index: number) => ({
      id: index,
      name: candidate,
    }));
  } catch (err) {
    console.error("Error fetching candidates:", err);
  }
}

const registerVoter = () => {
  if (!contract.value) {
    console.error(
      "Contract is not initialized. Please connect MetaMask first."
    );
    return;
  }

  try {
    contract.value.registerVoter();
  } catch (err) {
    console.error("Error registering voter:", err);
  }
};

const seeResults = () => {
  if (!contract.value) {
    console.error(
      "Contract is not initialized. Please connect MetaMask first."
    );
    return;
  }

  try {
    contract.value.getAllVotes().then((results: any) => {
      const namesObj = results[0];
      const votesObj = results[1];
      const keys = Object.keys(namesObj);

      formattedResults.value = keys.map((key) => ({
        candidate: namesObj[key],
        votes: Number(votesObj[key] ?? 0n),
      }));
    });
  } catch (err) {
    console.error("Error fetching results:", err);
  }
};
</script>

<template>
  <div class="p-4">
    <div class="flex">
      <UColorModeSwitch />
    </div>

    <div class="max-w-4xl mx-auto px-4 py-8">
      <UPageCard
        title="Vote now!"
        orientation="horizontal"
        spotlight
        spotlight-color="primary"
      >
        <template #description>
          <p>Register as a voter and cast your vote for the candidates</p>
          <p>The vote is over when a candidate reach 2 votes.</p>
        </template>
        <div class="flex flex-col gap-4">
          <UButton
            v-if="!metaMaskLogged"
            color="neutral"
            size="md"
            class="w-fit"
            @click="connectMetaMask"
            >Connect MetaMask</UButton
          >
          <UButton
            v-if="metaMaskLogged && isElectionActive"
            color="neutral"
            size="md"
            class="w-fit"
            @click="registerVoter"
            >Register as a voter</UButton
          >
          <div
            v-if="metaMaskLogged && isElectionActive"
            class="grid grid-cols-2 gap-2"
          >
            <UButton
              v-for="candidate in candidates"
              :key="candidate.id"
              color="primary"
              size="md"
              @click="() => contract.vote(candidate.name)"
            >
              Vote for {{ candidate.name }}
            </UButton>
          </div>
          <UButton
            v-if="metaMaskLogged && isElectionActive"
            color="neutral"
            size="md"
            class="w-fit"
            @click="seeResults"
            >See results</UButton
          >
        </div>
      </UPageCard>
      <div class="w-full mx-auto mt-8 flex items-center justify-center gap-4">
        <p v-if="!isElectionActive && winner" class="text-4xl">
          The winner is {{ winner }}
        </p>

        <VotesPieChart
          v-if="formattedResults.length"
          :results="formattedResults"
        />
      </div>
    </div>
  </div>
</template>
