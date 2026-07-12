<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui';
import { onMounted, reactive, ref } from 'vue';

interface FormState {
  qq: string;
  email: string;
  token: string;
  remind: boolean;
}

const state = reactive<FormState>({
  qq: '',
  email: '',
  token: '',
  remind: true,
});
const submitting = ref(false);
const submitText = ref('提交');

/**
 * 根据 QQ 号生成 QQ 邮箱地址
 */
function getQQEmailAddress(qqNumber: string): string {
  return `${qqNumber}@qq.com`;
}

onMounted(() => {
  const queryString = window.location.search;
  const params = new URLSearchParams(queryString);
  const qqParam = params.get('qq');
  if (qqParam && /^\d{5,20}$/.test(qqParam)) {
    const qqValue = qqParam;
    if (qqValue) {
      state.qq = qqValue;
      state.email = getQQEmailAddress(qqValue);
    }
  }
});

/**
 * 表单验证
 */
function validate(state: {
  qq: string;
  email: string;
  token: string;
  remind: boolean;
}): FormError[] {
  const errors: FormError[] = [];
  if (!state.qq || !/^\d{5,20}$/.test(state.qq)) {
    errors.push({ name: 'qq', message: '请填写有效的QQ号' });
  }
  if (!state.email) {
    errors.push({ name: 'email', message: '请填写有效的邮箱地址' });
  }
  if (!state.token || state.token.length !== 24) {
    errors.push({ name: 'token', message: 'token 格式错误' });
  }
  return errors;
}

/**
 * 提交表单
 */
async function handleSubmit(
  event: FormSubmitEvent<{ qq: string; email: string; token: string; remind: boolean }>,
) {
  submitting.value = true;
  submitText.value = '提交中...';

  try {
    const response = await fetch('https://biobot.biohazard.top/BioBot/plugins/sklassistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event.data),
    });
    const data = await response.json();
    alert(data.message);
    submitText.value = '提交完成';
  } catch (error) {
    alert(`Error: ${error}`);
    console.log(error);
    submitText.value = '提交失败';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        description="提供森空岛自动签到、干员查询、仓库查询、森空岛小秘书等各种实用功能"
        title="BioBot 森空岛小助手"
      />

      <UPageBody class="space-y-8">
        <!-- 如何使用 -->
        <section>
          <h2 class="mbe-4 text-2xl font-bold">如何使用</h2>

          <div class="space-y-6">
            <div>
              <h3 class="mbe-2 text-lg font-semibold">Step 1</h3>
              <p>
                使用浏览器打开鹰角网络官网
                <ULink
                  class="font-medium text-primary"
                  external
                  href="https://www.hypergryph.com/"
                  rel="noopener noreferrer"
                  target="_blank"
                  >https://www.hypergryph.com/</ULink
                >，并使用鹰角网络通行证登录。
              </p>
            </div>

            <div>
              <h3 class="mbe-2 text-lg font-semibold">Step 2</h3>
              <p class="mbe-2">
                用上一步所使用的同一个浏览器，访问
                <ULink
                  class="font-medium text-primary"
                  external
                  href="https://web-api.hypergryph.com/account/info/hg"
                  rel="noopener noreferrer"
                  target="_blank"
                  >https://web-api.hypergryph.com/account/info/hg</ULink
                >
              </p>
              <p class="mbe-2">返回如下信息：</p>
              <pre
                class="rounded-lg border border-default bg-elevated/50 p-4 text-sm whitespace-pre-wrap"
              ><code>{
    "code": 0,
    "data": {
        "content": "1145141919810ABCDEFGHIJ"
    },
    "msg": "接口会返回您的鹰角网络通行证账号的登录凭证，此凭证可以用于鹰角网络账号系统校验您登录的有效性。泄露登录凭证属于极度危险操作，为了您的账号安全，请勿将此凭证以任何形式告知他人！"
}</code></pre>
            </div>

            <div>
              <h3 class="mbe-2 text-lg font-semibold">Step 3</h3>
              <p class="mbe-4">
                把获取到的 token，以及您的联系方式，填入下面的输入框中，并点击提交。<br />
                （token 是
                <code class="text-code rounded-sm bg-elevated/50 px-1 text-sm ring ring-default"
                  >"content":</code
                >
                后面的内容，不包含双引号。在上面的例子中 token 是
                <code class="text-code rounded-sm bg-elevated/50 px-1 text-sm ring ring-default"
                  >1145141919810ABCDEFGHIJ</code
                >）
              </p>

              <UCard variant="subtle">
                <UForm class="space-y-4" :state="state" :validate="validate" @submit="handleSubmit">
                  <UFormField label="QQ" name="qq" required>
                    <UInput
                      id="qqInput"
                      v-model="state.qq"
                      :maxlength="20"
                      :minlength="5"
                      name="qq"
                      pattern="^\d{5,20}$"
                      placeholder="请填写QQ号"
                      required
                    />
                  </UFormField>

                  <UFormField label="Email" name="email" required>
                    <UInput id="emailInput" v-model="state.email" required type="email" />
                  </UFormField>

                  <UFormField label="Token" name="token" required>
                    <UInput
                      id="tokenInput"
                      v-model="state.token"
                      :maxlength="24"
                      :minlength="24"
                      name="token"
                      pattern="^([A-Za-z0-9+\/]{4})*([A-Za-z0-9+\/]{4}|[A-Za-z0-9+\/]{3}=|[A-Za-z0-9+\/]{2}==)$"
                      placeholder="不包含双引号"
                      required
                    />
                  </UFormField>

                  <UCheckbox
                    id="remindInput"
                    v-model="state.remind"
                    label="启用邮件提醒"
                    name="remind"
                  />

                  <UButton :disabled="submitting" type="submit">
                    {{ submitText }}
                  </UButton>
                </UForm>
              </UCard>
            </div>
          </div>
        </section>

        <!-- 为什么我要填联系方式 -->
        <section>
          <h2 class="mbe-4 text-2xl font-bold">为什么我要填联系方式</h2>
          <p>填写邮箱是为了在签到成功或失败之后给您发送邮件提醒。</p>
          <p>填写 QQ 号是为了使您有办法停用自动签到或者删除 token。</p>
          <p>请您务必填写真实准确的联系方式，否则您没有办法停用自动签到！</p>
        </section>

        <!-- 致谢 -->
        <section class="flex flex-col items-start">
          <h2 class="mbe-4 text-2xl font-bold">致谢</h2>
          <UButton
            label="ProbiusOfficial/Skland_API"
            rel="noopener noreferrer"
            target="_blank"
            to="https://github.com/ProbiusOfficial/Skland_API"
            trailing-icon="i-lucide-external-link"
            variant="link"
          />
          <UButton
            label="GuGuMur/nonebot-plugin-skland-arksign"
            rel="noopener noreferrer"
            target="_blank"
            to="https://github.com/GuGuMur/nonebot-plugin-skland-arksign"
            trailing-icon="i-lucide-external-link"
            variant="link"
          />
          <UButton
            label="FancyCabbage/skyland-auto-sign"
            rel="noopener noreferrer"
            target="_blank"
            to="https://gitee.com/FancyCabbage/skyland-auto-sign"
            trailing-icon="i-lucide-external-link"
            variant="link"
          />
          <UButton
            label="sklandplus/sklandplus"
            rel="noopener noreferrer"
            target="_blank"
            to="https://github.com/sklandplus/sklandplus"
            trailing-icon="i-lucide-external-link"
            variant="link"
          />
        </section>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
