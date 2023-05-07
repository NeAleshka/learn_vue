<template>
  <v-btn v-if="withButton" color="primary" @click="dialog = true">{{
    textButton
  }}</v-btn>
  <v-dialog v-model="dialog" width="auto">
    <v-card>
      <v-card-text>
        <h2>Add new project</h2>
      </v-card-text>
      <slot></slot>
      <v-card-actions>
        <v-btn color="primary" block @click="dialog = false">
          Close Dialog
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
// import { defineComponent } from "vue";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  data() {
    return {
      dialog: true,
    };
  },
  props: {
    withButton: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: false,
    },
    textButton: {
      type: String as PropType<string>,
      required: false,
      default: "Open Modal",
      validator(value:string){
        if(value==='') return false
        return true
      },
    },
  },
  methods: {
    closeDialog() {
      this.$emit("close-dialog");
    },
  },
});
</script>
