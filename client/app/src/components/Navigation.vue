<template>
    <v-navigation-drawer permanent>
        <v-text-field  prepend-icon="mdi-magnify" v-model="searchValue" placeholder="Kanal oder User" clearable></v-text-field>
        <v-text-field  prepend-icon="mdi-magnify" v-model="searchValueMessages" placeholder="Nachricht" clearable></v-text-field>
        
        <v-expansion-panels accordion multiple v-model="panels">
            <v-expansion-panel>
                <v-expansion-panel-header>Kanäle</v-expansion-panel-header>
                <v-expansion-panel-content>
                    <v-list dense nav>
                        <v-list-item v-for="item in channels" :key="item.id" link>
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
                        <v-list-item v-for="item in users" :key="item.id" link>
                            <v-list-item-content @click="select(item.id)">
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
import SlackId from '@/contracts/SlackId';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class Navigation extends Vue {
    @Prop()
    private users!: SlackId[];
    @Prop()
    private channels!: SlackId[];

    private panels: number[] = [];
    private searchValue: string = "";
    private searchValueMessages: string = "";

    @Watch("searchValue")
    private search() {
        
    }
}
</script>

<style lang="scss" scoped>

</style>