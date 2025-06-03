<script setup lang="ts">
import { ethers } from "ethers";
import { ref } from "vue";
import VoteAbi from "@/abis/Vote.json";

const contractAddress = "0xeaa071BcD742dBb5901ECaFf74E28b503c0d1649";

const candidates = ref<{ id: number; name: string }[]>([]);
const isConnecting = ref(false);
const contract = ref(null);
const metaMaskLogged = ref(false);

const results = ref<{ candidate: string; votes: number }[]>([]);
const formattedResults = ref<{ candidate: string; votes: number }[]>([]);

const connectMetaMask = async () => {
  if (typeof window.ethereum === "undefined") {
    console.error("MetaMask is not installed");
    return;
  }

  if (isConnecting.value) {
    console.log("Connection already in progress. Please wait.");
    return;
  }

  isConnecting.value = true;

  // return early if already connected
  const accounts = await window.ethereum.request({ method: "eth_accounts" });
  if (accounts.length > 0) {
    console.log("MetaMask already connected with account:", accounts[0]);
    isConnecting.value = true;

    const provider = new ethers.BrowserProvider(window.ethereum);
    contract.value = new ethers.Contract(
      contractAddress,
      VoteAbi.abi,
      await provider.getSigner()
    );
    metaMaskLogged.value = true;

    fetchCandidates();
    return;
  }
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    console.log("MetaMask connected");
    const provider = new ethers.BrowserProvider(window.ethereum);
    contract.value = new ethers.Contract(
      contractAddress,
      VoteAbi.abi,
      await provider.getSigner()
    );
    metaMaskLogged.value = false;

    fetchCandidates();
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
    console.log("Voter registered successfully");
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

      console.log("Formatted results:", formattedResults.value);
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
        description="Register as a voter and cast your vote for the candidates."
        orientation="horizontal"
        spotlight
        spotlight-color="primary"
      >
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
            v-if="metaMaskLogged"
            color="neutral"
            size="md"
            class="w-fit"
            @click="registerVoter"
            >Register as a voter</UButton
          >
          <div v-if="metaMaskLogged" class="grid grid-cols-2 gap-2">
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
            v-if="metaMaskLogged"
            color="neutral"
            size="md"
            class="w-fit"
            @click="seeResults"
            >See results</UButton
          >
        </div>
      </UPageCard>
      <VotesPieChart
        v-if="formattedResults.length"
        :results="formattedResults"
      />
    </div>
  </div>
</template>
