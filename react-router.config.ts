import type { Config } from "@react-router/dev/config";

export default {
  basename: import.meta.env.PROD ? "/legato/" : "/",
  ssr: false,
} satisfies Config;
