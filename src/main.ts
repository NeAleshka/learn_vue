import { createApp } from "vue";
import withUUID from "vue-uuid";
import App from "./App.vue";
import "./index.css";

createApp(App).use(withUUID).mount("#app");
