import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("documentation", "routes/documentation.tsx"),
    route("mix/:id", "routes/mix.tsx"),
  ]),
] satisfies RouteConfig;
