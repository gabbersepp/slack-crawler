<template>
    <v-list>
      <v-list-item three-line v-for="msg in messages" :key="msg.ts">
        <v-list-item-content>
            <slot :msg="msg"></slot>
          <v-list-item-subtitle>
            {{msg.text}}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
</template>

<script lang="ts">
import Message from '@/contracts/server/Message';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class MessageList extends Vue {
    @Prop()
    private messages!: Message[];
}
</script>

<style lang="scss" scoped>

</style>