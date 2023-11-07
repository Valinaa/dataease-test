<template>
  <de-layout-content class="de-search-table">
    <el-row class="top-operate">
      <el-col :span="12">
        <deBtn
          v-permission="['dept:add']"
          type="primary"
          icon="el-icon-plus"
          @click="create"
        >{{ $t("dept.create") }}</deBtn>

      </el-col>
    </el-row>
    <div
      id="resize-for-filter"
      class="table-container"
      :class="[filterTexts.length ? 'table-container-filter' : '']"
    >
      <grid-table
        v-loading="loading"
        :table-data="data"
        :columns="checkedColumnNames"
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
        :load="load"
        row-key="id"
        current-row-key="id"
        @columnsChange="columnsChange"
        @sort-change="sortChange"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        lazy
      >
        <el-table-column
          key="id"
          prop="id"
          label="ID"
        />
        <el-table-column
          key="label"
          show-overflow-tooltip
          prop="label"
          sortable="custom"
          :label="$t('commons.dept_name')"
        />

        <el-table-column
          key="createTime"
          show-overflow-tooltip
          prop="createTime"
          sortable="custom"
          :label="$t('commons.create_time')"
          width="180"
        >
          <template #default="scope">
            <span>{{ scope.row.createTime | timestampFormatDate }}</span>
          </template>
        </el-table-column>

        <el-table-column
          key="__operation"
          slot="__operation"
          :label="$t('commons.operating')"
          fixed="right"
          :width="operateWidth"
        >
          <template slot-scope="scope">
            <el-button
              v-permission="['dept:edit']"
              class="de-text-btn mr2"
              type="text"
              @click="edit(scope.row)"
            >{{ $t("commons.edit") }}</el-button>
            <el-button
              v-if="scope.row.id !== 1"
              v-permission="['dept:del']"
              class="de-text-btn"
              type="text"
              @click="del(scope.row)"
            >{{ $t("commons.delete") }}</el-button>
            <span v-else>&nbsp;</span>
          </template>
        </el-table-column>
      </grid-table>
    </div>
    <dept-editor
      ref="deptEditor"
    />
  </de-layout-content>
</template>

