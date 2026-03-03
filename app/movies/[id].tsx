import { images } from "@/constants/images";
import useFetch from "@/hooks/useFetch";
import { fetchMovieDetails } from "@/services/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Bookmark, BookmarkCheck } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View, Alert } from "react-native";
import {
  useAddMovieToListMutation,
  useRemoveMovieFromListMutation,
  useGetMyMoviesQuery,
} from "@/store/features/myMovies/myMovies.api";
function Divider() {
  return (
    // flex-row = flexDirection: "row"
    // items-center = alignItems: "center"
    // my-5 = marginVertical: 20
    <View className="flex-row items-center my-5">
      <View style={{ flex: 1, height: 0.5, backgroundColor: "#AB8BFF44" }} />
      <View className="w-1.5 h-1.5 rounded-full bg-accent mx-2" />
      <View style={{ flex: 1, height: 0.5, backgroundColor: "#AB8BFF44" }} />
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <View className="mb-3">
      {/* tracking-widest = wide letter spacing, uppercase = textTransform */}
      <Text className="text-accent text-[9px] font-bold tracking-widest uppercase mb-1.5">{title}</Text>
      <View style={{ height: 0.5, backgroundColor: "#AB8BFF35" }} />
    </View>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    // flex-1 = take equal width, items-center = center children
    <View className="flex-1 items-center">
      <Text className="text-light-100 text-[15px] font-bold">{value}</Text>
      <Text className="text-white text-[9px] tracking-widest mt-1">{label}</Text>
    </View>
  );
}

