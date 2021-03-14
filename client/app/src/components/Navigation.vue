<template>
    <v-navigation-drawer permanent app class="pa-1">
        <v-text-field  prepend-icon="mdi-magnify" v-model="searchValue" placeholder="Kanal oder User" clearable></v-text-field>
        
        <v-expansion-panels accordion multiple v-model="panels">
            <v-expansion-panel>
                <v-expansion-panel-header>Kanäle</v-expansion-panel-header>
                <v-expansion-panel-content>
                    <v-list dense nav>
                        <v-list-item v-for="item in filteredChannels" :key="item.id" link>
                            <v-list-item-content @click="select(item.id)">
                                <v-list-item-title>{{ item.name }}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
                <v-expansion-panel-header>Nachrichten</v-expansion-panel-header>
                <v-expansion-panel-content>
                    <v-list dense nav>
                        <v-list-item v-for="item in filteredUsers" :key="item.id" link>
                            <v-list-item-content @click="selectIm(item.id)">
                                <v-list-item-title>{{ item.name }}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-expansion-panel-content>
            </v-expansion-panel>

        </v-expansion-panels>
    
    </v-navigation-drawer>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import SlackId from '@/contracts/SlackId';
import ImId from '@/contracts/ImId';

@Component
export default class Navigation extends Vue {
    @Prop()
    private users!: SlackId[];
    @Prop()
    private channels!: SlackId[];
    @Prop()
    private ims: ImId[] = [];

    private filteredChannels: SlackId[] = [];
    private filteredUsers: SlackId[] = [];

    private panels: number[] = [];
    private searchValue: string = "";

    @Watch("searchValue")
    @Watch("users", { immediate: true })
    @Watch("channels", { immediate: true })
    private search() {
        this.panels.splice(0, 2);

        if (this.searchValue && this.searchValue.length > 0) {
            let filtered = this.channels.filter(x => x.id.indexOf(this.searchValue) > -1 || x.name.indexOf(this.searchValue) > -1);
            this.filteredChannels = filtered;
            if (filtered.length > 0) {
                this.panels.push(0);
            }
            filtered = this.users.filter(x => x.id.indexOf(this.searchValue) > -1 || x.name.indexOf(this.searchValue) > -1);
            this.filteredUsers = filtered;
            if (filtered.length > 0) {
                this.panels.push(1);
            }
        } else {
            this.filteredUsers = this.users;
            this.filteredChannels = this.channels;
        }
    }

    public select(id: string) {
        this.$router.push({ path: `/messages/channel/${id}` })
    }

    public selectIm(id: string) {
        const im = this.ims.find(x => x.user === id)
        if (im) {
        this.$router.push({ path: `/messages/im/${im.id}` })
        }
    }
}
</script>

<style lang="scss" scoped>

</style>