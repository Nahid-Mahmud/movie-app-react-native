import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import useFetch from "@/hooks/useFetch";
import { fetchMovies } from "@/services/api";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useDebounce from "../../hooks/useDebounce";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 500);
  // const router = useRouter(); // router is not used, so comment out to avoid warning
  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
    refetch: refetchMovies,
  } = useFetch(
    () =>
      fetchMovies({
        query: debouncedQuery,
      }),
    false,
  );

  const insets = useSafeAreaInsets();

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (debouncedQuery.trim()) {
        await refetchMovies();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="w-full absolute z-0 flex-1" resizeMode="cover" />
      <FlatList
        className="p-5"
        data={movies || []}
        numColumns={3}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MovieCard movie={item} />}
        columnWrapperStyle={{
          justifyContent: "flex-start",
          marginBottom: 10,
          gap: 20,

          marginVertical: 10,
        }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        ListEmptyComponent={
          !moviesLoading && !moviesError ? (
            <Text className="text-gray-500 text-center">
              {searchQuery.trim() ? "No movies found" : "Search Movies"}
            </Text>
          ) : null
        }
        ListHeaderComponent={
          <>
            <View className="w-full mt-20 flex-row justify-center">
              <Image source={icons.logo} className=" w-12 h-10" />
            </View>
            <View className="my-5">
              <SearchBar
                value={searchQuery}
                placeholder="Search movies, shows, actors..."
                onChangeText={(text) => setSearchQuery(text)}
              />
            </View>
            {moviesLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            ) : moviesError ? (
              <Text className="text-red-500 p-5">{moviesError.message}</Text>
            ) : null}

            {!moviesLoading && !moviesError && searchQuery.trim() && movies?.length > 0 && (
              <Text className="text-accent text-2xl mt-10">
                {" "}
                Search Results for
                <Text className="text-white"> {searchQuery}</Text>
              </Text>
            )}
          </>
        }
      />
    </View>
  );
};

export default Search;
