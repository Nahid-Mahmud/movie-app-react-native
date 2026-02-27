import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import useFetch from "@/hooks/useFetch";
import { fetchMovies } from "@/services/api";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
  } = useFetch(() =>
    fetchMovies({
      query: "",
    }),
  );

  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="w-full absolute z-0" />

      {moviesLoading ? (
        <ActivityIndicator size="large" color="#0000ff" className="flex-1" />
      ) : moviesError ? (
        <Text className="text-red-500 p-5">{moviesError.message}</Text>
      ) : (
        <FlatList
          className="flex-1 p-5"
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <MovieCard movie={item} />}
          numColumns={3}
          columnWrapperStyle={{ justifyContent: "flex-start", marginBottom: 10, gap: 20, paddingRight: 5 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ minHeight: "100%", paddingBottom: insets.bottom + 100 }}
          ListHeaderComponent={
            <>
              <Image source={icons.logo} className="size-20 mt-20 mb-5 mx-auto self-center w-12 h-10" />
              <SearchBar onPress={() => router.push("/search")} placeholder="Search movies, shows, actors..." />
              <Text className="text-white text-lg font-bold mt-5 mb-3">Trending Movies</Text>
            </>
          }
        />
      )}
    </View>
  );
}
