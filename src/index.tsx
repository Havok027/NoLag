import { definePlugin } from "@decky/api";
import { staticClasses } from "@decky/ui";
import { FaNetworkWired } from "react-icons/fa";
import { Content } from "./Content";

export default definePlugin(() => ({
  name: "NoLag",
  titleView: <div className={staticClasses.Title}>NoLag</div>,
  content: <Content />,
  icon: <FaNetworkWired />,
  onDismount() {},
}));
