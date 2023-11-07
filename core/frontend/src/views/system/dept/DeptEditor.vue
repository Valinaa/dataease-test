<template>
  <el-dialog
    v-loading="loading"
    :title="formType === 'add' ? $t('dept.create') : $t('dept.modify')"
    :visible.sync="dialogVisible"
    class="dept-editor-form"
    width="840px"
    :before-close="reset"
  >
    <el-form
      ref="createDeptForm"
      :model="form"
      size="small"
      label-width="80px"
      label-position="right"
    >
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item
            :label="$t('commons.dept_name')"
            prop="name"
          >
            <el-input
              v-model="form.name"
              :placeholder="$t('dept.input_name')"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="ID"
            prop="deptId"
          >
            <el-input
              v-model="form.deptId"
              :placeholder="$t('dept.input_id')"
              :disabled="formType !== 'add'"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item
            :label="$t('commons.dept_sort')"
            prop="deptSort"
          >
            <el-input
              v-model="form.deptSort"
              :placeholder="$t('dept.input_sort')"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            :label="$t('commons.dept_pid')"
            prop="pid"
          >
            <el-select
              v-model="form.pid"
              style="width: 100%"
              filterable
              :placeholder="$t('dept.input_pid')"
            >
              <el-option
                v-for="item in pids"
                :key="item.name"
                :label="item.name"
                :value="item.deptId"
                :disabled="isSameDept(item)"
              />
            </el-select>
          </el-form-item>
        </el-col>

      </el-row>
    </el-form>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <deBtn
        secondary
        @click="reset"
      >{{
        $t("commons.cancel")
      }}</deBtn>
      <deBtn
        type="primary"
        @click="save"
      >{{
        $t("commons.confirm")
      }}</deBtn>
    </span>
  </el-dialog>
</template>

<script>
import {addDept, allDeptList, editDept} from '@/api/system/dept'
export default {
  data() {
    return {
      loading: false,
      form: {
      },
      pids: [],
      defaultForm: {
        deptId: null,
        pid: 0,
        subCount: 0,
        name: null,
        deptSort: 999,
      },
      formType: 'add',
      dialogVisible: false,
    }
  },
  created() {
    allDeptList().then((res)=>{
      this.pids=res.data
      this.pids.unshift({name:"无上级部门", deptId:0})
    })
  },
  methods: {
    create() {
      this.formType = 'add'
    },
    isSameDept(item){
        return item.deptId===this.form.deptId
    },
    init(row) {
      this.dialogVisible = true
      this.form = Object.assign({}, JSON.parse(JSON.stringify(this.defaultForm)))
      if (!row) {
        this.create()
        return
      }
      this.form.deptId = row.id
      this.form.name = row.label
      this.pids.forEach(item=>{
        if(item.deptId===this.form.deptId){
          this.form.deptSort=item.deptSort
        }
      })
      console.log(this.pids)
      this.formType = 'modify'
      this.dialogVisible = true
    },
    reset() {
      this.depts = []
      this.$refs.createDeptForm.resetFields()
      this.dialogVisible = false
    },
    save() {
      this.$refs.createDeptForm.validate((valid) => {
        if (valid) {
          this.loading = true
          const method = this.formType === 'add' ? addDept : editDept
          method(this.form).then((res) => {
            this.$success(this.$t('commons.save_success'))
            this.reset()
            this.$emit('saved')
          }).finally(() => {
            this.loading = false
          })
        } else {
          return false
        }
      })
    },
  }
}
</script>

<style lang="scss" scoped>
.dept-editor-form {
  ::v-deep .el-dialog__body {
    padding: 0 24px 24px 24px;
  }

  ::v-deep .el-dialog__header {
    padding: 24px 24px 16px 24px;
  }

  ::v-deep .el-dialog__footer {
    padding-top: 0;
  }

  .editer-form-title {
    width: 100%;
    border-radius: 4px;
    background: #e1eaff;
    padding: 9px 16px;
    margin-bottom: 16px;

    i {
      color: #3370ff;
      font-size: 14.666666030883789px;
    }

    .btn-text {
      font-family: PingFang SC;
      font-size: 14px;
      font-weight: 400;
      line-height: 22px;
      text-align: left;
    }

    .btn-text {
      padding: 0;
      border: none;
    }
  }

  ::v-deep .el-form-item__label {
    width: 100% !important;
    text-align: left;
  }

  ::v-deep
    .el-form-item.is-required:not(.is-no-asterisk)
    > .el-form-item__label:before {
    display: none;
  }

  ::v-deep
    .el-form-item.is-required:not(.is-no-asterisk)
    > .el-form-item__label::after {
    content: "*";
    color: #f54a45;
    margin-left: 2px;
  }

  ::v-deep .el-form-item__content {
    margin-left: 0 !important;
  }

  .input-with-select {
    ::v-deep .el-input-group__prepend {
      background-color: #fff;
    }
    .el-select {
      ::v-deep .el-input__inner {
        width: 72px;
      }
    }
  }

  .de-form-gender-select {
    width: 100%;
  }
}

</style>
<style lang="scss">
.tree-select {
  display: none !important;
}
.user-popper {
  background: #fff;
  padding: 0;
  .popper__arrow {
    display: none;
  }
}
.user-popper.dept {
  height: 300px;
  overflow: auto;
}
</style>
