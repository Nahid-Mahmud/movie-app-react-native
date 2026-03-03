import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useGetMyMoviesQuery, useRemoveMovieFromListMutation } from "@/store/features/myMovies/myMovies.api";
import { Link, useRouter } from "expo-router";
import { Trash2, Calendar, PlayCircle, LogIn } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface SavedMovieCardProps {
  movie: MyMovie;
  onRemove: (movieId: string) => void;
}

const SavedMovieCard = ({ movie, onRemove }: SavedMovieCardProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [removing, setRemoving] = useState(false);

  const handleRemove = () => {
    Alert.alert("Remove Movie", `Are you sure you want to remove "${movie.title}" from your saved list?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => onRemove(movie.id),
      },
    ]);
  };

  return (
    <View className="bg-secondary/30 border border-accent/20 rounded-xl p-4 mb-4 mx-1">
      <View className="flex-row">
        {/* Movie Info */}
        <View className="flex-1">
          <Text className="text-light-100 text-lg font-bold mb-2" numberOfLines={2}>
            {movie.title}
          </Text>

          <View className="flex-row items-center mb-2">
            <Calendar size={14} color="#AB8BFF" />
            <Text className="text-white text-sm ml-2">{movie.year}</Text>
          </View>

          {movie.genre.length > 0 && (
            <View className="flex-row flex-wrap mb-3">
              {movie.genre.slice(0, 3).map((genre, index) => (
                <View
                  key={index}
                  className="border border-accent/40 px-2 py-1 mr-2 mb-1"
                  style={{ backgroundColor: "#221F3D60" }}
                >
                  <Text className="text-white text-[10px] tracking-[2px] uppercase">{genre}</Text>
                </View>
              ))}
              {movie.genre.length > 3 && (
                <Text className="text-accent text-[10px] self-center">+{movie.genre.length - 3} more</Text>
              )}
            </View>
          )}

          <Text className="text-light-300 text-xs">Saved on {new Date(movie.createdAt).toLocaleDateString()}</Text>
        </View>

        {/* Action Buttons */}
        <View className="ml-4 justify-between items-end">
          <TouchableOpacity
            onPress={handleRemove}
            disabled={removing}
            className="w-8 h-8 justify-center items-center border border-red-500/50 bg-red-500/20 rounded"
          >
            {removing ? <ActivityIndicator size="small" color="#EF4444" /> : <Trash2 size={16} color="#EF4444" />}
          </TouchableOpacity>

          <Link href={`/movies/${movie.movieId}`} asChild>
            <TouchableOpacity className="w-8 h-8 justify-center items-center border border-accent/50 bg-accent/20 rounded mt-2">
              <PlayCircle size={16} color="#AB8BFF" />
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
};

const Saved = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Check authentication status
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const {
    data: savedMoviesResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetMyMoviesQuery(
    { limit: 100 },
    {
      skip: !isAuthenticated, // Skip query if not authenticated
    },
  );

  const [removeMovieFromList] = useRemoveMovieFromListMutation();

  const savedMovies = savedMoviesResponse?.data || [];

  const handleRefresh = async () => {
    if (!isAuthenticated) return; // Don't refresh if not authenticated

    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleRemoveMovie = async (movieId: string) => {
    try {
      await removeMovieFromList(movieId).unwrap();
      Alert.alert("Success", "Movie removed from your saved list");
    } catch (error: any) {
      Alert.alert("Error", error?.data?.message || "Failed to remove movie");
    }
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-8">
      <Image source={icons.logo} className="w-16 h-12 mb-6 opacity-50" resizeMode="contain" />
      <Text className="text-light-100 text-xl font-bold text-center mb-3">No Saved Movies</Text>
      <Text className="text-light-300 text-center leading-6 mb-8">
        Start saving your favorite movies to watch later. Tap the bookmark icon on any movie details page.
      </Text>
      <View className="w-full max-w-xs">
        <Text className="text-center pb-4 pt-1 text-base tracking-[8px]" style={{ color: "#AB8BFF40" }}>
          ✦ ✦ ✦
        </Text>
      </View>
    </View>
  );

  const renderLoginPrompt = () => (
    <View className="flex-1 justify-center items-center px-8">
      <Image source={icons.logo} className="w-20 h-16 mb-8 opacity-70" resizeMode="contain" />
      <LogIn size={48} color="#AB8BFF" style={{ marginBottom: 24 }} />
      <Text className="text-light-100 text-2xl font-bold text-center mb-4">Log In Required</Text>
      <Text className="text-light-300 text-center leading-6 mb-8">
        Log in to see your saved movies list and access your personalized collection.
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/(auth)/login")}
        className="bg-accent px-8 py-4 rounded-xl border border-accent/30 mb-4"
      >
        <Text className="text-white text-base font-semibold tracking-[2px] uppercase">Log In</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
        <Text className="text-accent text-sm">Don&apos;t have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-primary">
        <Image source={images.bg} className="w-full absolute z-0" />
        {renderLoginPrompt()}
      </View>
    );
  }

  // Show loading indicator only when authenticated and initially loading (not refreshing)
  if (isAuthenticated && isLoading && !refreshing) {
    return (
      <View className="flex-1 bg-primary">
        <Image source={images.bg} className="w-full absolute z-0" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#AB8BFF" />
          <Text className="text-light-300 text-sm mt-4">Loading your saved movies...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-primary justify-center items-center px-8">
        <Text className="text-light-100 text-lg font-bold text-center mb-2">Could not load saved movies</Text>
        <Text className="text-light-300 text-[13px] text-center leading-5 mb-6">
          {(error as any)?.message ?? "Something went wrong."}
        </Text>
        <TouchableOpacity onPress={handleRefresh} className="px-6 py-2.5 border border-accent/50 bg-accent/20">
          <Text className="text-accent text-[11px] tracking-[3px] uppercase">TRY AGAIN</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="w-full absolute z-0" />

      <FlatList
        className="flex-1"
        data={savedMovies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SavedMovieCard movie={item} onRemove={handleRemoveMovie} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 100,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || (isFetching && !isLoading)}
            onRefresh={handleRefresh}
            tintColor="#AB8BFF"
            colors={["#AB8BFF"]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={
          <>
            <Image source={icons.logo} className="size-20 mt-20 mb-8 mx-auto self-center w-12 h-10" />
            <Text className="text-white text-2xl font-bold mb-2 text-center">Saved Movies</Text>
            <Text className="text-light-300 text-center mb-6 leading-5">
              Your curated collection of movies to watch
            </Text>
            {savedMovies.length > 0 && (
              <>
                <View className="flex-row items-center mb-6">
                  <View style={{ flex: 1, height: 0.5, backgroundColor: "#AB8BFF44" }} />
                  <Text className="text-accent text-xs font-bold px-4 tracking-widest">
                    {savedMovies.length} MOVIE{savedMovies.length !== 1 ? "S" : ""}
                  </Text>
                  <View style={{ flex: 1, height: 0.5, backgroundColor: "#AB8BFF44" }} />
                </View>
              </>
            )}
          </>
        }
      />
    </View>
  );
};

export default Saved;
