<template>
  <v-app>
    <v-app-bar app color="#3F0E40" dark>
        <v-text-field  prepend-icon="mdi-magnify" v-model="searchValueMessages" placeholder="Nachricht" clearable></v-text-field>
    </v-app-bar>

    <Navigation :users="users" :channels="channels" :ims="ims" />
    <v-content>
      <router-view :key="$route.name + ($route.params.id || '')" v-if="initialized" /><!--v-if="!searchedMessages" -->
      <!--<MessageList :messages="searchedMessages" v-if="searchedMessages" />-->
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import SlackId from './contracts/SlackId';
import ImId from './contracts/ImId';
import Navigation from "./components/Navigation.vue";
import MessageList from "./components/MessageList.vue";

import Api from './utils/Api';
import Utils from './utils/Utils';
import Message from './contracts/server/Message';

@Component({
  components: {
    Navigation,
    MessageList
  }
})
export default class App extends Vue {

  private users: SlackId[] = [];
  private channels: SlackId[] = [];
  private ims: ImId[] = [];

  private searchValueMessages: string = "";

  private debouncedId: number = 0;

  private api: Api = new Api();
  private initialized: boolean = false;

  public async created() {
    const slackIdResult = await this.api.getSlackIds();
    this.users = slackIdResult.userList;
    this.channels = slackIdResult.channelList;
    this.ims = slackIdResult.imsList;
    this.initialized = true;
  }

  @Watch("searchValueMessages")
  private async searchMessages() {
    if (this.debouncedId > 0) {
      clearTimeout(this.debouncedId);
    }
    this.debouncedId = setTimeout(async () => {
      if (this.searchValueMessages) {
        //this.searchedMessages = await this.api.searchMessages(this.searchValueMessages);
        this.$router.push({ path: `/messages/search/${this.searchValueMessages}` })
      } else {
        this.$router.push({ path: `/messages/_/noMessage` })
      }

      clearTimeout(this.debouncedId);
    }, 500);
  }
}
</script>
