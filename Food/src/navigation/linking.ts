import { LinkingOptions } from "@react-navigation/native";

export const linking: LinkingOptions<any> = {
  prefixes: ["juniper://"],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Home: {
            screens: {
              RestaurantDetail: "restaurant/:id",
            },
          },
        },
      },
    },
  },
};
