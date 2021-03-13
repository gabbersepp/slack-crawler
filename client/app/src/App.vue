<template>
  <v-app>
        <v-app-bar
      app
      color="#3F0E40"
      dark
    >

      <v-spacer></v-spacer>

    </v-app-bar>

    <v-main>
      <Navigation :users="users" :channels="channels" />

      <router-view :key="$route.name + ($route.params.id || '')"/>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import SlackId from './contracts/SlackId';
import ImId from './contracts/ImId';
import Navigation from "./components/Navigation.vue";

import Api from './utils/Api';
import Utils from './utils/Utils';

@Component({
  components: {
    Navigation
  }
})
export default class App extends Vue {

  private users: SlackId[] = [];
  private channels: SlackId[] = [];
  private ims: ImId[] = [];

  private api: Api = new Api();

  public async created() {
    const slackIdResult = await this.api.getSlackIds();
    this.users = slackIdResult.userList;
    this.channels = slackIdResult.channelList;
    this.ims = slackIdResult.imsList;
  }

  public selectIm(id: string) {
    const im = this.ims.find(x => x.user === id)
    if (im) {
      this.$router.push({ path: `/messages/${im.id}` })
    }
  }
}
</script>
