<template>
  <div class="main">
    <a-form
      id="formLogin"
      class="user-layout-login"
      ref="formLogin"
      :form="form"
      @submit="handleSubmit"
			>
      <a-tabs
        :activeKey="customActiveKey"
        :tabBarStyle="{ textAlign: 'center', borderBottom: 'unset' }"
        @change="handleTabClick"
				>
        <a-tab-pane key="tab-account" tab="账号密码登录">
          <a-alert v-if="isLoginError" type="error" showIcon style="margin-bottom: 24px;" 
							message="账户或密码错误" />
          <a-form-item>
            <a-input
              size="large"
              type="text"
              placeholder="账号/邮箱"
              v-decorator="[
                'username',
                {
									rules: [
										{ required: true, message: '请输入帐户名或邮箱地址' }, 
										{ validator: handleUsernameOrEmail }
									], 
									validateTrigger: 'change'
								}
              ]"
            >
							<template v-slot:prefix>
								<a-icon type="user" :style="{ color: 'rgba(0,0,0,.25)' }"/>
							</template>
            </a-input>
          </a-form-item>

          <a-form-item>
            <a-input
              size="large"
              type="password"
              autocomplete="false"
              placeholder="密码"
              v-decorator="[
                'password',
                {rules: [{ required: true, message: '请输入密码' }], validateTrigger: 'blur'}
              ]"
            >
							<template v-slot:prefix>
								<a-icon type="lock" :style="{ color: 'rgba(0,0,0,.25)' }"/>
							</template>
              
            </a-input>
          </a-form-item>
        </a-tab-pane>
				
        <a-tab-pane key="tab-mobile" tab="手机号登录">
          <a-form-item>
            <a-input size="large" type="text" placeholder="手机号" 
							v-decorator="[
								'mobile', 
								{
									rules: [{ required: true, pattern: /^1[34578]\d{9}$/, message: '请输入正确的手机号' }], 
									validateTrigger: 'change'
								}
							]"
							>
              <a-icon slot="prefix" type="mobile" :style="{ color: 'rgba(0,0,0,.25)' }"/>
            </a-input>
          </a-form-item>

          <a-row :gutter="16">
            <a-col class="gutter-row" :span="16">
              <a-form-item>
                <a-input size="large" type="text" placeholder="验证码" 
									v-decorator="[
										'captcha', 
										{
											rules: [{ required: true, message: '请输入验证码' }], 
											validateTrigger: 'blur'
										}
									]"
									>
                  <a-icon slot="prefix" type="mail" :style="{ color: 'rgba(0,0,0,.25)' }"/>
                </a-input>
              </a-form-item>
            </a-col>
            <a-col class="gutter-row" :span="8">
              <a-button
                class="getCaptcha"
                tabindex="-1"
                :disabled="state.smsSendBtn"
                @click.stop.prevent="getCaptcha"
                v-text="!state.smsSendBtn && '获取验证码' || (state.time+' s')"
              ></a-button>
            </a-col>
          </a-row>
        </a-tab-pane>
      </a-tabs>

      <a-form-item>
        <a-checkbox v-decorator="['rememberMe', { valuePropName: 'checked' }]">自动登录</a-checkbox>
        <router-link
          :to="{ name: 'recover', params: { user: 'aaa'} }"
          class="forge-password"
          style="float: right;"
        >忘记密码</router-link>
      </a-form-item>

      <a-form-item style="margin-top:24px">
        <a-button
          size="large"
          type="primary"
          htmlType="submit"
          class="login-button"
          :loading="state.loginBtn"
          :disabled="state.loginBtn"
        >确定</a-button>
      </a-form-item>

      <div class="user-login-other">
        <router-link class="register" :to="{ name: 'register' }">注册账户</router-link>
      </div>
    </a-form>
  </div>
</template>