<script>
import deptEditor from './DeptEditor.vue'
import { columnOptions } from './options'
import DeLayoutContent from '@/components/business/DeLayoutContent'
import { addOrder} from '@/utils'
import bus from '@/utils/bus'
import GridTable from '@/components/gridTable/index.vue'
import PluginCom from '@/views/system/plugin/PluginCom'
import _ from 'lodash'
import {allDept, batchDelDept} from "@/api/system/dept";
export default {
  components: { DeLayoutContent, GridTable, deptEditor, PluginCom },
  data() {
    return {
      loading: false,
      checkAll: true,
      checkedColumnNames: columnOptions.map((ele) => ele.props),
      columnNames: columnOptions,
      data: [],
      filterTexts: [],
      dialogVisible: false,
      form: {
        roles: [
          {
            id: ''
          }
        ]
      },
      ruleForm: {},
      rule: {
        newPassword: [
          {
            required: true,
            message: this.$t('user.input_password'),
            trigger: 'blur'
          },
        ]
      },
      cacheCondition: [],
      orderConditions: [],
      isPluginLoaded: false,
      showScroll: false,
      resizeForFilter: null,
      operateWidth: 168
    }
  },
  watch: {
    filterTexts: {
      handler() {
        this.getScrollStatus()
      },
      deep: true
    }
  },
  created() {
    allDept().then((res) => {
      this.data = res.data
    })
  },
  mounted() {
    document.addEventListener('keypress', this.entryKey)
    this.resizeObserver()
  },
  destroyed() {
    document.removeEventListener('keypress', this.entryKey)
    bus.$off('reload-user-grid', this.search)
  },
  methods: {
    load(key, treeNode, resolve) {
      setTimeout(() => {
        resolve(key.children)
      },1000
      )},
    resizeObserver() {
      this.resizeForFilter = new ResizeObserver(entries => {
        if (!this.filterTexts.length) return
        this.layoutResize()
      })
      this.resizeForFilter.observe(document.querySelector('#resize-for-filter'))
    },
    layoutResize: _.debounce(function() {
      this.getScrollStatus()
    }, 200),
    initSearch() {
      this.handleCurrentChange(1)
    },
    sortChange({ column, prop, order }) {
      this.orderConditions = []
      if (!order) {
        this.initSearch()
        return
      }
      if (prop === 'dept') {
        prop = 'u.deptId'
      }
      if (prop === 'status') {
        prop = 'u.enabled'
      }
      this.orderConditions = []
      addOrder({ field: prop, value: order }, this.orderConditions)
      this.initSearch()
    },
    handleSizeChange(pageSize) {
      this.paginationConfig.currentPage = 1
      this.paginationConfig.pageSize = pageSize
      this.search()
    },
    handleCurrentChange(currentPage) {
      this.paginationConfig.currentPage = currentPage
      this.search()
    },
    getScrollStatus() {
      this.$nextTick(() => {
        const dom = document.querySelector('.filter-texts-container')
        this.showScroll = dom && dom.scrollWidth > dom.offsetWidth
      })
    },
    columnsChange() {
      const arr = this.data
      this.data = []
      this.$nextTick(() => {
        this.data = arr
      })
    },
    create() {
      this.$refs.deptEditor.init()
    },

    edit(row) {
      this.$refs.deptEditor.init(row)
    },
    del(row) {
      this.$confirm(this.$t('user.sure_delete'), '', {
        confirmButtonText: this.$t('commons.delete'),
        cancelButtonText: this.$t('commons.cancel'),
        cancelButtonClass: 'de-confirm-fail-btn de-confirm-fail-cancel',
        confirmButtonClass: 'de-confirm-fail-btn de-confirm-fail-confirm',
        customClass: 'de-confirm de-confirm-fail',
        iconClass: 'el-icon-warning'
      })
        .then(() => {
          batchDelDept(encodeURIComponent(row.userId)).then((res) => {
            this.openMessageSuccess('commons.delete_success')
            this.initSearch()
          })
        })
        .catch(() => {
          this.$info(this.$t('commons.delete_cancel'))
        })
    },
    openMessageSuccess(text) {
      const h = this.$createElement
      this.$message({
        message: h('p', null, [
          h('span', null, this.$t(text))
        ]),
        iconClass: 'el-icon-success',
        customClass: 'de-message-success de-message'
      })
    }
  }
}
</script>

<style scoped lang="scss">
.table-container {
  height: calc(100% - 50px);

  .mar16 {
    margin: 0 -2px 0 4px;
  }

  .mr2 {
    margin-left: -3px;
  }
}

.table-container-filter {
  height: calc(100% - 110px);
}
</style>
<style lang="scss">
.reset-pwd-icon {
  margin-top: 4px;
  color: rgb(255, 153, 0);
}
.reset-pwd {
  padding: 20px 24px !important;
  display: flex;
  flex-wrap: wrap;

  .tips {
    font-family: PingFang SC;
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
    margin-left: 8.67px;
    color: #1f2329;
  }

  i {
    font-size: 14.666666030883789px;
    color: #ff8800;
    line-height: 22px;
  }
  .editer-form-title {
    margin: 4px 0 16px 24px;

    .pwd,
    .btn-text {
      font-family: PingFang SC;
      font-size: 14px;
      font-weight: 400;
      line-height: 22px;
      text-align: left;
    }

    .pwd {
      margin-right: 8px;
      color: #1f2329;
    }

    .btn-text {
      border: none;
    }
  }

  .foot {
    text-align: right;
    width: 100%;
    .btn {
      border-radius: 4px;
      padding: 4px 12px 4px 12px;
      font-family: PingFang SC;
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      letter-spacing: 0;
      text-align: center;
      border: none;
      box-sizing: border-box;
    }

    .normal {
      color: #1f2329;
      border: 1px solid #bbbfc4;
      margin-left: 12px;
    }
  }
}
.list-columns-select {
  padding: 8px 11px !important;
  width: 238px;

  .title,
  .el-checkbox {
    font-family: PingFang SC;
    font-size: 14px;
    font-weight: 400;
    padding: 5px 0;
    margin: 0;
    color: #8f959e;
  }

  .el-checkbox {
    color: #1f2329;
    width: 100%;
  }
}
.de-one-line {
  max-width: 80px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.de-table-tooltips {
  max-width: 200px;
}
</style>

