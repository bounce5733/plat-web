<template>
<div class="app-container">
  <!--操作表单-->
  <el-row>
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form @submit.native.prevent :inline="true">
        <el-form-item>
          <el-button type="primary" size="small" @click="openCodeAdd" icon="el-icon-plus">码表</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" :disabled="codes.length === 0" @click="openItemAdd" icon="el-icon-plus">项目</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
  <!--卡片界面-->
  <el-tabs v-model="activeTab" type="border-card" @tab-click="tabClick" closable @tab-remove="removeCode">
      <el-tab-pane v-for="code in codes" :label="code.name" :name="code.code" :key="code.code">
          <el-table :data="code.items" highlight-current-row border style="width: 100%;">
            <el-table-column align="center" label="操作" width="120">
              <template slot-scope="scope">
                <el-button-group>
                  <el-button type="primary" @click="openItemEdit(scope.$index, scope.row)" size="small" icon="el-icon-edit" ></el-button>
                  <el-button type="danger" @click="removeItem(scope.$index, scope.row)" size="small" icon="el-icon-delete" ></el-button>
                </el-button-group>
              </template>
            </el-table-column>
            <el-table-column prop="showName" label="名称" width="300">
            </el-table-column>
            <el-table-column prop="sort" label="排序" width="100">
            </el-table-column>
        </el-table>
      </el-tab-pane>
  </el-tabs>
  <!-- 新增码表界面 -->
  <el-dialog title="新增" width="30%" :visible.sync="codeFormVisible" >
      <el-form :model="code" ref="codeForm" :rules="codeRules">
          <el-form-item label="编码:" label-width="80px" prop="code">
              <el-input v-model="code.code" auto-complete="off" style="width:80%" placeholder="编码由字母与下划线组成"></el-input>
          </el-form-item>
          <el-form-item label="名称:" label-width="80px" prop="name">
              <el-input v-model="code.name" auto-complete="off" style="width:80%"></el-input>
          </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
          <el-button @click="cancelCodeForm">取 消</el-button>
          <el-button type="primary" @click="saveCode">确 定</el-button>
      </div>
  </el-dialog>
  <!-- 编辑项目界面 -->
  <el-dialog :title="itemFormTitle" :visible.sync="itemFormVisible" :close-on-click-modal="false">
      <el-form :model="item" :rules="itemRules" ref="itemForm" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级分类">
              <el-cascader
                expand-trigger="hover"
                :options="codeSelData"
                clearable
                :props="codeSelProps"
                v-model="item.path"
                change-on-select
                :disabled="itemFormTitle != '新增'">
              </el-cascader>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="item.name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序">
              <el-input-number v-model="item.sort" :min="1" :max="99"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
          <el-button @click="cancelItemForm">取消</el-button>
          <el-button type="primary" @click="saveItem">确定</el-button>
      </div>
  </el-dialog>
</div>
</template>

<script>
import { loadCode, addCode, cacheMap, cachePathMap, removeCode, addItem, editItem, removeItem } from '@/api/console/code'
import { SAVE_SUCCESS, EDIT_SUCCESS, REMOVE_SUCCESS, SUCCESS_TIP_TITLE, WARNING_TIP_TITLE } from '@/utils/constant'