const MovieDetails = () => {
  const { id } = useLocalSearchParams();
  console.log(id);
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);

  const {
    data: movie,
    loading: movieLoading,
    error: movieError,
  } = useFetch(() => fetchMovieDetails(id as string), true);

  const { data: savedMovies } = useGetMyMoviesQuery({ limit: 1000 });
  const [addMovieToList] = useAddMovieToListMutation();
  const [removeMovieFromList] = useRemoveMovieFromListMutation();

  // Check if movie is already saved
  useEffect(() => {
    if (savedMovies?.data && id) {
      const movieExists = savedMovies.data.find((savedMovie) => savedMovie.movieId === id.toString());
      setIsSaved(!!movieExists);
    }
  }, [savedMovies, id]);

  const handleSaveMovie = async () => {
    if (!movie || !id) return;

    try {
      if (isSaved) {
        // Find the saved movie to get its ID for removal
        const savedMovie = savedMovies?.data?.find((savedMovie) => savedMovie.movieId === id.toString());
        if (savedMovie) {
          await removeMovieFromList(savedMovie.id).unwrap();
          setIsSaved(false);
          Alert.alert("Success", "Movie removed from your saved list");
        }
      } else {
        // Save the movie
        await addMovieToList({
          title: movie.title,
          movieId: id.toString(),
          genre: movie.genres?.map((g: any) => g.name) || [],
          year: movie.release_date ? new Date(movie.release_date).getFullYear() : new Date().getFullYear(),
        }).unwrap();
        setIsSaved(true);
        Alert.alert("Success", "Movie saved to your list");
      }
    } catch (error: any) {
      Alert.alert("Error", error?.data?.message || "Failed to save movie");
    }
  };

  console.log(JSON.stringify(movie));
  if (movieLoading) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" color="#AB8BFF" />
      </View>
    );
  }

  if (movieError || !movie) {
    return (
      <View className="flex-1 bg-primary justify-center items-center px-8">
        <Text className="text-light-100 text-lg font-bold text-center mb-2">Could not load film</Text>
        <Text className="text-light-300 text-[13px] text-center leading-5">
          {movieError?.message ?? "Something went wrong."}
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-6 px-6 py-2.5 border border-accent/50">
          <Text className="text-accent text-[10px] tracking-[4px]">← GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── STEP 4c: Pull out movie fields ──
  const {
    backdrop_path,
    genres,
    original_language,
    overview,
    poster_path,
    production_companies,
    release_date,
    revenue,
    budget,
    runtime,
    status,
    tagline,
    title,
    vote_average,
    vote_count,
  } = movie as MovieDetails;

  const backdropUrl = backdrop_path ? `https://image.tmdb.org/t/p/w1280${backdrop_path}` : null;

  const posterUrl = poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : null;

  const formatYear = (dateString: string) => {
    const date = new Date(dateString);
    return date.getFullYear();
  };

  const formatRuntime = (runtime: number) => {
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return `${hours}h ${minutes}m`;
  };

  const formatScore = (score: number) => {
    return score.toFixed(1);
  };

  const formatVotes = (votes: number) => {
    if (votes >= 1000000) {
      return (votes / 1000000).toFixed(1) + "M";
    } else if (votes >= 1000) {
      return (votes / 1000).toFixed(1) + "K";
    }
    return votes.toString();
  };

  const formatMoney = (amount: number) => {
    return "$" + amount.toLocaleString();
  };

  return (
    <View className="flex flex-1 bg-primary">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero Image */}
        <View className="h-80 overflow-hidden">
          {backdropUrl ? (
            <Image source={{ uri: backdropUrl }} className="absolute w-full h-full" resizeMode="cover" />
          ) : (
            <Image source={images.bg} className="absolute w-full h-full" resizeMode="cover" />
          )}
          <View className="absolute inset-0" style={{ backgroundColor: "#0F0D2355" }} />
          {/* <View className="absolute bottom-0 left-0 right-0 h-28" style={{ backgroundColor: "#03001490" }} /> */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-14 left-5 w-9 h-9 border border-accent/50 justify-center items-center bg-primary/50"
          >
            <ArrowLeft size={20} color="#AB8BFF" />
          </TouchableOpacity>

          {release_date && (
            <View className="absolute top-14 right-5 border border-accent/50 bg-primary/70 px-2.5 py-1.5">
              <Text className="text-accent text-[11px] tracking-widest">{formatYear(release_date)}</Text>
            </View>
          )}
        </View>

        <View className=" px-6 mt-4 gap-5">
          <View className="flex-row items-end mb-5">
            {posterUrl && (
              <Image
                source={{ uri: posterUrl }}
                // mr-4 = marginRight, border border-accent/30 = subtle purple border
                className="w-22 h-32 mr-4 border border-accent/30"
                style={{ width: 88, height: 132 }}
                resizeMode="cover"
              />
            )}
            <View className="flex-1 pb-1">
              {status && (
                // We use style for the dynamic color (green vs purple)
                <Text
                  className="text-[9px] tracking-[3px] uppercase mb-1.5"
                  style={{ color: status === "Released" ? "#7EC8A4" : "#AB8BFF" }}
                >
                  ● {status}
                </Text>
              )}
              <View className="flex-row items-center justify-between">
                <Text className="text-light-100 text-[22px] font-extrabold leading-7 flex-1 pr-3">{title}</Text>
                <TouchableOpacity
                  onPress={handleSaveMovie}
                  className="w-10 h-10 border border-accent/50 justify-center items-center bg-primary/80 rounded"
                >
                  {isSaved ? <BookmarkCheck size={22} color="#AB8BFF" /> : <Bookmark size={22} color="#AB8BFF" />}
                </TouchableOpacity>
              </View>
              <Text className="text-white text-[11px] mt-1.5 tracking-widest">
                {[original_language?.toUpperCase(), runtime ? formatRuntime(runtime) : null]
                  .filter(Boolean)
                  .join("  ·  ")}
              </Text>
            </View>
          </View>

          {/* stats */}
          <View
            className="flex-row py-3.5 mb-1"
            style={{ borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: "#AB8BFF30" }}
          >
            <StatBlock label="RATING" value={`★ ${formatScore(vote_average)}`} />
            <View style={{ width: 0.5, backgroundColor: "#AB8BFF30" }} />
            <StatBlock label="VOTES" value={formatVotes(vote_count)} />
            <View style={{ width: 0.5, backgroundColor: "#AB8BFF30" }} />
            <StatBlock label="RUNTIME" value={runtime ? formatRuntime(runtime) : "N/A"} />
          </View>

          {/* TAGLINE */}
          {!!tagline && (
            <Text className="text-white text-[13px] italic text-center leading-5 py-4">&quot;{tagline}&quot;</Text>
          )}

          {/* GENRES */}
          {genres?.length > 0 && (
            <>
              <Divider />
              <SectionTitle title="GENRE" />
              {/* flex-wrap lets chips go to next line if they don't fit */}
              <View className="flex-row flex-wrap mt-0.5">
                {genres.map((g: { id: number; name: string }) => (
                  <View
                    key={g.id}
                    className="border border-accent/40 px-2.5 py-1 mr-2 mb-2"
                    style={{ backgroundColor: "#221F3D60" }}
                  >
                    <Text className="text-white text-[9px] tracking-[3px] uppercase">{g.name}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* SYNOPSIS */}
          {!!overview && (
            <>
              <Divider />
              <SectionTitle title="SYNOPSIS" />
              <Text className="text-white text-[13px] leading-6 mt-0.5">{overview}</Text>
            </>
          )}

          {/* BOX OFFICE */}
          {(budget > 0 || revenue > 0) && (
            <>
              <Divider />
              <SectionTitle title="BOX OFFICE" />
              <View className="flex-row mt-1 gap-3">
                {budget > 0 && (
                  <View className="flex-1 border border-accent/20 p-3.5" style={{ backgroundColor: "#221F3D40" }}>
                    <Text className="text-white text-[9px] tracking-[3px] uppercase mb-1.5">Budget</Text>
                    <Text className="text-light-100 text-base font-bold">{formatMoney(budget)}</Text>
                  </View>
                )}
                {revenue > 0 && (
                  <View className="flex-1 border border-accent/20 p-3.5" style={{ backgroundColor: "#221F3D40" }}>
                    <Text className="text-white text-[9px] tracking-[3px] uppercase mb-1.5">Revenue</Text>
                    <Text className="text-light-100 text-base font-bold">{formatMoney(revenue)}</Text>
                    {budget > 0 && revenue > budget && (
                      <Text style={{ color: "#7EC8A4" }} className="text-[10px] mt-1">
                        +{formatMoney(revenue - budget)}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </>
          )}

          {/* PRODUCTION COMPANIES */}
          {production_companies?.length > 0 && (
            <>
              <Divider />
              <SectionTitle title="PRODUCTION" />
              {production_companies.slice(0, 5).map((c: { id: number; name: string }, index: number, arr: any[]) => (
                <View
                  key={c.id}
                  className="flex-row items-center py-2.5"
                  style={{
                    borderBottomWidth: index < arr.length - 1 ? 0.5 : 0,
                    borderColor: "#AB8BFF20",
                  }}
                >
                  <View className="w-1 h-1 bg-accent mr-3" />
                  <Text className="text-white text-[13px]">{c.name}</Text>
                </View>
              ))}
            </>
          )}

          {/* Closing ornament */}
          <Divider />
          <Text className="text-center pb-12 pt-1 text-base tracking-[10px]" style={{ color: "#AB8BFF40" }}>
            ✦ ✦ ✦
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default MovieDetails;
