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
    <!-- Table View -->
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

const employees = ref([]);
const showAdd = ref(false);
const showEdit = ref(false);
const viewMode = ref('list'); // default list view

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

const fetchEmployees = async () => {
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
  const res = await axios.post("http://localhost:4000/graphql", query, {
    headers: { "x-user-role": "admin" }
  });
  employees.value = res.data.data.employees;
};

const addEmployee = async () => {
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
  const res = await axios.post("http://localhost:4000/graphql", mutation, {
    headers: { "x-user-role": "admin" }
  });
  employees.value.push(res.data.data.addEmployee);
  showAdd.value = false;
  form.value = { id: null, name: "", position: "", department: "", salary: null };
};

const editEmployee = (row) => {
  form.value = { ...row };
  showEdit.value = true;
};

const updateEmployee = async () => {
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
  const res = await axios.post("http://localhost:4000/graphql", mutation, {
    headers: { "x-user-role": "admin" }
  });
  const index = employees.value.findIndex(e => e.id == res.data.data.updateEmployee.id);
  employees.value[index] = res.data.data.updateEmployee;
  showEdit.value = false;
  form.value = { id: null, name: "", position: "", department: "", salary: null };
};

const deleteEmployee = async (id) => {
  const mutation = {
    query: `
      mutation {
        deleteEmployee(id: ${id})
      }
    `
  };
  await axios.post("http://localhost:4000/graphql", mutation, {
    headers: { "x-user-role": "admin" }
  });
  employees.value = employees.value.filter(e => e.id !== id);
};

onMounted(fetchEmployees);
</script>