<script>
import md5 from 'md5'
import { mapActions } from 'vuex'
import { timeFix } from '@/utils/util'
import { getSmsCaptcha } from '@/api/login'
export default {
  components: {
    
  },
  data () {
    return {
      // login type: 0 email, 1 username, 2 telephone
      customActiveKey: 'tab-account',
      loginBtn: false,
      loginType: 0,
      isLoginError: false,
      stepCaptchaVisible: false,
      form: this.$form.createForm(this),
      state: {
        time: 60,
        loginBtn: false,
        loginType: 0,
        smsSendBtn: false
      }
    }
  },
	
  created () {

  },
	
  methods: {
    ...mapActions(['Login', 'Logout']),
		
    // handler
    handleUsernameOrEmail (rule, value, callback) {
      const { state } = this
      const regex = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/
      if (regex.test(value)) {
        state.loginType = 0
      } else {
        state.loginType = 1
      }
      callback()
    },
		
    handleTabClick (key) {
      this.customActiveKey = key
      // this.form.resetFields()
    },
		
    handleSubmit (e) {
      e.preventDefault()
      const {
        form: { validateFields },
        state,
        customActiveKey,
        Login
      } = this
      state.loginBtn = true
      const validateFieldsKey = customActiveKey === 'tab-account' 
												? ['username', 'password'] 
												: ['mobile', 'captcha']
      validateFields(validateFieldsKey, { force: true }, (err, values) => {
        if (!err) {
          console.log('login form', values)
          const loginParams = { ...values }
          if (loginParams.mobile) {
						delete loginParams.username
					} else {
						delete loginParams.mobile
						loginParams[!state.loginType ? 'email' : 'username'] = values.username
						loginParams.password = md5(values.password)
						if(!state.loginType) {
							delete loginParams.username
						}
					}
          Login(loginParams).then(res => {
							if (res.data.status == 200)
								this.loginSuccess(res)
							else 
								this.requestFailed(res)
						})
            .catch(err => {
							this.requestFailed(err)
						})
            .finally(() => {
              state.loginBtn = false
            })
        } else {
          setTimeout(() => {
            state.loginBtn = false
          }, 600)
        }
      })
    },
		
    getCaptcha (e) {
      e.preventDefault()
      const { form: { validateFields }, state } = this
      validateFields(['mobile'], { force: true }, (err, values) => {
        if (!err) {
          state.smsSendBtn = true
          const interval = window.setInterval(() => {
            if (state.time-- <= 0) {
              state.time = 60
              state.smsSendBtn = false
              window.clearInterval(interval)
            }
          }, 1000)
          const hide = this.$message.loading('验证码发送中..', 0)
					setTimeout(hide, 2500)
          getSmsCaptcha({ phone: values.mobile }).then(res => {
						setTimeout(hide, 10)
						if (res.data.result){
							this.$notification['success']({
							  message: '提示',
							  description: '验证码获取成功，您的验证码为：' + res.data.result + ', 有效期为5分钟。',
							  duration: 8
							})
						} else {
							this.$notification['error']({
							  message: '错误',
							  description: '验证码获取失败。',
							  duration: 4
							})
						}
          }).catch(err => {
            clearInterval(interval)
            state.time = 60
            state.smsSendBtn = false
            this.requestFailed(err)
          })
        }
      })
    },
		
    stepCaptchaSuccess () {
      this.loginSuccess()
    },
		
    stepCaptchaCancel () {
      this.Logout().then(() => {
        this.loginBtn = false
        this.stepCaptchaVisible = false
      })
    },
		
    loginSuccess (res) {
      // console.log(res)
      // check res.homePage define, set $router.push name res.homePage
      this.$router.push({ path: '/' })
      // 延迟 1 秒显示欢迎信息
      setTimeout(() => {
        this.$notification.success({
          message: '欢迎',
          description: `${timeFix()}，${res.data.result.nickname}, 欢迎回来`
        })
      }, 1000)
      this.isLoginError = false
    },
		
    requestFailed (err) {
      this.isLoginError = true
      this.$notification['error']({
        message: '错误',
        description: ((err || {}).data || {}).message || '请求出现错误，请稍后再试',
        duration: 4
      })
    }
  }
}
</script>

<style lang="less" scoped>
.user-layout-login {
  label {
    font-size: 14px;
  }
  .getCaptcha {
    display: block;
    width: 100%;
    height: 40px;
  }
  .forge-password {
    font-size: 14px;
  }
  button.login-button {
    padding: 0 15px;
    font-size: 16px;
    height: 40px;
    width: 100%;
  }
  .user-login-other {
    text-align: left;
    margin-top: 24px;
    line-height: 22px;
    .item-icon {
      font-size: 24px;
      color: rgba(0, 0, 0, 0.2);
      margin-left: 16px;
      vertical-align: middle;
      cursor: pointer;
      transition: color 0.3s;
      &:hover {
        color: #1890ff;
      }
    }
    .register {
      float: right;
    }
  }
}
</style>
