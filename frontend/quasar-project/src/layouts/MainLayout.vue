<template>
  <q-layout view="lHh Lpr lFf">

    <!-- Top Toolbar -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="drawerOpen = !drawerOpen" />
        <q-toolbar-title>Employee Management App</q-toolbar-title>
        <q-btn flat label="Dashboard" />
        <q-btn flat label="Employees" />
        <q-btn flat label="Reports" />
      </q-toolbar>
    </q-header>

    <!-- Left Drawer / Hamburger Panel -->
    <q-drawer v-model="drawerOpen" show-if-above side="left" bordered width="220">
      <q-list padding>
        <q-item clickable v-ripple @click="navigate('dashboard')">
          <q-item-section>Dashboard</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="navigate('employees')">
          <q-item-section>Employees</q-item-section>
        </q-item>
        <q-item clickable v-ripple>
          <q-item-section>Reports</q-item-section>
          <q-item-section side>
            <q-btn flat dense icon="keyboard_arrow_down" />
          </q-item-section>
        </q-item>
        <q-item clickable class="q-pl-md" @click="navigate('reports/daily')">
          <q-item-section>Daily Report</q-item-section>
        </q-item>
        <q-item clickable class="q-pl-md" @click="navigate('reports/monthly')">
          <q-item-section>Monthly Report</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Main Page Content -->
    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { ref } from 'vue';

const drawerOpen = ref(false);

const navigate = (path) => {
  if (path) {
    // router.push({ name: path });
    console.log("Navigate to:", path);
  }
};
</script>

<style scoped>
/* Optional styling */
</style>