export default {

  data() {
    const validateCode = (rule, value, callback) => {
      // 校验编码格式
      const reg = /^[A-Za-z]+$/
      const codeVal = this.code.code.trim()
      const isChar = reg.test(codeVal.replace(/_/g, ''))
      if (!isChar) {
        return callback(new Error('编码由字母与下划线组成'))
      }
      // 校验唯一性
      let isUnique = true
      this.codes.forEach(item => {
        if (item.code.toLowerCase() === codeVal.toLowerCase()) {
          isUnique = false
        }
      })
      if (!isUnique) {
        return callback(new Error('编码不唯一'))
      }
      callback()
    }

    return {
      activeTab: '',
      activeTabIndex: 0,
      codes: [],
      // ------新增类型------
      codeFormVisible: false,
      code: {},
      codeRules: {
        code: [
          { required: true, trigger: 'blur', validator: validateCode }
        ],
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ]
      },
      // ------编辑项目------
      codeSelProps: {
        label: 'name',
        value: 'id',
        children: 'children'
      },
      itemFormVisible: false,
      itemFormTitle: '',
      codeSelData: [],
      item: {},
      itemRules: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    loadCode: function() {
      loadCode().then(res => {
        this.codes = res.data
        if (this.activeTabIndex === 0 && this.codes.length > 0) {
          this.activeTab = this.codes[0].code
        }
        this.codes.forEach(code => {
          code.items.forEach(item => {
            let indent = ''
            const depth = this.$store.state.code.codePathMap[item.id].path.length - 1
            for (let i = 0; i < depth; i++) {
              indent += '- - '
            }
            if (depth > 0) {
              item.showName = indent + '|- ' + item.name
            } else {
              item.showName = item.name
            }
          })
        })
      })
    },
    tabClick: function(tab, event) {
      this.activeTabIndex = tab.index
      this.activeTab = tab.name
    },
    // ------新增类型------
    openCodeAdd: function() {
      this.code = {}
      this.codeFormVisible = true
    },
    saveCode: function() {
      this.$refs.codeForm.validate((valid) => {
        if (valid) {
          addCode(this.code).then(res => {
            this.$notify({
              title: SUCCESS_TIP_TITLE,
              message: SAVE_SUCCESS,
              type: 'success'
            })
            this.$store.dispatch('addCodes')
            this.$store.dispatch('addPathMap')
            this.$refs.codeForm.resetFields()
            this.refreshCodeStore()
            this.codeFormVisible = false
          })
        }
      })
    },
    removeCode: function(selcode) {
      this.codes.forEach(code => {
        if (code.code === selcode) {
          if (code.items.length > 0) {
            this.$notify({
              title: WARNING_TIP_TITLE,
              message: '请先删除码表项目',
              type: 'warning'
            })
            return
          } else {
            removeCode(selcode).then(res => {
              this.$notify({
                title: SUCCESS_TIP_TITLE,
                message: REMOVE_SUCCESS,
                type: 'success'
              })
              this.activeTabIndex = 0 // 活动选项卡重置为第一个
              this.refreshCodeStore()
            })
          }
        }
      })
    },
    cancelCodeForm: function() {
      this.$refs.codeForm.resetFields()
      this.codeFormVisible = false
    },
    // ------编辑项目------
    openItemAdd: function() {
      this.item = {}
      this.codeSelData = this.$store.state.code.codes[this.activeTab]
      this.itemFormTitle = '新增'
      this.itemFormVisible = true
    },
    openItemEdit: function(index, row) {
      this.item = Object.assign({}, row)
      this.itemFormTitle = '编辑'
      const path = this.$store.state.code.codePathMap[row.id].path
      path.splice(-1, 1)
      this.item.path = path
      this.codeSelData = this.$store.state.code.codes[this.activeTab]
      this.itemFormVisible = true
    },
    saveItem: function() {
      this.$refs.itemForm.validate((valid) => {
        if (valid) {
          if (this.item.path !== undefined && this.item.path.length > 0) {
            this.item.pid = this.item.path[this.item.path.length - 1]
          } else {
            this.item.pid = '0'
          }
          this.item.type = this.activeTab
          if (this.itemFormTitle === '新增') {
            addItem(this.item).then(res => {
              this.$notify({
                title: SUCCESS_TIP_TITLE,
                message: SAVE_SUCCESS,
                type: 'success'
              })
              this.$store.dispatch('addCodes')
              this.$store.dispatch('addPathMap')
              this.$refs.itemForm.resetFields()
              this.refreshCodeStore()
              this.itemFormVisible = false
            })
          } else {
            editItem(this.item).then(res => {
              this.$notify({
                title: SUCCESS_TIP_TITLE,
                message: EDIT_SUCCESS,
                type: 'success'
              })
              this.$store.dispatch('addCodes')
              this.$store.dispatch('addPathMap')
              this.$refs.itemForm.resetFields()
              this.refreshCodeStore()
              this.itemFormVisible = false
            })
          }
        }
      })
    },
    removeItem: function(index, row) {
      this.$confirm('确定删除该项目', '提示', { type: 'warning' }).then(() => {
        // 检查是否包含下级
        let canRemove = true
        this.codes.forEach(code => {
          code.items.forEach(item => {
            if (item.pid === row.id) {
              this.$notify({
                title: WARNING_TIP_TITLE,
                message: '请先删除子项目',
                type: 'warning'
              })
              canRemove = false
            }
          })
        })
        if (!canRemove) {
          return
        }
        removeItem(row.id).then(res => {
          if (res.status === 204) {
            this.$notify({
              title: WARNING_TIP_TITLE,
              message: '该项目已被业务数据引用',
              type: 'warning'
            })
          } else {
            this.$notify({
              title: SUCCESS_TIP_TITLE,
              message: REMOVE_SUCCESS,
              type: 'success'
            })
            this.refreshCodeStore()
          }
        })
      }).catch(() => {})
    },
    cancelItemForm: function() {
      this.$refs.itemForm.resetFields()
      this.itemFormVisible = false
    },
    refreshCodeStore: function() {
      // ------刷新码表------
      cacheMap().then(res => {
        this.$store.commit('ADD_CODES', res.data)
        cachePathMap().then(res => {
          this.$store.commit('ADD_PATH_MAP', res.data)
          this.loadCode()
        })
      })
    }
  },
  mounted() {
    this.loadCode()
  }
}
</script>
