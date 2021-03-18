<template>
  <div>
    <MessageList :messages="messages" v-if="!noMessage">
      <template v-slot:default="props">
        <v-list-item-title v-if="entity === 'channel'">
          <v-btn text color="#3F0E40" @click="$router.push({ path: `/messages/im/${props.msg.user}` })">{{ props.msg.displayUser }}</v-btn>
        </v-list-item-title>
        <v-list-item-title v-if="entity === 'search' && !props.msg.isIm">
          <v-btn text color="#3F0E40" @click="$router.push({ path: `/messages/channel/${props.msg.channel}` })">{{ props.msg.displayTarget }}</v-btn>
        </v-list-item-title>
        <v-list-item-title v-if="props.msg.isIm">
          <v-btn text color="#3F0E40" @click="$router.push({ path: `/messages/im/${props.msg.user}` })">{{ props.msg.displayTarget }}</v-btn>
        </v-list-item-title>
      </template>
      <template v-slot:thread="props">
        <MessageList :messages="props.messages">
          <template v-slot:default="props">
            <v-list-item-title>
              <v-btn text color="#3F0E40" @click="$router.push({ path: `/messages/im/${props.msg.user}` })">{{ props.msg.displayUser }}</v-btn>
            </v-list-item-title>
          </template>
        </MessageList>
      </template>
    </MessageList>
    <div>
      Keine Nachricht ausgewählt
    </div>
  </div>
</template>

<script lang="ts">
import Message from '@/contracts/server/Message';
import Api from '@/utils/Api';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import MessageList from "@/components/MessageList.vue";

@Component({
  components: {
    MessageList
  }
})
export default class Messages extends Vue {
    private api: Api = new Api();
    private messages: Message[] = [];
    private noMessage: boolean = false;
    private entity: string = "";

    public async mounted() {
        const id = this.$route.params.id;
        const entity = this.$route.params.entity;
        this.entity = entity;
        this.noMessage = false;

        if (entity === "_" && id === "noMessage") {
          this.noMessage = true;
        } else if (entity === "search") {
          // search messages
          const searchResult = await this.api.searchMessages(id);
          this.messages.push(...searchResult);
        } else if (entity === "channel") {
          const msgs = await this.api.getMessages(id);
          this.messages.push(...msgs.filter(x => x.text !== ""));
        } else if (entity === "im") {
          const msgs = await this.api.getMessages(id);
          this.messages.push(...msgs.filter(x => x.text !== ""));
        }
    }
}
</script>

<style lang="scss">

</style>