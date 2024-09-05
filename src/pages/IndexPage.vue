<template>
  <q-page class="row q-pt-xl">
    <div class="full-width q-px-xl">
      <div :key="refreshId" class="q-mb-xl">
        <q-input v-model="tempData.name" label="姓名" :rules="[val => !!val || 'Field is required']" />
        <q-input v-model="tempData.age" label="年齡" :rules="[
          val => !!val || 'Field is required',
          val => /^[0-9]*$/.test(val) || 'Field must be number'
        ]" />
        <q-btn color="primary" class="q-mt-md" @click="onCreateSubmit">新增</q-btn>
      </div>
      <div class="q-mb-xl">
        <q-input v-model="search" clearable label="搜尋" />
        <q-select
          v-model="sort"
          label="排序"
          :options="sortOptions"
          emit-value
          map-options
          use-input
          input-debounce="0"
          clearable
        />
      </div>
      <q-table
        flat
        bordered
        ref="tableRef"
        :rows="tableSource"
        :columns="(tableConfig as QTableProps['columns'])"
        row-key="id"
        hide-pagination
        separator="cell"
        :rows-per-page-options="[0]"
      >
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
            <q-th></q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              style="min-width: 120px"
            >
              <div>{{ col.value }}</div>
            </q-td>
            <q-td class="text-right" auto-width v-if="tableButtons.length > 0">
              <q-btn
                @click="handleClickOption(btn, props.row)"
                v-for="(btn, index) in tableButtons"
                :key="index"
                size="sm"
                color="grey-6"
                round
                dense
                :icon="btn.icon"
                class="q-ml-md"
                padding="5px 5px"
              >
                <q-tooltip
                  transition-show="scale"
                  transition-hide="scale"
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[10, 10]"
                >
                  {{ btn.label }}
                </q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
        <template v-slot:no-data="{ icon }">
          <div
            class="full-width row flex-center items-center text-primary q-gutter-sm"
            style="font-size: 18px"
          >
            <q-icon size="2em" :name="icon" />
            <span> 無相關資料 </span>
          </div>
        </template>
      </q-table>
      <q-dialog v-model="isEdit">
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Your address</div>
          </q-card-section>

          <q-card-section class="q-pt-none" v-if="editData">
            <q-input v-model="editData.name" label="姓名" :rules="[val => !!val || 'Field is required']" />
            <q-input v-model="editData.age" label="年齡" :rules="[
              val => !!val || 'Field is required',
              val => /^[0-9]*$/.test(val) || 'Field must be number'
            ]" />
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="取消" @click="editData = null" />
            <q-btn flat label="更新" @click="onUpdateSubmit" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import type { AxiosResponse } from 'axios'
import { QTableProps } from 'quasar';
import { computed, onMounted, ref } from 'vue';
import { fetchTest, createTest, updateTest, deleteTest, TestModel } from './services';
import { useAsyncEvent } from './composables';
import { useQuasar } from 'quasar'

interface HtnType {
  label: string;
  icon: string;
  status: string;
}

const search = ref('');

const sort = ref('');
const sortOptions = [
  { label: '無', value: '' },
  { label: '姓名', value: 'name' },
  { label: '年齡', value: 'age' },
];

const blockData = ref([] as TestModel[]);
const tableConfig = ref([
  {
    label: '姓名',
    name: 'name',
    field: 'name',
    align: 'left',
  },
  {
    label: '年齡',
    name: 'age',
    field: 'age',
    align: 'left',
  },
]);
const tableButtons = ref([
  {
    label: '編輯',
    icon: 'edit',
    status: 'edit',
  },
  {
    label: '刪除',
    icon: 'delete',
    status: 'delete',
  },
]);

const DEFAULT_TEMP_DATA = {
  name: '',
  age: '',
};

const tempData = ref(DEFAULT_TEMP_DATA);

const tableSource = computed(() => {
  return blockData.value
    .filter((item) => {
      return item.name.includes(search.value) || item.age.toString().includes(search.value);
    })
    .sort((a, b) => {
      if (sort.value === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sort.value === 'age') {
        return a.age - b.age;
      }
      return 0;
    });
});

const refreshId = ref(0);

const onCreateSubmit = () => {
  createTest(tempData.value).then(() => fetchTest()).then(onFetchTestSuccess)
  tempData.value.name = '';
  tempData.value.age = '';
  refreshId.value += 1;
}

const onFetchTestSuccess = useAsyncEvent((res: AxiosResponse<TestModel[]>) => {
  blockData.value = res.data;
})

onMounted(() => {
  fetchTest().then(onFetchTestSuccess)
})


const editData = ref(null as TestModel | null);
const isEdit = computed(() => !!editData.value);

const onUpdateSubmit = () => {
  updateTest(editData.value).then(() => fetchTest()).then(onFetchTestSuccess)
  editData.value = null;
}

const $q = useQuasar()

const onDeleteById = (id: string) => {
  $q.dialog({
    title: '提示',
    message: '是否確定刪除該筆資料?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    deleteTest(id).then(() => fetchTest()).then(onFetchTestSuccess)
  })
}

const handleClickOption = (btn: HtnType, row: TestModel) => {
  switch (btn.status) {
    case 'edit':
      editData.value = { ...row };
      break;
    case 'delete':
      onDeleteById(row.id);
      break;
    default:
      break;
  }
};
</script>

<style lang="scss" scoped>
.q-table th {
  font-size: 20px;
  font-weight: bold;
}

.q-table tbody td {
  font-size: 18px;
}
</style>
