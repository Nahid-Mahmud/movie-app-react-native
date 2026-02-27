import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchMovies } from "@/services/api";
import useFetch from "@/services/useFetch";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Image, ScrollView, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
  } = useFetch(
    () =>
      fetchMovies({
        query: "",
      }),
    true,
  );
  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="w-full absolute z-0" />
      <ScrollView
        className="flex-1 p-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          minHeight: "100%",
          paddingBottom: 10,
        }}
      >
        <Image source={icons.logo} className="size-20 mt-20 mb-5 mx-auto self-center w-12 h-10" />
        {moviesLoading ? (
          <ActivityIndicator size={"large"} color={"#0000ff"} />
        ) : moviesError ? (
          <View>
            <Text className="text-red-500">{moviesError.message}</Text>
          </View>
        ) : (
          <View className="flex-1 mt-5">
            <SearchBar onPress={() => router.push("/search")} placeholder="Search movies, shows, actors..." />
            <>
              <Text className="text-white text-lg font-bold mt-5 mb-3">Trending Movies</Text>
              <FlatList
                keyExtractor={(item) => item.id.toString()}
                data={movies}
                renderItem={({ item }) => <Text className="text-white">{item.title}</Text>}
                numColumns={3}
                columnWrapperStyle={{ justifyContent: "flex-start", marginBottom: 10, gap: 20, paddingRight: 5 }}
              />
            </>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
