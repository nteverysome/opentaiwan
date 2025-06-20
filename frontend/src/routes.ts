import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("simple", "routes/simple.tsx"),
] satisfies RouteConfig;
