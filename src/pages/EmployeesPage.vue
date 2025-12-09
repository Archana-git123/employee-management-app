<template>
  <q-page padding>

    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5">Employees List</div>
      </div>
      <div class="col-auto">
        <q-btn label="Add Employee" color="primary" @click="showAdd = true" />
        <q-btn-group outline>
          <q-btn flat :color="viewMode==='list' ? 'primary' : ''" icon="view_list" @click="viewMode='list'" />
          <q-btn flat :color="viewMode==='grid' ? 'primary' : ''" icon="grid_view" @click="viewMode='grid'" />
        </q-btn-group>
      </div>
    </div>

    <!-- Employees Table -->
    <q-table
      v-if="viewMode === 'list'"
      :rows="employees"
      :columns="columns"
      row-key="id"
      flat
      bordered
      dense
    >
      <template v-slot:body-cell-actions="props">
        <q-td align="right">
          <q-btn size="sm" color="primary" round dense icon="edit" @click="editEmployee(props.row)" />
          <q-btn size="sm" color="negative" round dense icon="delete" @click="deleteEmployee(props.row.id)" />
        </q-td>
      </template>
    </q-table>

    <!-- Grid (Tile) View -->
    <div v-else class="row q-gutter-md">
      <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-for="emp in employees" :key="emp.id">
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ emp.name }}</div>
            <div class="text-subtitle2">{{ emp.position }}</div>
            <div class="text-subtitle2">{{ emp.department }}</div>
            <div class="text-subtitle2">Salary: {{ emp.salary }}</div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn dense round color="primary" icon="edit" @click="editEmployee(emp)" />
            <q-btn dense round color="negative" icon="delete" @click="deleteEmployee(emp.id)" />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Add Employee Dialog -->
    <q-dialog v-model="showAdd">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Add Employee</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="form.name" label="Name" filled />
          <q-input v-model="form.position" label="Position" filled class="q-mt-sm" />
          <q-input v-model="form.department" label="Department" filled class="q-mt-sm" />
          <q-input v-model.number="form.salary" label="Salary" type="number" filled class="q-mt-sm" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn label="Add" color="primary" @click="addEmployee" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Edit Employee Dialog -->
    <q-dialog v-model="showEdit">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Edit Employee</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="form.name" label="Name" filled />
          <q-input v-model="form.position" label="Position" filled class="q-mt-sm" />
          <q-input v-model="form.department" label="Department" filled class="q-mt-sm" />
          <q-input v-model.number="form.salary" label="Salary" type="number" filled class="q-mt-sm" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn label="Save" color="primary" @click="updateEmployee" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const API_URL = import.meta.env.VITE_GRAPHQL_ENDPOINT;

const employees = ref([]);
const showAdd = ref(false);
const showEdit = ref(false);
const viewMode = ref('list');

const form = ref({
  id: null,
  name: "",
  position: "",
  department: "",
  salary: null
});

const columns = [
  { name: "name", label: "Name", field: "name" },
  { name: "position", label: "Position", field: "position" },
  { name: "department", label: "Department", field: "department" },
  { name: "salary", label: "Salary", field: "salary" },
  { name: "actions", label: "Actions", field: "actions", sortable: false }
];

// Fetch Employees
const fetchEmployees = async () => {
  try {
    const query = {
      query: `
        {
          employees {
            id
            name
            position
            department
            salary
          }
        }
      `
    };
    const res = await axios.post(API_URL, query);
    employees.value = res.data?.data?.employees || [];
  } catch (err) {
    console.error("Failed to fetch employees", err);
    employees.value = [];
  }
};

// Add Employee
const addEmployee = async () => {
  try {
    const mutation = {
      query: `
        mutation {
          addEmployee(
            name: "${form.value.name}",
            position: "${form.value.position}",
            department: "${form.value.department}",
            salary: ${form.value.salary}
          ) {
            id
            name
            position
            department
            salary
          }
        }
      `
    };
    const res = await axios.post(API_URL, mutation);
    const added = res.data?.data?.addEmployee;
    if (added?.id) {
      employees.value.push(added);
      showAdd.value = false;
      form.value = { id: null, name: "", position: "", department: "", salary: null };
    } else {
      alert("Failed to add employee");
    }
  } catch (err) {
    console.error("Add employee error", err);
    alert("Error adding employee");
  }
};

// Edit Employee
const editEmployee = (row) => {
  form.value = { ...row };
  showEdit.value = true;
};

// Update Employee
const updateEmployee = async () => {
  try {
    const mutation = {
      query: `
        mutation {
          updateEmployee(
            id: ${form.value.id},
            name: "${form.value.name}",
            position: "${form.value.position}",
            department: "${form.value.department}",
            salary: ${form.value.salary}
          ) {
            id
            name
            position
            department
            salary
          }
        }
      `
    };
    const res = await axios.post(API_URL, mutation);
    const updated = res.data?.data?.updateEmployee;
    if (updated?.id) {
      const index = employees.value.findIndex(e => e.id == updated.id);
      if (index !== -1) employees.value[index] = updated;
      showEdit.value = false;
      form.value = { id: null, name: "", position: "", department: "", salary: null };
    } else {
      alert("Failed to update employee");
    }
  } catch (err) {
    console.error("Update employee error", err);
    alert("Error updating employee");
  }
};

// Delete Employee
const deleteEmployee = async (id) => {
  try {
    const mutation = {
      query: `
        mutation {
          deleteEmployee(id: ${id})
        }
      `
    };
    const res = await axios.post(API_URL, mutation);
    if (res.data?.data?.deleteEmployee) {
      employees.value = employees.value.filter(e => e.id !== id);
    } else {
      alert("Failed to delete employee");
    }
  } catch (err) {
    console.error("Delete employee error", err);
    alert("Error deleting employee");
  }
};

onMounted(fetchEmployees);
</script>
