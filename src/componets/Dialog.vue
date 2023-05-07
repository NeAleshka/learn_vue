<template>
  <v-btn color="primary" @click="dialog = true">Open modal</v-btn>
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
import { defineComponent } from "vue";
export default defineComponent({
  data() {
    return {
      dialog: true,
    };
  },

  props: {
    textButton: {
      type: String,
      requared: false,
      default: "Open Modal",
    },
  },
  methods: {
    closeDialog() {
      this.$emit("close-dialog");
    },
  },
});
</script>
