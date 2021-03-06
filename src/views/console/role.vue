<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true" @submit.native.prevent>
          <el-form-item>
            <el-button type="primary" @click="openAdd" size="small">新增</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>

    <!--列表-->
    <el-table :data="roles" highlight-current-row border style="width: 100%;">
      <el-table-column prop="name" label="角色名称" width="220" sortable></el-table-column>
      <el-table-column prop="descn" label="描述" sortable></el-table-column>
      <el-table-column prop="enabled" label="启用" width="100">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.enabled" disabled></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="350">
        <template slot-scope="scope">
          <el-button-group>
            <el-button type="primary" size="small" @click="openAssignMenus(scope.$index, scope.row)">分配菜单</el-button>
            <el-button type="primary" size="small" @click="openAssignUsers(scope.$index, scope.row)">分配用户</el-button>
            <el-button type="primary" size="small" v-if="scope.row.name != superAdminKey" icon="el-icon-edit" @click="openEdit(scope.$index, scope.row)">编辑</el-button>
            <el-button type="danger" v-if="scope.row.name != superAdminKey" icon="el-icon-delete" size="small" @click="remove(scope.row)">删除</el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!--编辑角色-->
    <el-dialog :title="formTitle" :close-on-click-modal="false" :visible.sync="formVisible">
      <el-form :model="role" ref="roleForm" :rules="roleRules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="role.name"></el-input>
            </el-form-item>
          </el-col>
          <el-col v-if="!isNew" :span="12">
            <el-form-item label="启用">
              <el-switch
                v-model="role.enabled"
                active-color="#13ce66"
                inactive-color="#ff4949">
              </el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row >
          <el-col :span="24">
            <el-form-item label="描述" prop="descn">
              <el-input v-model="role.descn"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="cancelForm">取消</el-button>
        <el-button type="primary" @click.native="save">确认</el-button>
      </div>
    </el-dialog>

    <!--分配用户-->
    <el-dialog title="分配用户" :close-on-click-modal="false" :visible.sync="userFormVisible">
      <el-row>
        <el-form :inline="true">
          <el-form-item>
            <el-select v-model="selUser" @change="selUserChange" filterable remote reserve-keyword placeholder="账号/姓名匹配" :remote-method="matchUser">
              <el-option v-for="user in matchUsers" :key="user.id" :label="user.name" :value="user.id">
                <span style="float: left">{{ user.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-row>
      <el-table :data="users" highlight-current-row border style="width: 100%;">
        <el-table-column align="center" label="操作" width="100">
          <template slot-scope="scope">
            <el-button-group>
              <el-button type="danger" size="small" icon="el-icon-delete" @click="removeUser(scope.$index, scope.row)"></el-button>
            </el-button-group>
          </template>
        </el-table-column>
        <el-table-column prop="account" label="账号" width="150"></el-table-column>
        <el-table-column prop="name" label="姓名" width="150"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="cancelUserForm">取消</el-button>
        <el-button type="primary" @click.native="assignUsers">提交</el-button>
      </div>
    </el-dialog>

    <!--分配菜单界面-->
    <el-dialog title="分配菜单" :visible.sync="menuFormVisible" :close-on-click-modal="false">
      <div>
        <el-tree :data="menus" :props="menuTreeProps" default-expand-all show-checkbox node-key="name" highlight-current ref="menuTree"></el-tree>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="cancelMenuForm">取消</el-button>
        <el-button type="primary" @click.native="assignMenus">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { loadRole, addRole, editRole, removeRole, assignUsers, assignMenus } from '@/api/console/role'
import { matchUserWithAccountOrName, roleUsers } from '@/api/console/user'
import { roleMenus } from '@/api/console/role'
import { SAVE_SUCCESS, EDIT_SUCCESS, REMOVE_SUCCESS, SUCCESS_TIP_TITLE, WARNING_TIP_TITLE, SUPER_ADMIN_KEY } from '@/utils/constant'
import { asyncRouterMap } from '@/router'
import _ from 'lodash/lang'

export default {

  data() {
    const validateName = (rule, value, callback) => {
      if (!value || value.trim().length === 0) {
        return callback(new Error('名称不能为空'))
      }
      // 唯一性
      let isUnique = true
      if (this.isNew) {
        this.roles.forEach(role => {
          if (role.name.trim() === value.trim()) {
            isUnique = false
          }
        })
      } else { // 比较自己除外
        this.roles.forEach(role => {
          if (value !== this.oldName) {
            if (this.oldName !== role.name && value === role.name) {
              isUnique = false
            }
          }
        })
      }
      if (!isUnique) {
        return callback(new Error('名称重复'))
      }
      callback()
    }
    return {
      superAdminKey: SUPER_ADMIN_KEY,
      roles: [],
      // ------编辑角色------
      formVisible: false,
      formTitle: '',
      isNew: true,
      oldName: '',
      role: {},
      roleRules: {
        name: [
          { required: true, trigger: 'blur', validator: validateName },
          { max: 64, message: '最大长度64个字符', trigger: 'blur' }
        ],
        descn: [
          { max: 255, message: '最大长度255个字符', trigger: 'blur' }
        ]
      },
      curRoleid: '', // 当前选择角色主键
      // ------授权用户------
      userFormVisible: false,
      matchUsers: [],
      users: [],
      selUser: '',
      // ------授权菜单------
      menuTreeProps: {
        children: 'children',
        label: 'title'
      },
      menuFormVisible: false,
      menus: [],
      allMenus: asyncRouterMap
    }
  },
  methods: {
    load: function() {
      loadRole().then(res => {
        this.roles = res.data
        this.roles.forEach(role => {
          role.enabled = role.enabled === 'T' ? 'true' : 'false'
        })
      })
    },
    openAdd: function() {
      this.role = {}
      this.isNew = true
      this.formTitle = '新增'
      this.formVisible = true
    },
    openEdit: function(index, row) {
      this.role = Object.assign({}, row)
      this.oldName = this.role.name
      this.isNew = false
      this.formTitle = '编辑'
      this.formVisible = true
    },
    save: function() {
      this.$refs.roleForm.validate((valid) => {
        if (valid) {
          if (this.isNew) {
            addRole(this.role).then(res => {
              this.$notify({
                title: SUCCESS_TIP_TITLE,
                message: SAVE_SUCCESS,
                type: 'success'
              })
              this.$refs.roleForm.resetFields()
              this.load()
              this.formVisible = false
            })
          } else {
            this.role.enabled = this.role.enabled ? 'T' : 'F'
            editRole(this.role).then(res => {
              this.$notify({
                title: SUCCESS_TIP_TITLE,
                message: EDIT_SUCCESS,
                type: 'success'
              })
              this.$refs.roleForm.resetFields()
              this.load()
              this.formVisible = false
            })
          }
        }
      })
    },
    remove: function(row) {
      this.$confirm('删除角色会级联删除关联权限', '提示', { type: 'warning' }).then(() => {
        removeRole(row.id).then(res => {
          this.$notify({
            title: SUCCESS_TIP_TITLE,
            message: REMOVE_SUCCESS,
            type: 'success'
          })
          this.load()
        })
      }).catch(() => {})
    },
    cancelForm: function() {
      this.$refs.roleForm.resetFields()
      this.formVisible = false
    },
    // ------分配用户------
    openAssignUsers: function(index, row) {
      this.selUser = ''
      this.curRoleid = row.id
      roleUsers(row.id).then(res => {
        this.users = res.data
        this.userFormVisible = true
      })
    },
    assignUsers: function() {
      const userids = []
      this.users.forEach(user => {
        userids.push(user.id)
      })
      assignUsers(this.curRoleid, userids).then(res => {
        this.$notify({
          title: SUCCESS_TIP_TITLE,
          message: '授权成功',
          type: 'success'
        })
      })
      this.cancelUserForm()
    },
    removeUser: function(index, row) {
      this.users.splice(index, 1)
    },
    selUserChange: function(userid) {
      let isExist = false
      this.users.forEach(user => {
        if (user.id === userid) {
          this.$notify({
            title: WARNING_TIP_TITLE,
            message: '该用户已分配',
            type: 'warning'
          })
          isExist = true
        }
      })
      if (!isExist) {
        this.matchUsers.forEach(user => {
          if (user.id === userid) {
            this.users.push(user)
          }
        })
      }
    },
    // 授权人查询
    matchUser: function(param) {
      if (param.length === 0) return
      if (param.trim() === '1') return
      matchUserWithAccountOrName({ param: param }).then(res => {
        this.matchUsers = res.data
      })
    },
    cancelUserForm: function() {
      this.userFormVisible = false
    },
    // ------分配菜单------
    openAssignMenus: function(index, row) {
      this.curRoleid = row.id
      const that = this
      roleMenus(this.curRoleid).then(res => {
        const ids = []
        res.data.forEach(menuid => {
          ids.push(menuid)
        })
        this.menus = this.menuTreeOpt(ids, _.cloneDeep(this.allMenus))
        this.menuFormVisible = true
        setTimeout(function() {
          that.$refs.menuTree.setCheckedKeys(ids)
        }, 100)
      })
    },
    // 过滤隐藏的菜单、给菜单添加title属性、过滤目录菜单id
    menuTreeOpt: function(ids, menus) {
      const accessedRouters = menus.filter(route => {
        if (route.meta && route.meta.title) {
          route.title = route.meta.title
        }
        if (route.hidden === undefined || !route.hidden) {
          if (route.children && route.children.length) {
            const index = ids.indexOf(route.name)
            if (index >= 0) {
              ids.splice(index, 1)
            }
            route.children = this.menuTreeOpt(ids, route.children)
          }
          return true
        }
        return false
      })
      return accessedRouters
    },
    assignMenus: function() {
      assignMenus(this.curRoleid, this.$refs.menuTree.getCheckedKeys()).then(res => {
        this.$notify({
          title: SUCCESS_TIP_TITLE,
          message: '分配成功',
          type: 'success'
        })
      })
      this.cancelMenuForm()
    },
    cancelMenuForm: function() {
      this.menuFormVisible = false
    }
  },
  mounted() {
    this.load()
  }
}
</script>