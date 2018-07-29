import { loginByAccount, logout } from '@/api/console/login'
import { getUserInfo } from '@/api/console/user'
import { TOKEN_KEY } from '@/utils/constant'

const user = {
  state: {
    account: '',
    name: '',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif'
  },

  mutations: {
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_ACCOUNT: (state, account) => {
      state.account = account
    }
  },

  actions: {
    // 用户名登录
    loginByAccount({ commit }, userInfo) {
      const account = userInfo.account.trim()
      return new Promise((resolve, reject) => {
        loginByAccount(account, userInfo.password).then(response => {
          sessionStorage.setItem(TOKEN_KEY, response.data)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    getUserInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getUserInfo().then(res => {
          if (!res.data) { // 由于mockjs 不支持自定义状态码只能这样hack
            reject('error')
          }
          const userinfo = res.data
          const user = userinfo.user
          commit('SET_ACCOUNT', user.account)
          commit('SET_NAME', user.name)
          resolve(userinfo.menuids)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    logOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout().then(() => {
          sessionStorage.removeItem(TOKEN_KEY)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端注销
    fedLogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        sessionStorage.removeItem(TOKEN_KEY)
        resolve()
      })
    }
  }
}

export default user
