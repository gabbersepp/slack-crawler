<template>
    <v-list>
      <v-list-item three-line v-for="msg in messages" :key="msg.ts">
        <v-list-item-content>
          <v-list-item-title>{{ msg.displayUser }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ msg.text }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
</template>

<script lang="ts">
import Message from '@/contracts/server/Message';
import Api from '@/utils/Api';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class Messages extends Vue {
    private api: Api = new Api();
    private messages: Message[] = [];

    public async mounted() {
        const id = this.$route.params.id;
        const msgs = await this.api.getMessages(id);
        this.messages.push(...msgs.filter(x => x.text !== ""));
    }
}
</script>

<style lang="scss">

</style>