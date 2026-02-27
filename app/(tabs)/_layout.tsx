import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { Tabs } from "expo-router";
import React from "react";
import { Image, ImageBackground, Text, View } from "react-native";

const TabIcon = ({ focused, icon, title }: { focused: boolean; icon: any; title: string }) => {
  if (focused) {
    return (
      <ImageBackground
        className="flex flex-row w-full flex-1 min-w-[100px] min-h-16 mt-4 items-center justify-center rounded-full overflow-hidden"
        source={images.highlight}
      >
        <Image source={icon} tintColor={"#151312"} className="size-5" />
        <Text className="text-secondary font-semibold ml-2 text-base">{title}</Text>
      </ImageBackground>
    );
  } else {
    return (
      <View className="items-center justify-center size-full mt-4 rounded-full">
        <Image source={icon} tintColor={"#A8B5DB"} className="size-5" />
      </View>
    );
  }
};

const _Layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor: "#0f0d23",
          borderRadius: 50,
          marginHorizontal: 20,
          height: 50,
          marginBottom: 36,
          position: "absolute",
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#0f0d23",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon icon={icons.home} title="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          headerShown: false,
          title: "Search",
          tabBarIcon: ({ focused }) => <TabIcon icon={icons.search} title="Search" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          headerShown: false,
          title: "Saved",
          tabBarIcon: ({ focused }) => <TabIcon icon={icons.save} title="Saved" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          title: "Profile",
          tabBarIcon: ({ focused }) => <TabIcon icon={icons.person} title="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
};

export default _Layout;
