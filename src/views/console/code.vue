<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form @submit.native.prevent :inline="true">
          <el-form-item>
            <el-button type="primary" size="small" @click="openCodeAdd">新增</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="codes" @row-click="showItem" highlight-current-row stripe border style="width: 100%;">
          <el-table-column label="操作" width="120">
            <template slot-scope="scope">
              <el-button-group>
                <el-button type="primary" size="small" icon="el-icon-edit" @click="openCodeAdd(scope.row)"></el-button>
                <el-button type="danger" size="small" icon="el-icon-delete" @click="removeCode(scope.row.code)"></el-button>
              </el-button-group>
            </template>
          </el-table-column>
          <el-table-column prop="code" label="编码" width="160" sortable></el-table-column>
          <el-table-column prop="name" label="名称" sortable></el-table-column>
        </el-table>
      </el-col>
      <el-col :span="12">
        <el-form @submit.native.prevent :inline="true">
          <el-form-item>
            <el-button type="primary" size="small">新增</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="items" highlight-current-row border style="width: 100%;">
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
      </el-col>
    </el-row>
    <!-- 编辑字典界面 -->
    <el-dialog title="编辑" width="30%" :visible.sync="codeFormVisible" >
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
  </div>
</template>

<script>
import { loadCode, addCode, cacheMap, cachePathMap, removeCode, addItem, editItem, removeItem } from '@/api/console/code'
import { SAVE_SUCCESS, EDIT_SUCCESS, REMOVE_SUCCESS, SUCCESS_TIP_TITLE, WARNING_TIP_TITLE } from '@/utils/constant'

export default {

  data() {
    const validateCode = (rule, value, callback) => {
      if (this.code.code === undefined || this.code.code.trim().length === 0) {
        return callback(new Error('请输入编码'))
      }
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
      items: [],
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
    showItem: function(row, event, column) {
      this.items = row.items
      this.items.forEach(item => {
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
            this.refreshCodeStore()
            this.cancelCodeForm()
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

