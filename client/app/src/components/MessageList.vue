<template>
    <v-list>
      <v-list-item three-line v-for="msg in messages" :key="msg.ts">
        <v-list-item-content>
          <v-row no-gutters>
            <v-col :cols="1"><slot :msg="msg"></slot></v-col>
            <v-col v-if="msg.reply_count"><v-btn text color="#3F0E40" @click="loadThread(msg)">{{ msg.reply_count }} Antworten</v-btn></v-col></v-row>
          <v-list-item-subtitle>
            {{msg.text}}
          </v-list-item-subtitle>
          <v-list-item-subtitle v-if="threadMessages.length > 0 && threadMessages[0].thread_ts === msg.thread_ts" class="threadbox">
            <slot :messages="threadMessages" name="thread"></slot>
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
export default class MessageList extends Vue {
    @Prop()
    private messages!: Message[];

    private threadMessages: Message[] = [];
    private api: Api = new Api();

    private async loadThread(msg: Message) {
      this.threadMessages.splice(0, this.threadMessages.length);
      this.threadMessages.push(...(await this.api.getThreadMessages(msg.channel, msg.thread_ts)));
    }
}
</script>

<style lang="scss" scoped>
.threadbox {
  border-left: 1px solid #3F0E40;
}
</style>