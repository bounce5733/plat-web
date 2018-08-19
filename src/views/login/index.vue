<template>
  <div class="login-container">
    <div class="header">
      <div class="header-wrap">
        <h1 class="header-logo"><a href="https://bing.com">工具平台</a></h1>
      </div>
    </div>
    <div class="main">
      <div class="link-con">
        <a target="_blank" style="background: url(/static/login-main.png) center right no-repeat;" href="https://www.bing.com">
        </a>
      </div>
      <div class="form-con">
        <div class="my-form">
          <form id="myForm" autocomplete="off">
            <input style="display:none" type="text" name="fakeusernameremembered"/>
            <input style="display:none" type="password" name="fakepasswordremembered"/>
            <div class="control-box">
              <div class="warn" id="warn">
                
              </div>
              <div class="control-form">
                <input type="text" name="username" id="username" tabIndex="1" class="ui-input" placeholder="请输入手机号码/用户名" autocomplete="off">
              </div>
              <div class="control-form">
                <input type="password" name="password" id="password" tabIndex="2" class="ui-input" placeholder="请输入密码" autocomplete="off">
              </div>
              <div class="control-form dn">
                <input type="text" class="ui-input verifyCode" id="verifyCode" name="verifyCode" placeholder="请输入右侧图片"  autocomplete="off"/>
                <img src="" title="点击刷新图片" height="40" width="105" class="auth-image" />
              </div>


              <div class="control-form o-form">
                <label class="remember-name"><input type="checkbox" tabIndex="3" name="rememberName" value="1" /><span>记住用户名</span></label>
                <a class="forget-pwd" href="https://sso.dinghuo123.com/user/password_retrieve">忘记密码？</a>
              </div>
              <div class="control-form">
                <input type="button" id="loginBtn" class="ui-btn ui-btn-blue" tabIndex="4" value="登录">
              </div>
            </div>
          </form>
          <div class="down-con">
            <a class="down-a" href="https://www.dinghuo123.com/product/dinghuo.html#download"><em class="ui-icon-phone"></em>手机下载</a>
            <a class="register-a" href="https://sso.dinghuo123.com/apply/apply"><em class="ui-icon-register"></em>注册</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { isvalidAccount } from '@/utils/validate'
export default {
  data() {
    const validateAccount = (rule, value, callback) => {
      if (!isvalidAccount(value)) {
        callback(new Error('账号错误！'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 3) {
        callback(new Error('密码不能少于3位！'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        account: 'admin',
        password: '123'
      },
      loginRules: {
        account: [{ required: true, trigger: 'blur', validator: validateAccount }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      passwordType: 'password',
      loading: false
    }
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('loginByAccount', this.loginForm).then(() => {
            this.loading = false
            this.$router.push({ path: '/' })
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>

/* ---------------------single CSS----------------------- */
/* display */
.dn{display:none;}

/* 设置默认字体 */
body,
button, input, select, textarea { /* for ie */
    /*font: 12px/1 Tahoma, Helvetica, Arial, "宋体", sans-serif;*/
    font: 12px/1 Microsoft yahei,Tahoma, Helvetica, Arial, "\5b8b\4f53", sans-serif; /* 用 ascii 字符表示，使得在任何编码下都无问题 */
}
*{
    box-sizing: border-box;
    outline: 0;
}
*{
	transition: .3s;
}

.login-container{
  background-image: url(/static/login-bg.jpg);
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  background-color: transparent;
}

.header{
    width: 120px;
    height: 50px;
    position: absolute;
    top:40px;
    z-index: 99;
}

.header-wrap{
  width: 1280px;
  margin:0 auto;
}

.header-logo{
	position: absolute;
	left: 40px;
	width:120px;
	height: 40px;
	overflow: hidden;
}

.header-logo a{
	display: block;
	width: 120px;
	height: 0;
	padding-top: 40px;
	overflow: hidden;
	background: url(/static/logo-min.png) center center no-repeat;
}

.main{
	position: relative;
	height: 100%;
	/* width: 1280px; */
	width:100%;
	margin: 0 auto;
}

.link-con{
	position: fixed;
	width: 50%;
	height: 100%;
	top:0;
	right:50%;
	bottom: 0;
	left:0;
}

.link-con a{
	display: block;
	height: 100%;
}

.form-con{
	position: absolute;
	width:50%;
	height: 100%;
	top:0;
	right:0;
	bottom: 0;
	left:50%;
}

.my-form{
	position: absolute;
	width:360px;
	right: 50%;
	margin-right:-180px;
	top: 50%;
	margin-top: -170px;
	padding:60px 30px;
	background: url(/static/black-30.png) repeat;
}
.my-form .warn{
	position: absolute;
	top: 40px;
	height: 14px;
	line-height: 14px;
	font-size: 14px;
	color: #ec446b;
}
.my-form .warn label{
	display: block;
	line-height: 20px;
	visibility: hidden;
}
.my-form .warn label:first-child{
	display: block;
	visibility: visible;
}
.my-form .o-form{
	font-size: 14px;
	color: #CCCCCC;
}
.my-form .o-form a.forget-pwd{
	float: right;
	color: #CCCCCC;
}
.my-form .down-con{
	position: absolute;
	bottom:40px;
	right:30px;
	left:30px;
}
#register .my-form .down-con .down-a{
	position: absolute;
	right:0;
}
.my-form .down-con a{
	display: inline-block;
	font-size: 16px;
	color: #CCCCCC;
}
.my-form .down-con a em{
	margin-right: 5px;
}
.my-form .down-con a.register-a{
	float: right;
}
.my-form .down-con a:hover{
	color: #FFFFFF;
}

.my-form .o-form .agree-rule a{
	color: #CCCCCC;
	text-decoration: underline;
}
.my-form .o-form a:hover{
	color: #FFFFFF;
}

.my-form .control-form{
	position: relative;
}

.ui-input{
	width: 300px;
	height: 42px;
	padding:12px 20px;
	line-height: 14px;
	border:1px solid #FFF;
	border-radius: 2px;
}
.ui-input:focus{
	border:1px solid #03b8cc;
}
.ui-input-ph{
	color: #bfbfbf;
}
.ui-btn{
	display: inline-block;
	width: 300px;
	height: 42px;
	line-height: 42px;
	border: 0;
	border-radius: 2px;
	color: #FFF;
	text-align: center;
	font-size: 18px;
	background: #03b8cc;
	cursor: pointer;
}
.ui-btn:hover{
	text-decoration: none;
}
.ui-btn-blue{
	background: #03b8cc;
}
.ui-btn-blue:hover{
	background: #00c4da;
}
.ui-btn-blue:active{
	background: #03b8cc;
}
.ui-btn-blue[disabled]{
	background: #05d0e7;
	cursor: not-allowed;
}
.ui-btn-blue[disabled]:hover{
	background: #05d0e7;
}
.control-box .control-form{
	margin-bottom:18px;
}

.auth-image{
	position: absolute;
  right: 1px;
  top: 1px;
  height: 40px;
}
</style>
