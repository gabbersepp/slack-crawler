<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
          transition="scale-transition"
          width="40"
        />

        <v-img
          alt="Vuetify Name"
          class="shrink mt-1 hidden-sm-and-down"
          contain
          min-width="100"
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-name-dark.png"
          width="100"
        />
      </div>

      <v-spacer></v-spacer>

      <v-btn
        href="https://github.com/vuetifyjs/vuetify/releases/latest"
        target="_blank"
        text
      >
        <span class="mr-2">Latest Release</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
          <v-navigation-drawer permanent app>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="title">
                  Slack
                </v-list-item-title>
                <v-list-item-subtitle>
                  Messages
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-divider></v-divider>

            <v-list
              dense
              nav
            >
              <v-list-item
                v-for="item in channels"
                :key="item.id"
                link
              >
                <v-list-item-content @click="select(item.id)">
                  <v-list-item-title>{{ item.name }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-divider></v-divider>

            <v-list
              dense
              nav
            >
              <v-list-item
                v-for="item in users"
                :key="item.id"
                link
              >
                <v-list-item-content @click="selectIm(item.id)">
                  <v-list-item-title>{{ item.name }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            

          </v-navigation-drawer>

      <router-view :key="$route.name + ($route.params.id || '')"/>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import SlackId from './contracts/SlackId';
import ImId from './contracts/ImId';

import Api from './utils/Api';
import Utils from './utils/Utils';

@Component
export default class App extends Vue {

  private users: SlackId[] = [];
  private channels: SlackId[] = [];
  private ims: ImId[] = [];

  private api: Api = new Api();

  public async created() {
    Utils.Config = await Utils.getConfig();
    const slackIdResult = await this.api.getSlackIds();
    this.users = slackIdResult.userList;
    this.channels = slackIdResult.channelList;
    this.ims = slackIdResult.imsList;
  }

  public select(id: string) {
    this.$router.push({ path: `/messages/${id}` })
  }

  public selectIm(id: string) {
    const im = this.ims.find(x => x.user === id)
    if (im) {
      this.$router.push({ path: `/messages/${im.id}` })
    }
  }
}
</script>
