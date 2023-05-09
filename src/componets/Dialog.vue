<template>
  <v-btn v-if="withButton" color="primary" @click="dialog = true">{{
    textButton
  }}</v-btn>
  <v-dialog v-model="dialog" width="auto" maxWidth="600px">
    <v-card>
      <v-card-text>
        <h2>
          You should get your Api-key on
          <a
            class="text-blue-400"
            href="https://min-api.cryptocompare.com/"
            target="_blank"
            >Cryptocompare.com</a
          >
          for work this app and enter it below
        </h2>
      </v-card-text>
      <slot></slot>
      <v-card-actions class="justify-end pr-3">
        <v-btn variant="text" @click="dialog = false"> Cancel </v-btn>
        <v-btn variant="elevated" color="lime-darken-3" @click="confirm">
          Confirm
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
      dialog: !Boolean(localStorage.getItem("api-key")),
      apiKey: "",
    };
  },
  props: {
    withButton: {
      type: Boolean,
      required: false,
      default: false,
    },
    textButton: {
      type: String,
      required: false,
      default: "Open Modal",
      validator: (value: string) => {
        if (!value.length) {
          return false;
        }
        return true;
      },
    },
  },

  methods: {
    confirm() {
      this.$emit("confirm");
      this.dialog = false;
    },
  },
});
</script>
